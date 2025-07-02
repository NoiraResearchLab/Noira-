export interface PatternSnapshot {
  token: string
  vector: number[]
  label: string
  timestamp: number
}

export class PatternMemoryMatrix {
  private memory: PatternSnapshot[] = []

  add(snapshot: PatternSnapshot): void {
    this.memory.push(snapshot)
  }

  getRecent(token: string, count: number = 5): PatternSnapshot[] {
    return this.memory
      .filter(s => s.token === token)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count)
  }

  computeTrendShift(token: string): number {
    const recent = this.getRecent(token, 3)
    if (recent.length < 3) return 0

    const [a, b, c] = recent
    const dist1 = this.euclidean(a.vector, b.vector)
    const dist2 = this.euclidean(b.vector, c.vector)

    return dist2 - dist1
  }

  private euclidean(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) return 0
    return Math.sqrt(v1.reduce((sum, val, i) => sum + (val - v2[i]) ** 2, 0))
  }
}
