interface TokenMetric {
  mint: string
  priceChange24h: number
  liquidityUSD: number
  holderCount: number
}

export function tokenInsightAnalyzer(data: TokenMetric): string {
  const { priceChange24h, liquidityUSD, holderCount } = data

  if (liquidityUSD < 1000) return "High Risk: Illiquid"
  if (priceChange24h < -30) return "Warning: Sharp price drop"
  if (holderCount < 50) return "Unstable: Low holder distribution"

  return "Stable"
}
