export interface VectorSnapshot {
  token: string
  vector: number[]
  source: string
  timestamp: number
}

export class TemporalVectorPool {
  private storage: VectorSnapshot[] = []

  insert(snapshot: VectorSnapshot): void {
    this.storage.push(snapshot)
  }

  queryRecent(token: string, withinMs: number): VectorSnapshot[] {
    const now = Date.now()
    return this.storage.filter(
      (s) => s.token === token && now - s.timestamp <= withinMs
    )
  }

  getWindow(token: string, count: number): VectorSnapshot[] {
    return this.storage
      .filter((s) => s.token === token)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count)
  }

  removeOlderThan(msAgo: number): void {
    const cutoff = Date.now() - msAgo
    this.storage = this.storage.filter((s) => s.timestamp >= cutoff)
  }

  computeAggregate(token: string): number[] | null {
    const vectors = this.storage
      .filter((s) => s.token === token)
      .map((s) => s.vector)

    if (vectors.length === 0) return null

    const length = vectors[0].length
    const sum = Array(length).fill(0)

    for (const v of vectors) {
      for (let i = 0; i < length; i++) {
        sum[i] += v[i]
      }
    }

    return sum.map((x) => x / vectors.length)
  }

  clear(): void {
    this.storage = []
  }
}
