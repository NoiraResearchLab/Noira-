export interface TxEvent {
  wallet: string
  amount: number
  timestamp: number
}

export interface EntropyResult {
  uniqueWallets: number
  gini: number
  entropy: number
}

export function analyzeTransactionEntropy(events: TxEvent[]): EntropyResult {
  const byWallet = new Map<string, number>()

  for (const tx of events) {
    byWallet.set(tx.wallet, (byWallet.get(tx.wallet) || 0) + tx.amount)
  }

  const values = Array.from(byWallet.values())
  const total = values.reduce((a, b) => a + b, 0)

  const entropy = values.reduce((sum, val) => {
    const p = val / total
    return sum - p * Math.log2(p)
  }, 0)

  const gini = computeGini(values)

  return {
    uniqueWallets: byWallet.size,
    gini: Math.round(gini * 1000) / 1000,
    entropy: Math.round(entropy * 1000) / 1000
  }
}

function computeGini(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const n = values.length
  const sum = sorted.reduce((a, b) => a + b, 0)
  let cumulative = 0

  for (let i = 0; i < n; i++) {
    cumulative += (i + 1) * sorted[i]
  }

  return (2 * cumulative) / (n * sum) - (n + 1) / n
}
