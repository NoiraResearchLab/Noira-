// classifyToken.ts — improved, configurable, and fully deterministic (no randomness)

/**
 * Input describing a single token
 */
export interface TokenData {
  address: string
  volume24h: number
  liquidity: number
  flags: string[]          // e.g., ["suspicious", "owner_mint", "blacklist"]
  holderCount: number
  deployTimestamp: number  // ms epoch
}

export type RiskLevel = "Low" | "Moderate" | "High"

export interface ClassificationResult {
  address: string
  riskLevel: RiskLevel
  score: number            // 0–100 raw score (clamped)
  normalizedScore: number  // 0–1 normalized
  reasons: string[]        // human-readable rationale
}

/**
 * Factor weights (sum should be 100 for intuitive scoring).
 * You can override via options; missing fields fallback to these defaults.
 */
export const DEFAULT_WEIGHTS = {
  lowVolume: 25,
  lowLiquidity: 30,
  flags: 20,        // aggregate weight allocated across matched flags below
  fewHolders: 15,
  recentDeploy: 10,
} as const

/**
 * Thresholds for criteria — override via options if needed
 */
export const DEFAULT_THRESHOLDS = {
  minVolume24h: 5_000,
  minLiquidity: 1_000,
  minHolders: 50,
  freshAgeMs: 3 * 24 * 60 * 60 * 1_000, // 3 days
}

/**
 * Optional per-flag severities (deterministic)
 * Each matched flag receives a share of the `weights.flags` bucket
 * proportional to its severity. Unknown flags are treated as severity=1.
 */
export const DEFAULT_FLAG_SEVERITY: Record<string, number> = {
  suspicious: 3,
  blacklist: 3,
  owner_mint: 2,
  trading_paused: 2,
  honeypot: 3,
  dev_blacklist: 2,
  mintable: 1,
}

/**
 * Optional risk band cutoffs; override via options
 */
export const DEFAULT_RISK_BANDS = {
  high: 0.7,      // ≥ 70% of max score
  moderate: 0.4,  // ≥ 40% of max score
}

export interface ClassifierOptions {
  weights?: Partial<typeof DEFAULT_WEIGHTS>
  thresholds?: Partial<typeof DEFAULT_THRESHOLDS>
  flagSeverity?: Record<string, number>
  riskBands?: Partial<typeof DEFAULT_RISK_BANDS>
  nowMs?: number // inject for deterministic testing (defaults to Date.now())
}

/**
 * Main classifier — backward compatible signature with added `options`
 */
export function classifyToken(token: TokenData, options: ClassifierOptions = {}): ClassificationResult {
  validateInput(token)

  const weights = { ...DEFAULT_WEIGHTS, ...(options.weights || {}) }
  const thresholds = { ...DEFAULT_THRESHOLDS, ...(options.thresholds || {}) }
  const flagSeverity = { ...DEFAULT_FLAG_SEVERITY, ...(options.flagSeverity || {}) }
  const riskBands = { ...DEFAULT_RISK_BANDS, ...(options.riskBands || {}) }

  const maxScore = sum(Object.values(weights))
  const reasons: string[] = []
  let score = 0

  // Volume
  if (token.volume24h < thresholds.minVolume24h) {
    score += weights.lowVolume
    reasons.push(`24h volume below ${formatNum(thresholds.minVolume24h)}`)
  }

  // Liquidity
  if (token.liquidity < thresholds.minLiquidity) {
    score += weights.lowLiquidity
    reasons.push(`liquidity below ${formatNum(thresholds.minLiquidity)}`)
  }

  // Flags (weighted distribution across present flags)
  const presentFlags = Array.isArray(token.flags) ? token.flags.filter(Boolean) : []
  if (presentFlags.length > 0 && weights.flags > 0) {
    const severities = presentFlags.map((f) => flagSeverity[f] ?? 1)
    const totalSev = Math.max(1, sum(severities))
    presentFlags.forEach((flag, i) => {
      const portion = (severities[i] / totalSev) * weights.flags
      if (portion > 0) {
        score += portion
        reasons.push(`flag: ${flag} (+${round(portion, 1)})`)
      }
    })
  }

  // Holder count
  if (token.holderCount < thresholds.minHolders) {
    score += weights.fewHolders
    reasons.push(`fewer than ${thresholds.minHolders} holders`)
  }

  // Age
  const now = isFiniteNumber(options.nowMs) ? options.nowMs! : Date.now()
  const ageMs = Math.max(0, now - token.deployTimestamp)
  if (ageMs < thresholds.freshAgeMs) {
    score += weights.recentDeploy
    reasons.push(`deployed within last ${days(thresholds.freshAgeMs)} days`)
  }

  // Clamp, normalize, and band
  const clamped = Math.min(score, maxScore)
  const normalized = round(clamped / maxScore, 3)

  let riskLevel: RiskLevel = "Low"
  if (normalized >= riskBands.high) {
    riskLevel = "High"
  } else if (normalized >= riskBands.moderate) {
    riskLevel = "Moderate"
  }

  return {
    address: token.address,
    score: round(clamped, 2),
    normalizedScore: normalized,
    riskLevel,
    reasons,
  }
}

// -------------------- utils --------------------

function validateInput(t: TokenData): void {
  if (!t || typeof t !== "object") throw new Error("TokenData is required")
  if (typeof t.address !== "string" || t.address.trim() === "") {
    throw new Error("TokenData.address must be a non-empty string")
  }
  assertNonNeg("volume24h", t.volume24h)
  assertNonNeg("liquidity", t.liquidity)
  assertNonNeg("holderCount", t.holderCount)
  assertNonNeg("deployTimestamp", t.deployTimestamp)
  if (!Array.isArray(t.flags)) throw new Error("TokenData.flags must be a string[]")
}

function assertNonNeg(name: string, value: unknown): void {
  if (!isFiniteNumber(value) || (value as number) < 0) {
    throw new Error(`TokenData.${name} must be a non-negative number`)
  }
}

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x)
}

function sum(nums: number[]): number {
  let s = 0
  for (let i = 0; i < nums.length; i++) s += nums[i]
  return s
}

function round(x: number, digits: number): number {
  const p = Math.pow(10, digits)
  return Math.round(x * p) / p
}

function formatNum(x: number): string {
  // Deterministic formatting with thin space separators
  return x.toLocaleString("en-US").replace(/,/g, " ")
}

function days(ms: number): number {
  return Math.round(ms / (24 * 60 * 60 * 1000))
}
