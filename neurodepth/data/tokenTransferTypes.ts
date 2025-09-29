/**
 * Represents a transfer request payload to be submitted
 */
export interface TransferPayload {
  /** nature of the transfer (could be extended later) */
  type: "token" | "native" | "nft" | string

  /** sender address (base58 or hex, depending on chain) */
  from: string

  /** recipient address */
  to: string

  /** amount in smallest unit (lamports/wei/etc.) */
  amount: number

  /** optional free-text memo */
  memo?: string

  /** optional timestamp (ms since epoch) until which funds are locked */
  lockUntil?: number

  /** optional token identifier (mint address, contract address, etc.) */
  assetId?: string
}

/**
 * Result returned after attempting to execute a transfer
 */
export interface TransferResult {
  /** true if broadcast + confirmation succeeded */
  success: boolean

  /** transaction hash or signature, if available */
  txHash?: string

  /** reason for failure, if success = false */
  reason?: string

  /** backend or method used to execute the transfer */
  executedWith?: "rpc" | "sdk" | "faucet" | "relay" | string

  /** block number or slot at which the tx was confirmed */
  confirmedAt?: number
}
