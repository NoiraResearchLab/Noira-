interface VaultRecord {
  id: string
  vector: number[]
  origin: string
  createdAt: number
}

const memoryVault: VaultRecord[] = []

export function storeVaultRecord(record: VaultRecord): void {
  memoryVault.push(record)
  console.log(`[Vault] Stored record ${record.id} (${record.origin})`)
}

export function queryVaultByOrigin(origin: string): VaultRecord[] {
  return memoryVault.filter(r => r.origin === origin)
}

export function clearVault(): void {
  console.log(`[Vault] Clearing ${memoryVault.length} records`)
  memoryVault.length = 0
}

export function vaultSummary(): string {
  const total = memoryVault.length
  const byOrigin = memoryVault.reduce((acc, r) => {
    acc[r.origin] = (acc[r.origin] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return `Vault contains ${total} records across origins: ${JSON.stringify(byOrigin)}`
}
