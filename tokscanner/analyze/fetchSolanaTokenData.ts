import fetch from "node-fetch"

export interface SolanaTokenInfo {
  mint: string
  decimals: number
  supply: number
  ownerCount: number
  creationTime: number
}

const SOLANA_RPC = "https://api.mainnet-beta.solana.com"

export async function fetchSolanaTokenData(mint: string): Promise<SolanaTokenInfo | null> {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "getTokenSupply",
    params: [mint]
  }

  const res = await fetch(SOLANA_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })

  const json = await res.json()
  if (!json?.result) return null

  const supply = parseInt(json.result.value.amount)
  const decimals = json.result.value.decimals

  const ownerCount = await fetchOwnerCount(mint)
  const creationTime = await fetchCreationTime(mint)

  return {
    mint,
    supply,
    decimals,
    ownerCount,
    creationTime
  }
}

async function fetchOwnerCount(mint: string): Promise<number> {
  // Placeholder logic — in production use `getTokenLargestAccounts` and holder parsing
  return Math.floor(Math.random() * 150 + 10)
}

async function fetchCreationTime(mint: string): Promise<number> {
  // Placeholder logic — Solana doesn’t expose creation block easily
  return Date.now() - Math.floor(Math.random() * 10_000_000_000)
}
