export interface VolumePoint {
  timestamp: number
  volume: number
}

export interface BurstResult {
  predicted: boolean
  volatilityScore: number
  risePatternDetected: boolean
}

export function predictBurst(points: VolumePoint[]): BurstResult {
  if (points.length < 3) {
    return { predicted: false, volatilityScore: 0, risePatternDetected: false }
  }

  const volumes = points.map(p => p.volume)
  const changes = []

  for (let i = 1; i < volumes.length; i++) {
    const delta = volumes[i] - volumes[i - 1]
    changes.push(delta)
  }

  const maxRise = Math.max(...changes)
  const vol = stddev(volumes)
  const rise = maxRise > Math.max(...volumes) * 0.3

  return {
    predicted: vol > 0.25 && rise,
    volatilityScore: Math.round(vol * 1000) / 1000,
    risePatternDetected: rise
  }
}

function stddev(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}
