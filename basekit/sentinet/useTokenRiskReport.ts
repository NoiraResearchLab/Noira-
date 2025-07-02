import { detectSuspiciousActivity } from "./detectSuspiciousActivity"
import { tokenInsightAnalyzer } from "./tokenInsightAnalyzer"

interface CombinedInput {
  token: string
  activity: Parameters<typeof detectSuspiciousActivity>[0]
  metrics: Parameters<typeof tokenInsightAnalyzer>[0]
}

export function useTokenRiskReport(input: CombinedInput): string {
  const risk = detectSuspiciousActivity(input.activity)
  const insight = tokenInsightAnalyzer(input.metrics)

  const status = risk.flagged ? `🚨 ${risk.notes.join(", ")}` : "✅ No anomalies"

  return `
Token: ${input.token}
Insight: ${insight}
Risk: ${risk.riskScore} (${status})
`
}
