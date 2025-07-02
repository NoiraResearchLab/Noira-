interface FluxPoint {
  timestamp: number
  volume: number
}

interface FluxAnalysis {
  averageVolume: number
  spikeCount: number
  fluxScore: number
}

export function synthVolumeFlux(data: FluxPoint[]): FluxAnalysis {
  const volumes = data.map(p => p.volume)
  const average = volumes.reduce((a, b) => a + b, 0) / volumes.length

  let spikeCount = 0
  for (let i = 1; i < volumes.length; i++) {
    if (volumes[i] > volumes[i - 1] * 2) {
      spikeCount++
    }
  }

  return {
    averageVolume: Math.round(average),
    spikeCount,
    fluxScore: Math.round((spikeCount / volumes.length) * 100)
  }
}
