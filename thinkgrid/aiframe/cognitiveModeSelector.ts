export type CognitiveMode = "Observe" | "Analyze" | "Predict" | "Flag"

export interface AgentState {
  recentVolatility: number
  flaggedEvents: number
  interactionRate: number
  trustLevel: number
}

export function selectCognitiveMode(state: AgentState): CognitiveMode {
  const { recentVolatility, flaggedEvents, interactionRate, trustLevel } = state

  if (flaggedEvents >= 3 || trustLevel < 0.3) return "Flag"
  if (recentVolatility > 0.6) return "Predict"
  if (interactionRate > 0.5) return "Analyze"

  return "Observe"
}

export function getModeSummary(mode: CognitiveMode): string {
  switch (mode) {
    case "Observe":
      return "Passive scanning, no active classification"
    case "Analyze":
      return "Running full pattern evaluation and tracing"
    case "Predict":
      return "Engaged in predictive modeling of token behavior"
    case "Flag":
      return "Immediate threat flagged — initiating warnings"
  }
}
