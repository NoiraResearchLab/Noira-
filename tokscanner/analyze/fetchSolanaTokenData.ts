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
  try {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenSupply",
      params: [mint],
    }

    const res = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const json = await res.json()
    if (!json?.result?.value) return null

    const supply = parseInt(json.result.value.amount, 10)
    const decimals = json.result.value.decimals

    const ownerCount = await fetchOwnerCount(mint)
    const creationTime = await fetchCreationTime(mint)

    return {
      mint,
      supply,
      decimals,
      ownerCount,
      creationTime,
    }
  } catch (err) {
    console.error("Failed to fetch token data:", err)
    return null
  }
}

async function fetchOwnerCount(mint: string): Promise<number> {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "getTokenLargestAccounts",
    params: [mint],
  }

  const res = await fetch(SOLANA_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const json = await res.json()
  const accounts = json?.result?.value ?? []
  return accounts.length
}

async function fetchCreationTime(mint: string): Promise<number> {
  // Approximate creation time by fetching the oldest transaction
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "getSignaturesForAddress",
    params: [mint, { limit: 1, before: undefined }],
  }

  const res = await fetch(SOLANA_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
