interface VaultInitPayload {
  context: string
  tags: string[]
  timestamp: number
  silent?: boolean
}

interface VaultInitResult {
  accepted: boolean
  traceId: string
  diagnostic: string
}

export function initVaultAction(payload: VaultInitPayload): VaultInitResult {
  const traceId = `vault-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const tagCount = payload.tags.length

  if (!payload.context || tagCount === 0) {
    return {
      accepted: false,
      traceId,
      diagnostic: "Missing context or tags"
    }
  }

  if (!payload.silent) {
    console.log(`[Vault Init] Context: ${payload.context}`)
    console.log(`[Vault Init] Tags: ${payload.tags.join(", ")}`)
  }

  return {
    accepted: true,
    traceId,
    diagnostic: `Vault initialized with ${tagCount} tags`
  }
}
