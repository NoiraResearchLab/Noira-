interface ImpactEvent {
  token: string
  volumeUSD: number
  poolLiquidity: number
  time: number
}

interface ImpactAssessment {
  token: string
  impactScore: number
  severity: "None" | "Moderate" | "Severe"
  notes: string
}

export function assessLiquidityImpact(event: ImpactEvent): ImpactAssessment {
  const ratio = event.volumeUSD / (event.poolLiquidity || 1)
  const impactScore = Math.min(1, ratio)
  let severity: ImpactAssessment["severity"] = "None"
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
    notes
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
