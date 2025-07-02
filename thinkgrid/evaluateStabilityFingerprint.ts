interface StabilitySnapshot {
  token: string
  vector: number[]
  timeDeltaSec: number
}

interface StabilityFingerprint {
  token: string
  volatilityIndex: number
  symmetryScore: number
  trustRating: "High" | "Medium" | "Low"
}

export function evaluateStabilityFingerprint(data: StabilitySnapshot[]): StabilityFingerprint {
  const token = data[0]?.token || "unknown"

  const changes: number[] = []
  for (let i = 1; i < data.length; i++) {
    const delta = computeDelta(data[i - 1].vector, data[i].vector)
    changes.push(delta / data[i].timeDeltaSec)
  }

  const volatility = average(changes)
  const symmetry = computeSymmetryScore(data.map(d => d.vector))
  const trust = classify(volatility, symmetry)

  return {
    token,
    volatilityIndex: round(volatility),
    symmetryScore: round(symmetry),
    trustRating: trust
  }
}

function computeDelta(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0))
}

function computeSymmetryScore(vectors: number[][]): number {
  if (vectors.length < 2) return 0
  let total = 0
  for (let i = 1; i < vectors.length; i++) {
    total += vectors[i].map((v, j) => Math.abs(v - vectors[i - 1][j])).reduce((a, b) => a + b, 0)
  }
  return 1 - total / (vectors.length * vectors[0].length)
}

function classify(vol: number, sym: number): "High" | "Medium" | "Low" {
  if (vol < 0.1 && sym > 0.9) return "High"
  if (vol < 0.3 && sym > 0.7) return "Medium"
  return "Low"
}

function average(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
