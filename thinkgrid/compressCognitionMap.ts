interface CognitionVector {
  token: string
  vector: number[]
  timestamp: number
}

export interface CompressedPattern {
  token: string
  centroid: number[]
  density: number
  snapshotCount: number
}

export interface CognitionCompressorOptions {
  /** Minimum snapshots to include a pattern */
  minSnapshots?: number
  /** Custom distance function */
  distanceFn?: (a: number[], b: number[]) => number
  /** Hooks for instrumentation */
  hooks?: {
    onBeforeCompress?: (token: string, vectors: CognitionVector[]) => void
    onAfterCompress?: (pattern: CompressedPattern) => void
    onError?: (token: string, error: Error) => void
  }
}

/** Default Euclidean distance */
const defaultDistance = (a: number[], b: number[]): number =>
  Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0))

export function compressCognitionMap(
  vectors: CognitionVector[],
  opts: CognitionCompressorOptions = {}
): CompressedPattern[] {
  const {
    minSnapshots = 1,
    distanceFn = defaultDistance,
    hooks = {},
  } = opts

  const grouped = new Map<string, CognitionVector[]>()
  for (const v of vectors) {
    if (!grouped.has(v.token)) grouped.set(v.token, [])
    grouped.get(v.token)!.push(v)
  }

  const results: CompressedPattern[] = []
  for (const [token, group] of grouped.entries()) {
    if (group.length < minSnapshots) continue

    try {
      hooks.onBeforeCompress?.(token, group)
      const matrix = group.map(v => v.vector)
      const centroid = computeCentroid(matrix)
      const density = computeDensity(matrix, centroid, distanceFn)

      const pattern: CompressedPattern = {
        token,
        centroid,
        density,
        snapshotCount: group.length,
      }

      hooks.onAfterCompress?.(pattern)
      results.push(pattern)
    } catch (err: any) {
      hooks.onError?.(token, err)
    }
  }

  return results
}

function computeCentroid(vectors: number[][]): number[] {
  if (vectors.length === 0) return []
  const dim = vectors[0].length
  const sum = Array(dim).fill(0)
  for (const v of vectors) {
    if (v.length !== dim) throw new Error("Inconsistent vector dimensions")
    for (let i = 0; i < dim; i++) sum[i] += v[i]
  }
  return sum.map(s => s / vectors.length)
}

function computeDensity(
  vectors: number[][],
  center: number[],
  distanceFn: (a: number[], b: number[]) => number
): number {
  if (vectors.length === 0) return 0
  const total = vectors.reduce((acc, v) => acc + distanceFn(v, center), 0)
  const avgDist = total / vectors.length
  return Math.max(0, 1 - avgDist)
}
