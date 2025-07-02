import fetch from "node-fetch"

export interface DexPair {
  baseSymbol: string
  baseMint: string
  quoteSymbol: string
  liquidityUSD: number
  volume24hUSD: number
  pairAddress: string
}

export async function activeDexPairsFetcher(): Promise<DexPair[]> {
  const url = "https://api.dexscreener.com/latest/dex/pairs/solana"

  try {
    const res = await fetch(url)
    const json = await res.json()

    const pairs: DexPair[] = json.pairs.map((p: any) => ({
      baseSymbol: p.baseToken.symbol,
      baseMint: p.baseToken.address,
      quoteSymbol: p.quoteToken.symbol,
      liquidityUSD: parseFloat(p.liquidity.usd),
      volume24hUSD: parseFloat(p.volume.h24),
      pairAddress: p.pairAddress
    }))

    return pairs
  } catch (err) {
    console.error("[activeDexPairsFetcher] Failed to fetch pairs:", err)
    return []
  }
}
