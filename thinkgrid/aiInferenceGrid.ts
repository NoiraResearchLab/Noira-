import { PatternSnapshot } from "./patternMemoryMatrix"

export interface GridInferenceResult {
  token: string
  coherence: number    // ∈ [0,1], higher = more stable
  instabilityScore: number
  isAnomalous: boolean
}

export interface GridInferenceOptions {
  /** Minimum snapshots required */
  minSnapshots?: number
  /** Z‑score threshold for anomaly detection (default: 0.6) */
  anomalyThreshold?: number
  /** Hooks for instrumentation */
  hooks?: {
    onBeforeInfer?: (token: string, snapshots: PatternSnapshot[]) => void
    onAfterInfer?: (result: GridInferenceResult) => void
    onError?: (token: string, error: Error) => void
  }
}

/** Simple structured logger */
const logger = {
  info: (msg: string, meta: any = {}) =>
    console.log({ level: "info", timestamp: new Date().toISOString(), msg, ...meta }),
  warn: (msg: string, meta: any = {}) =>
    console.warn({ level: "warn", timestamp: new Date().toISOString(), msg, ...meta }),
  error: (msg: string, meta: any = {}) =>
    console.error({ level: "error", timestamp: new Date().toISOString(), msg, ...meta }),
}

/**
 * Infers stability/anomaly of a token’s pattern snapshots over time.
 */
export function inferGridAnomaly(
  snapshots: PatternSnapshot[],
  opts: GridInferenceOptions = {}
): GridInferenceResult {
  const {
    minSnapshots = 2,
    anomalyThreshold = 0.6,
    hooks = {}
  } = opts

  const token = snapshots[0]?.token || "unknown"
  try {
    hooks.onBeforeInfer?.(token, snapshots)

    if (snapshots.length < minSnapshots) {
      logger.warn("Not enough snapshots, returning defaults", { token, count: snapshots.length })
      const result: GridInferenceResult = { token, coherence: 0, instabilityScore: 0, isAnomalous: false }
      hooks.onAfterInfer?.(result)
      return result
    }

    // compute pairwise deltas
    const deltas: number[] = []
    for (let i = 1; i < snapshots.length; i++) {
      deltas.push(computeDelta(snapshots[i - 1].vector, snapshots[i].vector))
    }

    const mean = average(deltas)
    const stddev = standardDeviation(deltas, mean)
    const isAnomalous = stddev > anomalyThreshold
    const coherence = Math.max(0, 1 - normalize(stddev, anomalyThreshold))

    const result: GridInferenceResult = { token, coherence, instabilityScore: stddev, isAnomalous }
    logger.info("Inference result", result)
    hooks.onAfterInfer?.(result)
    return result

  } catch (err: any) {
    logger.error("Error during inference", { token, error: err.message })
    hooks.onError?.(token, err)
    // On error, return safe default
    return { token, coherence: 0, instabilityScore: 0, isAnomalous: false }
  }
}

/** Euclidean distance between two vectors */
function computeDelta(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("Vector dimension mismatch")
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0))
}

/** Arithmetic mean */
function average(arr: number[]): number {
  return arr.reduce((sum, v) => sum + v, 0) / arr.length
}

/** Standard deviation */
function standardDeviation(arr: number[], mean: number): number {
  return Math.sqrt(arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length)
}

/**
 * Normalize a value so that threshold → 1, values beyond scale linearly.
 * For x ≤ scale: x/scale; for x>scale: >1
 */
function normalize(x: number, scale: number): number {
  return x / scale
}
