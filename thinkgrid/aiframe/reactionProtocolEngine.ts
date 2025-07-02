import { CognitiveMode } from "./cognitiveModeSelector"

interface ReactionContext {
  token: string
  mode: CognitiveMode
  riskScore: number
  timestamp: number
}

interface AIReaction {
  action: "Store" | "Alert" | "Escalate" | "Ignore"
  reasoning: string
  confidence: number
}

export function evaluateReaction(context: ReactionContext): AIReaction {
  const { mode, riskScore } = context

  if (mode === "Flag" && riskScore > 75) {
    return {
      action: "Escalate",
      reasoning: "Flag mode + critical risk detected",
      confidence: 0.95
    }
  }

  if (mode === "Predict" && riskScore > 60) {
    return {
      action: "Alert",
      reasoning: "Predicted instability with high score",
      confidence: 0.87
    }
  }

  if (mode === "Analyze" && riskScore > 40) {
    return {
      action: "Store",
      reasoning: "Moderate risk — storing for pattern evaluation",
      confidence: 0.72
    }
  }

  return {
    action: "Ignore",
    reasoning: "No actionable state",
    confidence: 0.4
  }
}
