import { TransferPayload, TransferResult } from "./tokenTransferTypes"
import { txStructureRegistry } from "./txStructureRegistry"

export async function solTransferRunner(payload: TransferPayload): Promise<TransferResult> {
  const schema = txStructureRegistry[payload.type]
  if (!schema) {
    return {
      success: false,
      reason: `Unsupported transfer type: ${payload.type}`
    }
  }

  try {
    // Simulated transfer execution
    const { from, to, amount } = payload
    const txHash = `TX-${Date.now()}-${Math.floor(Math.random() * 9999)}`

    console.log(`[Transfer] ${amount} from ${from} → ${to} via ${payload.type}`)

    return {
      success: true,
      txHash,
      executedWith: schema.label
    }
  } catch (e) {
    return {
      success: false,
      reason: "Execution failed"
    }
  }
}
