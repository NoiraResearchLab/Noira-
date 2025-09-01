interface FluxPoint {
  timestamp: number
  volume: number
}

interface FluxAnalysis {
  averageVolume: number
  medianVolume: number
  maxVolume: number
  minVolume: number
  spikeCount: number
  fluxScore: number
  volatility: number
}

export function synthVolumeFlux(data: FluxPoint[]): FluxAnalysis {
  if (data.length === 0) {
    return {
      averageVolume: 0,
      medianVolume: 0,
      maxVolume: 0,
      minVolume: 0,
      spikeCount: 0,
      fluxScore: 0,
      volatility: 0
    }
  }

  const volumes = data.map(p => p.volume).sort((a, b) => a - b)
  const average = volumes.reduce((a, b) => a + b, 0) / volumes.length
  const median =
    volumes.length % 2 === 0
      ? (volumes[volumes.length / 2 - 1] + volumes[volumes.length / 2]) / 2
      : volumes[Math.floor(volumes.length / 2)]

  let spikeCount = 0
  for (let i = 1; i < volumes.length; i++) {
    if (volumes[i] > volumes[i - 1] * 2) {
      spikeCount++
    }
  }

  const maxVolume = volumes[volumes.length - 1]
  const minVolume = volumes[0]

  const variance =
    volumes.reduce((acc, v) => acc + Math.pow(v - average, 2), 0) / volumes.length
  const volatility = Math.sqrt(variance)

  return {
    averageVolume: Math.round(average),
    medianVolume: Math.round(median),
    maxVolume,
    minVolume,
    spikeCount,
    fluxScore: Math.round((spikeCount / volumes.length) * 100),
    volatility: Math.round(volatility)
  }
}
