interface CognitionVector {
  token: string
  vector: number[]
  timestamp: number
}

interface CompressedPattern {
  token: string
  centroid: number[]
  density: number
  snapshotCount: number
}

export function compressCognitionMap(vectors: CognitionVector[]): CompressedPattern[] {
  const grouped = new Map<string, CognitionVector[]>()

  for (const v of vectors) {
    if (!grouped.has(v.token)) grouped.set(v.token, [])
    grouped.get(v.token)!.push(v)
  }

  const results: CompressedPattern[] = []

  for (const [token, group] of grouped.entries()) {
    const centroid = computeCentroid(group.map(v => v.vector))
    const density = computeDensity(group.map(v => v.vector), centroid)

    results.push({
      token,
      centroid,
      density,
      snapshotCount: group.length
    })
  }

  return results
}

function computeCentroid(vectors: number[][]): number[] {
  const length = vectors[0].length
  const sum = Array(length).fill(0)

  for (const vec of vectors) {
    for (let i = 0; i < length; i++) {
      sum[i] += vec[i]
    }
  }

  return sum.map(v => v / vectors.length)
}

function computeDensity(vectors: number[][], center: number[]): number {
  const totalDist = vectors.reduce((acc, v) => acc + euclidean(v, center), 0)
  return Math.max(0, 1 - totalDist / vectors.length)
}

function euclidean(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0))
}
