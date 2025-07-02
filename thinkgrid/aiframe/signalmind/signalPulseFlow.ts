type PulseType = "Spike" | "Drop" | "Loop" | "Quiet"

interface SignalPulse {
  token: string
  delta: number
  type: PulseType
  detectedAt: number
}

export function generateSignalPulse(prev: number, curr: number, token: string): SignalPulse {
  const delta = curr - prev
  const absDelta = Math.abs(delta)

  let type: PulseType = "Quiet"
  if (absDelta < 0.01) type = "Quiet"
  else if (delta > 0.05) type = "Spike"
  else if (delta < -0.05) type = "Drop"
  else if (Math.abs(delta) < 0.02) type = "Loop"

  return {
    token,
    delta,
    type,
    detectedAt: Date.now()
  }
}

export function isPulseCritical(pulse: SignalPulse): boolean {
  return pulse.type === "Spike" || pulse.type === "Drop"
}
