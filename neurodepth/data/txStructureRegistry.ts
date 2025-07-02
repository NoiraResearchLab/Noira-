export interface TransferSchema {
  label: string
  fields: string[]
  network: "solana"
}

export const txStructureRegistry: Record<string, TransferSchema> = {
  basic: {
    label: "Standard Transfer",
    fields: ["from", "to", "amount"],
    network: "solana"
  },
  memoTagged: {
    label: "Transfer with Memo",
    fields: ["from", "to", "amount", "memo"],
    network: "solana"
  },
  escrowLike: {
    label: "Escrow-style Initiation",
    fields: ["initiator", "recipient", "amount", "lockUntil"],
    network: "solana"
  }
}
