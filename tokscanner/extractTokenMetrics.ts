interface RawTransaction {
  timestamp: number
  amount: number
  sender: string
  receiver: string
  type: string
}

interface TokenMetrics {
  averageTxAmount: number
  txPerHour: number
  uniqueAddresses: number
  whaleImpactScore: number
}

export function extractTokenMetrics(transactions: RawTransaction[]): TokenMetrics {
  if (!transactions.length) {
    return {
      averageTxAmount: 0,
      txPerHour: 0,
      uniqueAddresses: 0,
      whaleImpactScore: 0
    }
  }

  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  const addressSet = new Set<string>()
  let totalAmount = 0
  let recentTxCount = 0
  let whaleTxCount = 0

  for (const tx of transactions) {
    totalAmount += tx.amount
    addressSet.add(tx.sender)
    addressSet.add(tx.receiver)

    if (now - tx.timestamp < oneHour) {
      recentTxCount++
    }

    if (tx.amount > 10000) {
      whaleTxCount++
    }
  }

  const averageTxAmount = totalAmount / transactions.length
  const txPerHour = recentTxCount
  const uniqueAddresses = addressSet.size
  const whaleImpactScore = (whaleTxCount / transactions.lengt
