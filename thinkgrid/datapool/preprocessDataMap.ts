interface RawEntry {
  token: string
  features: Record<string, number>
  timestamp: number
}

interface NormalizedEntry {
  token: string
  vector: number[]
  timestamp: number
}

export function preprocessDataMap(raw: RawEntry[]): NormalizedEntry[] {
  const featureKeys = Object.keys(raw[0]?.features || {})
  if (featureKeys.length === 0) return []

  const vectorsByKey = new Map<string, number[]>()
  for (const key of featureKeys) {
    vectorsByKey.set(key, raw.map((entry) => entry.features[key]))
  }

  const stats: Record<string, { min: number; max: number }> = {}
  for (const [key, values] of vectorsByKey.entries()) {
    const min = Math.min(...values)
    const max = Math.max(...values)
    stats[key] = { min, max }
  }

  const normalized: NormalizedEntry[] = raw.map((entry) => {
    const vector = featureKeys.map((key) => {
      const val = entry.features[key]
      const { min, max } = stats[key]
      if (max === min) return 0.5
      return (val - min) / (max - min)
    })

    return {
      token: entry.token,
      vector,
      timestamp: entry.timestamp
    }
  })

  return normalized
}
