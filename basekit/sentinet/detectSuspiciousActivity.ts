interface TokenActivity {
  tokenMint: string
  transferCount: number
  uniqueSenders: number
  volumeUSD: number
  flaggedWallets: number
}

interface SuspicionResult {
  tokenMint: string
  riskScore: number
  flagged: boolean
  notes: string[]
}

export function detectSuspiciousActivity(activity: TokenActivity): SuspicionResult {
  const notes: string[] = []
  let score = 0

  if (activity.volumeUSD > 500000 && activity.transferCount < 30) {
    score += 30
    notes.push("High volume with low activity")
  }

  if (activity.uniqueSenders < 10) {
    score += 20
    notes.push("Low distribution")
  }

  if (activity.flaggedWallets > 2) {
    score += 40
    notes.push("Flagged wallet involvement")
  }

  return {
    tokenMint: activity.tokenMint,
    riskScore: score,
    flagged: score >= 50,
    notes
  }
}
