export interface TransferPayload {
  type: string
  from: string
  to: string
  amount: number
  memo?: string
  lockUntil?: number
}

export interface TransferResult {
  success: boolean
  txHash?: string
  reason?: string
  executedWith?: string
}
