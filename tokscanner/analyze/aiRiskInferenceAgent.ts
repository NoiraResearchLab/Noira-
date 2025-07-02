import { SolanaTokenInfo } from "./fetchSolanaTokenData"

export interface RiskInferenceResult {
  score: number
  verdict: "Safe" | "Suspicious" | "Risky"
  reasons: string[]
}

export function runRiskInference(token: SolanaTokenInfo): RiskInferenceResult {
  const reasons: string[] = []
  let score = 0

  if (token.supply > 1_000_000_000) {
    score += 20
    reasons.push("Excessive total supply")
  }

  if (token.decimals !== 9) {
    score += 10
    reasons.push("Non-standard decimals")
  }

  if (token.ownerCount < 30) {
    score += 30
    reasons.push("Very few holders")
  }

  const ageInDays = (Date.now() - token.creationTime) / (1000 * 60 * 60 * 24)
  if (ageInDays < 3) {
    score += 20
    reasons.push("Recently created token")
  }

  let verdict: "Safe" | "Suspicious" | "Risky" = "Safe"
  if (score >= 60) verdict = "Risky"
  else if (score >= 30) verdict = "Suspicious"

  return {
    score,
    verdict,
    reasons
  }
}
