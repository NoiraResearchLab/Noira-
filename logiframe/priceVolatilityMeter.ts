interface VolatilityInput {
  token: string
  prices: number[]
}

type VolatilityRating = "Stable" | "Variable" | "Chaotic"

interface VolatilityPulse {
  token: string
  average: number
  variance: number
  stdDev: number
  volatilityPct: number        // stdDev as % of average
  volatilityRating: VolatilityRating
}

/**
 * Measure price volatility for a token.
 *
 * @param input.token        Token identifier
 * @param input.prices       Array of price samples
 * @returns VolatilityPulse  Detailed volatility metrics
 *
 * Throws if prices array is empty.
 */
export function measurePriceVolatility(input: VolatilityInput): VolatilityPulse {
  const { token, prices } = input

  if (!prices.length) {
    throw new Error(`Cannot measure volatility: prices array is empty for token ${token}`)
  }

  // calculate average
  const sum = prices.reduce((acc, p) => acc + p, 0)
  const average = sum / prices.length

  // calculate variance
  const variance = prices.reduce((acc, p) => {
    const diff = p - average
    return acc + diff * diff
  }, 0) / prices.length

  const stdDev = Math.sqrt(variance)

  // volatility as percentage of average
  const volatilityPct = average > 0
    ? Number(((stdDev / average) * 100).toFixed(2))
    : 0

  // determine rating
  let rating: VolatilityRating = "Stable"
  if (volatilityPct > 10) rating = "Variable"
  if (volatilityPct > 25) rating = "Chaotic"

  return {
    token,
    average: Number(average.toFixed(3)),
    variance: Number(variance.toFixed(3)),
    stdDev: Number(stdDev.toFixed(3)),
    volatilityPct,
    volatilityRating: rating
  }
}
