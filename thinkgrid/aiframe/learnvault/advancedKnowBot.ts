export const CAPABILITY_FLAGS = {
  supportsRecall: true,
  solanaAware: true,
  adaptiveLearning: true,
  confidenceTagging: true
}

export const ADVANCED_ASSISTANT_CAPABILITIES = {
  explain: (token: string) =>
    `Generating multi-layer context explanation for token ${token}...`,
  recall: (input: string) =>
    `Accessing memory vaults to find knowledge related to "${input}"...`,
  assessRisk: (score: number) =>
    score > 70 ? "High risk signal detected" : "No critical flags",
  traceSolana: (mint: string) =>
    `Tracing Solana mint ${mint} across liquidity + holder layers`
}
