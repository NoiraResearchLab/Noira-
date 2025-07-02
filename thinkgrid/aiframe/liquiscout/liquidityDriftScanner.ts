interface LiquidityPoint {
  token: string
  timestamp: number
  liquidityUSD: number
}

interface DriftResult {
  token: string
  driftRate: number
  warning: boolean
}

export function scanLiquidityDrift(data: LiquidityPoint[]): DriftResult[] {
  const grouped = new Map<string, LiquidityPoint[]>()

  for (const point of data) {
    if (!grouped.has(point.token)) grouped.set(point.token, [])
    grouped.get(point.token)!.push(point)
  }

  const result: DriftResult[] = []

  for (const [token, points] of grouped.entries()) {
    const sorted = points.sort((a, b) => a.timestamp - b.timestamp)
    const first = sorted[0].liquidityUSD
    const last = sorted[sorted.length - 1].liquidityUSD

    const change = (last - first) / (first || 1)
    const driftRate = Math.round(change * 10000) / 100
    const warning = Math.abs(driftRate) > 20

    result.push({ token, driftRate, warning })
  }

  return result
}
