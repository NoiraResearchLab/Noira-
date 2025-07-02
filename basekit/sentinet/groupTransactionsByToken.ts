interface TransactionRecord {
  tokenMint: string
  amount: number
  sender: string
  timestamp: number
}

export function groupTransactionsByToken(records: TransactionRecord[]): Record<string, TransactionRecord[]> {
  const grouped: Record<string, TransactionRecord[]> = {}

  for (const tx of records) {
    if (!grouped[tx.tokenMint]) {
      grouped[tx.tokenMint] = []
    }
    grouped[tx.tokenMint].push(tx)
  }

  return grouped
}
