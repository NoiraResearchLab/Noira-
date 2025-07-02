interface ContractCall {
  caller: string
  contract: string
  method: string
  timestamp: number
  gasUsed: number
}

interface ContractInteraction {
  contract: string
  callCount: number
  uniqueCallers: Set<string>
  avgGasUsed: number
}

export function analyzeContractCalls(calls: ContractCall[]): ContractInteraction[] {
  const map = new Map<string, { count: number; gasTotal: number; callers: Set<string> }>()

  for (const call of calls) {
    if (!map.has(call.contract)) {
      map.set(call.contract, {
        count: 0,
        gasTotal: 0,
        callers: new Set()
      })
    }

    const entry = map.get(call.contract)!
    entry.count += 1
    entry.gasTotal += call.gasUsed
    entry.callers.add(call.caller)
  }

  const results: ContractInteraction[] = []
  for (const [contract, entry] of map.entries()) {
    results.push({
      contract,
      callCount: entry.count,
      uniqueCallers: entry.callers,
      avgGasUsed: Math.round(entry.gasTotal / entry.count)
    })
  }

  return results
}
