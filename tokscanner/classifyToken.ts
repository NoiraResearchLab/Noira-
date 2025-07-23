// classifyToken.ts

export interface TokenData {
  address: string
  volume24h: number
  liquidity: number
  flags: string[]
  holderCount: number
  deployTimestamp: number
}

export type RiskLevel = "Low" | "Moderate" | "High"

export interface ClassificationResult {
  address: string
  riskLevel: RiskLevel
  score: number           // 0–100 raw score
  normalizedScore: number // 0–1 normalized
  reasons: string[]
}

// Individual weight factors (sum = 100)
const WEIGHTS = {
  lowVolume:       25,
  lowLiquidity:    30,
  suspiciousFlag:  20,
  fewHolders:      15,
  recentDeploy:    10,
} as const

/**
 * Classify a token's risk based on volume, liquidity, flags, holders, and age.
 *
 * @param token - input data for a single token
 * @returns classification including raw & normalized scores plus rationale
 */
export function classifyToken(token: TokenData): ClassificationResult {
  // Validate inputs
  if (!token.address) {
    throw new Error("TokenData.address must be a non-empty string")
  }
  for (const field of ["volume24h", "liquidity", "holderCount", "deployTimestamp"] as const) {
    if (typeof token[field] !== "number" || token[field] < 0) {
      throw new Error(`TokenData.${field} must be a non-negative number`)
    }
  }
  if (!Array.isArray(token.flags)) {
    throw new Error("TokenData.flags must be a string[]")
  }

  let score = 0
  const reasons: string[] = []

  if (token.volume24h < 5_000) {
    score += WEIGHTS.lowVolume
    reasons.push("24h volume below 5 000")
  }

  if (token.liquidity < 1_000) {
    score += WEIGHTS.lowLiquidity
    reasons.push("liquidity below 1 000")
  }

  if (token.flags.includes("suspicious")) {
    score += WEIGHTS.suspiciousFlag
    reasons.push("flagged suspicious")
  }

  if (token.holderCount < 50) {
    score += WEIGHTS.fewHolders
    reasons.push("fewer than 50 holders")
  }

  const ageMs = Date.now() - token.deployTimestamp
  const threeDaysMs = 3 * 24 * 60 * 60 * 1_000
  if (ageMs < threeDaysMs) {
    score += WEIGHTS.recentDeploy
    reasons.push("deployed within last 3 days")
  }

  // Ensure score caps at total weight
  const maxScore = Object.values(WEIGHTS).reduce((sum, w) => sum + w, 0)
  const clamped = Math.min(score, maxScore)
  const normalized = parseFloat((clamped / maxScore).toFixed(3)) // 0–1 range

  let riskLevel: RiskLevel = "Low"
  if (clamped >= 0.7 * maxScore) {
    riskLevel = "High"
  } else if (clamped >= 0.4 * maxScore) {
    riskLevel = "Moderate"
  }

  return {
    address: token.address,
    score: clamped,
    normalizedScore: normalized,
    riskLevel,
    reasons,
  }
}
