// ely_vault.ts

let vaultInitCounter = 0

export interface VaultInitPayload {
  context: string
  tags: string[]
  timestamp: number
  silent?: boolean
}

export interface VaultInitResult {
  accepted: boolean
  traceId: string
  diagnostic: string
}

/**
 * Initialize a vault action, with structured validation and traceability.
 *
 * @param payload - details for vault initialization
 * @returns result object indicating acceptance and diagnostics
 */
export function initVaultAction(
  payload: VaultInitPayload
): VaultInitResult {
  const { context, tags, timestamp, silent = false } = payload

  // Generate a deterministic trace ID
  vaultInitCounter += 1
  const traceId = `vault-${timestamp}-${vaultInitCounter}`

  // Validation
  if (typeof context !== 'string' || !context.trim()) {
    return {
      accepted: false,
      traceId,
      diagnostic: 'Context must be a non-empty string',
    }
  }
  if (!Array.isArray(tags) || tags.length === 0) {
    return {
      accepted: false,
      traceId,
      diagnostic: 'Tags array must contain at least one tag',
    }
  }
  if (typeof timestamp !== 'number' || timestamp <= 0) {
    return {
      accepted: false,
      traceId,
      diagnostic: 'Timestamp must be a positive number',
    }
  }

  // Optional logging
  if (!silent) {
    console.info(`[Vault Init] traceId=${traceId}`)
    console.info(`[Vault Init] Context: ${context}`)
    console.info(`[Vault Init] Tags: ${tags.join(', ')}`)
    console.info(
      `[Vault Init] Timestamp: ${new Date(timestamp).toISOString()}`
    )
  }

  return {
    accepted: true,
    traceId,
    diagnostic: `Vault initialized with ${tags.length} tag${tags.length !== 1 ? 's' : ''}`,
  }
}
