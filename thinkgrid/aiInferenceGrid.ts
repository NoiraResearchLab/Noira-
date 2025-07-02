import { PatternSnapshot } from "./patternMemoryMatrix"

interface GridInferenceResult {
  token: string
  coherence: number
  instabilityScore: number
  isAnomalous: boolean
}

export function inferGridAnomaly(snapshots: PatternSnapshot[]): GridInferenceResult {
  if (snapshots.length < 2) {
    return {
      token: snapshots[0]?.token || "unknown",
      coherence: 0,
      instabilityScore: 0,
      isAnomalous: false
    }
  }

  const deltas: number[] = []
  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1]
    const curr = snapshots[i]
    const delta = computeDelta(prev.vector, curr.vector)
    deltas.push(delta)
  }

  const avg = average(deltas)
  const stddev = standardDeviation(deltas, avg)
  const isAnomalous = stddev > 0.6

  return {
    token: snapshots[0].token,
    coherence: Math.max(0, 1 - stddev),
    instabilityScore: stddev,
    isAnomalous
  }
}

function computeDelta(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0))
}

function average(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function standardDeviation(arr: number[], mean: number): number {
  const variance = arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length
  return Math.sqrt(variance)
}
