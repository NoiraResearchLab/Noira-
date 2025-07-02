interface SurgeInput {
  token: string
  liquiditySamples: number[]
}

interface SurgeSignal {
  token: string
  delta: number
  surgeDetected: boolean
  impactLevel: "Low" | "Moderate" | "High"
}

export function scanLiquiditySurge(input: SurgeInput): SurgeSignal {
  const values = input.liquiditySamples.slice(-5)
  const delta = values[values.length - 1] - values[0]
  const changeRate = delta / (values[0] || 1)
  const impact =
    changeRate > 0.8 ? "High" :
    changeRate > 0.4 ? "Moderate" :
    "Low"

  return {
    token: input.token,
    delta: Math.round(delta),
    surgeDetected: changeRate > 0.3,
    impactLevel: impact
  }
}
