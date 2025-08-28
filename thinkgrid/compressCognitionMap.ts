// Types for cognition vectors and compression output
export interface CognitionVector {
  token: string
  vector: number[]
  timestamp: number
}

export interface CompressedPattern {
  token: string
  centroid: number[]
  density: number
  snapshotCount: number
  // new — extra diagnostics to tune thresholds upstream
  stats: {
    dim: number
    meanDistance: number
    maxDistance: number
    minDistance: number
    stdDistance: number
    spread: number // = maxDistance - minDistance
    radiusP90: number // 90th percentile distance
  }
}

export type DistanceFn = (a: number[], b: number[]) => number

export interface CognitionCompressorOptions {
  /** Minimum snapshots to include a pattern */
  minSnapshots?: number
  /** Custom distance function */
  distanceFn?: DistanceFn
  /**
   * Normalize each input vector to unit L2 before aggregation
   * Use when comparing embeddings with varying magnitude
   */
  l2Normalize?: boolean
  /**
   * Deterministic outlier trimming based on distance quantiles
   * Keep central band [trimLowerQuantile, trimUpperQuantile]
   * Example: { trimLowerQuantile: 0.05, trimUpperQuantile: 0.95 }
   */
  trimLowerQuantile?: number
  trimUpperQuantile?: number
  /**
   * Optional deterministic weight by recency
   * Newer snapshots get higher weight without randomness
   * weight = 1 + recencyWeight * normalizedAge where age ∈ [0,1]
   * Set to 0 to disable
   */
  recencyWeight?: number
  /** Hooks for instrumentation */
  hooks?: {
    onBeforeCompress?: (token: string, vectors: CognitionVector[]) => void
    onAfterCompress?: (pattern: CompressedPattern) => void
    onError?: (token: string, error: Error) => void
  }
}

/** Default Euclidean distance */
const defaultDistance: DistanceFn = (a, b) => {
  if (a.length !== b.length) throw new Error("Vector dimension mismatch")
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i]
    sum += d * d
  }
  return Math.sqrt(sum)
}

export function compressCognitionMap(
  vectors: CognitionVector[],
  opts: CognitionCompressorOptions = {}
): CompressedPattern[] {
  const {
    minSnapshots = 1,
    distanceFn = defaultDistance,
    l2Normalize = false,
    trimLowerQuantile,
    trimUpperQuantile,
    recencyWeight = 0,
    hooks = {},
  } = opts

  if (!Array.isArray(vectors)) throw new Error("vectors must be an array")

  const grouped = new Map<string, CognitionVector[]>()
  for (const v of vectors) {
    validateVector(v)
    if (!grouped.has(v.token)) grouped.set(v.token, [])
    grouped.get(v.token)!.push(v)
  }

  const results: CompressedPattern[] = []
  for (const [token, groupRaw] of grouped.entries()) {
    if (groupRaw.length < minSnapshots) continue

    try {
      hooks.onBeforeCompress?.(token, groupRaw)

      // deterministic preprocessing
      // sort by timestamp to make recency weighting reproducible
      const group = [...groupRaw].sort((a, b) => a.timestamp - b.timestamp)

      const processed = group.map((g) => ({
        token: g.token,
        timestamp: g.timestamp,
        vector: l2Normalize ? normalizeL2(g.vector) : g.vector.slice(),
      }))

      const mat = processed.map((p) => p.vector)
      const dim = ensureSameDim(mat)

      // compute deterministic weights if enabled
      const weights = computeRecencyWeights(processed.map((p) => p.timestamp), recencyWeight)

      // weighted centroid
      const centroid = computeWeightedCentroid(mat, weights)

      // distances to centroid
      const distances = mat.map((v) => distanceFn(v, centroid))

      // optional trimming by quantiles, then recompute centroid on kept set
      const keepMask = buildTrimMask(distances, trimLowerQuantile, trimUpperQuantile)
      const keptVectors = mat.filter((_, i) => keepMask[i])
      const keptWeights = weights.filter((_, i) => keepMask[i])

      const finalCentroid =
        keptVectors.length > 0 ? computeWeightedCentroid(keptVectors, keptWeights) : centroid

      const finalDistances = mat.map((v) => distanceFn(v, finalCentroid))
      const stats = summarizeDistances(finalDistances, dim)

      // density kept compatible with original semantics while staying in [0,1]
      // original used max(0, 1 - avgDist)
      const density = clamp01(1 - stats.meanDistance)

      const pattern: CompressedPattern = {
        token,
        centroid: finalCentroid,
        density,
        snapshotCount: group.length,
        stats,
      }

      hooks.onAfterCompress?.(pattern)
      results.push(pattern)
    } catch (err: any) {
      hooks.onError?.(token, err instanceof Error ? err : new Error(String(err)))
    }
  }

  return results
}

// helpers

function validateVector(v: CognitionVector): void {
  if (!v || typeof v !== "object") throw new Error("invalid vector object")
  if (typeof v.token !== "string" || !v.token) throw new Error("token must be non-empty string")
  if (!Array.isArray(v.vector) || v.vector.length === 0) throw new Error("vector must be a non-empty array")
  if (!v.vector.every((x) => Number.isFinite(x))) throw new Error("vector must contain finite numbers")
  if (!Number.isFinite(v.timestamp)) throw new Error("timestamp must be finite number")
}

function ensureSameDim(vectors: number[][]): number {
  if (vectors.length === 0) throw new Error("no vectors to process")
  const d = vectors[0].length
  for (let i = 1; i < vectors.length; i++) {
    if (vectors[i].length !== d) throw new Error("inconsistent vector dimensions")
  }
  return d
}

function normalizeL2(vec: number[]): number[] {
  let norm2 = 0
  for (let i = 0; i < vec.length; i++) norm2 += vec[i] * vec[i]
  if (norm2 === 0) return vec.slice()
  const inv = 1 / Math.sqrt(norm2)
  return vec.map((x) => x * inv)
}

function computeWeightedCentroid(vectors: number[][], weights: number[]): number[] {
  const n = vectors.length
  if (n === 0) return []
  const d = vectors[0].length
  if (weights.length !== n) throw new Error("weights length mismatch")

  let wsum = 0
  const acc = new Array(d).fill(0) as number[]
  for (let i = 0; i < n; i++) {
    const w = weights[i]
    wsum += w
    const v = vectors[i]
    for (let j = 0; j < d; j++) acc[j] += v[j] * w
  }
  if (wsum === 0) return vectors[0].slice()
  for (let j = 0; j < d; j++) acc[j] /= wsum
  return acc
}

function computeRecencyWeights(timestamps: number[], recencyWeight: number): number[] {
  const n = timestamps.length
  if (n === 0 || recencyWeight <= 0) return new Array(n).fill(1)

  const minT = timestamps[0]
  const maxT = timestamps[n - 1]
  const span = Math.max(1, maxT - minT)

  // normalized age ∈ [0,1], newer → larger age
  const ages = timestamps.map((t) => (t - minT) / span)
  // deterministic linear uplift
  return ages.map((a) => 1 + recencyWeight * a)
}

function buildTrimMask(
  distances: number[],
  qLow?: number,
  qHigh?: number
): boolean[] {
  const n = distances.length
  if (!n) return []
  const low = qLow ?? 0
  const high = qHigh ?? 1
  if (low <= 0 && high >= 1) return new Array(n).fill(true)
  if (!(low >= 0 && low < 1 && high > 0 && high <= 1 && low < high)) {
    throw new Error("invalid trim quantiles")
  }

  // compute quantile thresholds deterministically
  const sorted = [...distances].sort((a, b) => a - b)
  const q = (p: number) => {
    if (p <= 0) return sorted[0]
    if (p >= 1) return sorted[sorted.length - 1]
    const idx = p * (sorted.length - 1)
    const lo = Math.floor(idx)
    const hi = Math.ceil(idx)
    const frac = idx - lo
    // linear interpolation, deterministic
    return sorted[lo] * (1 - frac) + sorted[hi] * frac
  }

  const tLow = q(low)
  const tHigh = q(high)
  return distances.map((d) => d >= tLow && d <= tHigh)
}

function summarizeDistances(distances: number[], dim: number) {
  const n = distances.length
  if (!n) {
    return {
      dim,
      meanDistance: 0,
      maxDistance: 0,
      minDistance: 0,
      stdDistance: 0,
      spread: 0,
      radiusP90: 0,
    }
  }

  let sum = 0
  let sumSq = 0
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const d of distances) {
    sum += d
    sumSq += d * d
    if (d < min) min = d
    if (d > max) max = d
  }
  const mean = sum / n
  const variance = Math.max(0, sumSq / n - mean * mean)
  const std = Math.sqrt(variance)

  const p90 = percentile(distances, 0.9)

  return {
    dim,
    meanDistance: mean,
    maxDistance: max,
    minDistance: min,
    stdDistance: std,
    spread: max - min,
    radiusP90: p90,
  }
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const s = [...values].sort((a, b) => a - b)
  if (p <= 0) return s[0]
  if (p >= 1) return s[s.length - 1]
  const idx = p * (s.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  const frac = idx - lo
  return s[lo] * (1 - frac) + s[hi] * frac
}

function clamp01(x: number): number {
  if (x < 0) return 0
  if (x > 1) return 1
  return x
}
