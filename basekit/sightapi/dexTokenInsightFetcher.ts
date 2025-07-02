import fetch from "node-fetch"

export interface DexTokenInsight {
  symbol: string
  mint: string
  liquidityUSD: number
  priceUSD: number
  holders: number
  lastUpdated: number
  categories: string[]
}

const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex/tokens"

export async function dexTokenInsightFetcher(mint: string): Promise<DexTokenInsight | null> {
  const url = `${DEXSCREENER_API}/${mint}`

  try {
    const res = await fetch(url)
    const json = await res.json()

    const data = json.pairs?.[0]
    if (!data) return null

    return {
      symbol: data.baseToken.symbol,
      mint: data.baseToken.address,
      liquidityUSD: parseFloat(data.liquidity.usd),
      priceUSD: parseFloat(data.priceUsd),
      holders: parseInt(data.holders ?? "0"),
      lastUpdated: Date.now(),
      categories: [] 
    }
  } catch (err) {
    console.error("[dexTokenInsightFetcher] Failed to fetch token:", err)
    return null
  }
}
