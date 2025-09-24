import { SolanaTokenInfo } from "./fetchSolanaTokenData"

export interface RiskRule {
  condition: boolean
  weight: number
  reason: string
}

export interface RiskInferenceResult {
  score: number
  verdict: "Safe" | "Suspicious" | "Risky"
  details: Array<{ reason: string; weight: number }>
}

export function runRiskInference(token: SolanaTokenInfo): RiskInferenceResult {
  const ageInDays = token.creationTime
    ? (Date.now() - token.creationTime) / (1000 * 60 * 60 * 24)
    : Infinity

  const rules: RiskRule[] = [
    {
      condition: token.supply > 1_000_000_000,
      weight: 20,
      reason: "Excessive total supply",
    },
    {
      condition: token.decimals !== 9,
      weight: 10,
      reason: "Non-standard decimals",
    },
    {
      condition: token.ownerCount < 30,
      weight: 30,
      reason: "Very few holders",
    },
    {
      condition: ageInDays < 3,
      weight: 20,
      reason: "Recently created token",
    },
  ]

  const triggered = rules.filter(r => r.condition)
  const score = Math.min(
    100,
    triggered.reduce((s, r) => s + r.weight, 0)
  )

  let verdict: "Safe" | "Suspicious" | "Risky" = "Safe"
  if (score >= 60) verdict = "Risky"
  else if (score >= 30) verdict = "Suspicious"

  return {
    score,
    verdict,
    details: triggered.map(r => ({ reason: r.reason, weight: r.weight })),
  }
}
