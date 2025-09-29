export interface ImpactEvent {
  /** token symbol or address */
  token: string
  /** trade volume in USD */
  volumeUSD: number
  /** pool liquidity in USD */
  poolLiquidity: number
  /** unix timestamp (ms) */
  time: number
}

export type SeverityLevel = "None" | "Moderate" | "Severe"

export interface ImpactAssessment {
  token: string
  impactScore: number
  severity: SeverityLevel
  notes: string
  assessedAt: number
}

export function assessLiquidityImpact(event: ImpactEvent): ImpactAssessment {
  const denominator = event.poolLiquidity > 0 ? event.poolLiquidity : 1
  const ratio = event.volumeUSD / denominator

  // clamp to [0,1]
  const impactScore = clamp(ratio, 0, 1)

  let severity: SeverityLevel = "None"
  let notes = "No visible impact"

  if (impactScore > 0.7) {
    severity = "Severe"
    notes = "Trade size dominates liquidity"
  } else if (impactScore > 0.3) {
    severity = "Moderate"
    notes = "Noticeable impact on pool depth"
  }

  return {
    token: event.token,
    impactScore: round(impactScore),
    severity,
    notes,
    assessedAt: Date.now(),
  }
}

function round(n: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round(n * factor) / factor
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
