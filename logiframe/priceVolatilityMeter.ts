interface VolatilityInput {
  token: string
  prices: number[]
}

interface VolatilityPulse {
  token: string
  stdDev: number
  volatilityRating: "Stable" | "Variable" | "Chaotic"
}

export function measurePriceVolatility(input: VolatilityInput): VolatilityPulse {
  const avg = input.prices.reduce((a, b) => a + b, 0) / input.prices.length
  const variance = input.prices.reduce((sum, p) => sum + (p - avg) ** 2, 0) / input.prices.length
  const stdDev = Math.sqrt(variance)

  let rating: VolatilityPulse["volatilityRating"] = "Stable"
  if (stdDev > avg * 0.1) rating = "Variable"
  if (stdDev > avg * 0.25) rating = "Chaotic"

  return {
    token: input.token,
    stdDev: Math.round(stdDev * 1000) / 1000,
    volatilityRating: rating
  }
}
