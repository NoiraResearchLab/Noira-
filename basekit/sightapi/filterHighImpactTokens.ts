import { DexPair } from "./activeDexPairsFetcher"

export interface HighImpactToken {
  symbol: string
  mint: string
  volume24hUSD: number
  liquidityUSD: number
  impactIndex: number
}

export function filterHighImpactTokens(pairs: DexPair[], threshold: number = 0.3): HighImpactToken[] {
  const result: HighImpactToken[] = []

  for (const pair of pairs) {
    if (pair.liquidityUSD === 0) continue

    const impactIndex = pair.volume24hUSD / pair.liquidityUSD
    if (impactIndex > threshold) {
      result.push({
        symbol: pair.baseSymbol,
        mint: pair.baseMint,
        volume24hUSD: pair.volume24hUSD,
        liquidityUSD: pair.liquidityUSD,
        impactIndex: Math.round(impactIndex * 1000) / 1000
      })
    }
  }

  return result
}
