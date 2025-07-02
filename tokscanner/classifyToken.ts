export interface TokenData {
  address: string
  volume24h: number
  liquidity: number
  flags: string[]
  holderCount: number
  deployTimestamp: number
}

export type RiskLevel = "Low" | "Moderate" | "High"

interface ClassificationResult {
  address: string
  riskLevel: RiskLevel
  score: number
  reasons: string[]
}

export function classifyToken(token: TokenData): ClassificationResult {
  let score = 0
  const reasons: string[] = []

  if (token.volume24h < 5000) {
    score += 25
    reasons.push("Low 24h volume")
  }

  if (token.liquidity < 1000) {
    score += 30
    reasons.push("Low liquidity")
  }

  if (token.flags.includes("suspicious")) {
    score += 20
    reasons.push("Flagged as suspicious")
  }

  if (token.holderCount < 50) {
    score += 15
    reasons.push("Low number of holders")
  }

  const tokenAge = Date.now() - token.deployTimestamp
  const oneDayMs = 24 * 60 * 60 * 1000
  if (tokenAge < oneDayMs * 3) {
    score += 10
    reasons.push("Recently deployed")
  }

  let riskLevel: RiskLevel = "Low"
  if (score >= 70) riskLevel = "High"
  else if (score >= 40) riskLevel = "Moderate"

  return {
    address: token.address,
    riskLevel,
    score,
    reasons
  }
}
