/**
 * A record of a token transfer.
 */
export interface TransactionRecord {
  tokenMint: string
  amount: number
  sender: string
  timestamp: number
}

/**
 * Groups an array of TransactionRecord by tokenMint.
 * @param records — the list of transactions to group
 * @param options.sortAsc — whether to sort each group by timestamp ascending (default: true)
 * @returns an object whose keys are token mints and values are the arrays of transactions
 */
export function groupTransactionsByToken(
  records: TransactionRecord[],
  options: { sortAsc?: boolean } = {}
): Record<string, TransactionRecord[]> {
  const { sortAsc = true } = options

  // group via reduce
  const grouped = records.reduce<Record<string, TransactionRecord[]>>((acc, tx) => {
    const key = tx.tokenMint
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(tx)
    return acc
  }, {})

  // optionally sort each group by timestamp
  if (sortAsc) {
    for (const mint in grouped) {
      grouped[mint].sort((a, b) => a.timestamp - b.timestamp)
    }
  }

  return grouped
}

/**
 * Generic version of groupRecordsByKey.
 * @param items — any array of items
 * @param getKey — function to extract a string key from an item
 * @param options.sortAsc — whether to sort groups by a numeric field ascending
 * @param options.getSortValue — (optional) function to extract a numeric value for sorting
 */
export function groupBy<T>(
  items: T[],
  getKey: (item: T) => string,
  options: {
    sortAsc?: boolean
    getSortValue?: (item: T) => number
  } = {}
): Record<string, T[]> {
  const { sortAsc = false, getSortValue } = options

  const grouped = items.reduce<Record<string, T[]>>((acc, item) => {
    const key = getKey(item)
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {})

  if (sortAsc && getSortValue) {
    for (const key in grouped) {
      grouped[key].sort((a, b) => getSortValue(a) - getSortValue(b))
    }
  }

  return grouped
}
