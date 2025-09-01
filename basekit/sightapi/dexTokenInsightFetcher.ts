import fetch from "node-fetch"

export interface DexTokenInsight {
  symbol: string
  mint: string
  liquidityUSD: number
  priceUSD: number
  fdvUSD: number
  volume24hUSD: number
  txns24h: number
  holders: number
  lastUpdated: number
  categories: string[]
}

const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex/tokens"

export async function dexTokenInsightFetcher(mint: string): Promise<DexTokenInsight | null> {
  const url = `${DEXSCREENER_API}/${mint}`

  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error("[dexTokenInsightFetcher] Bad response:", res.status, res.statusText)
      return null
    }
    const json = await res.json()

    const data = json.pairs?.[0]
    if (!data) return null

    return {
      symbol: data.baseToken?.symbol ?? "",
      mint: data.baseToken?.address ?? mint,
      liquidityUSD: Number(data.liquidity?.usd ?? 0),
      priceUSD: Number(data.priceUsd ?? 0),
      fdvUSD: Number(data.fdv ?? 0),
      volume24hUSD: Number(data.volume?.h24 ?? 0),
      txns24h: Number(data.txns?.h24?.buys ?? 0) + Number(data.txns?.h24?.sells ?? 0),
      holders: Number(data.holders ?? 0),
      lastUpdated: Date.now(),
      categories: Array.isArray(data.categories) ? data.categories : []
    }
  } catch (err: any) {
    console.error("[dexTokenInsightFetcher] Failed to fetch token:", err.message ?? err)
    return null
  }
}
