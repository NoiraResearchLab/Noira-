export interface TokenIndicators {
  liquidityUSD: number
  holderCount: number
  txPerHour: number
  flaggedWallets: number
}

export interface RiskScoreResult {
  score: number
  level: "Low" | "Moderate" | "High"
  tags: string[]
}

export function computeRiskScore(input: TokenIndicators): RiskScoreResult {
  const tags: string[] = []
  let score = 0

  if (input.liquidityUSD < 1000) {
    score += 25
    tags.push("Low Liquidity")
  }

  if (input.holderCount < 50) {
    score += 20
    tags.push("Low Distribution")
  }

  if (input.txPerHour < 2) {
    score += 15
    tags.push("Low Activity")
  }

  if (input.flaggedWallets >= 2) {
    score += 40
    tags.push("Suspicious Wallet Presence")
  }

  let level: RiskScoreResult["level"] = "Low"
  if (score >= 70) level = "High"
  else if (score >= 40) level = "Moderate"

  return {
    score,
    level,
    tags
  }
}
