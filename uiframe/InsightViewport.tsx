interface InsightViewportProps {
  tokenName: string
  riskScore: number
  liquidity: number
  flagged: boolean
  priceUSD?: number
  categories?: string[]
}

export default function InsightViewport({
  tokenName,
  riskScore,
  liquidity,
  flagged,
  priceUSD,
  categories = []
}: InsightViewportProps) {
  const riskColor =
    riskScore >= 75 ? "text-red-500" : riskScore >= 50 ? "text-yellow-500" : "text-green-500"

  return (
    <div className="p-4 border rounded-lg bg-neutral-900/30 mt-4 shadow-md">
      <h2 className="text-lg font-bold mb-3">Token Insight: {tokenName}</h2>
      <div className="text-sm space-y-2">
        <p>
          Risk Score:{" "}
          <span className={`font-mono ${riskColor}`}>{riskScore.toFixed(2)}</span>
        </p>
        <p>
          Liquidity:{" "}
          <span className="font-mono">
            {liquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
          </span>
        </p>
        {priceUSD !== undefined && (
          <p>
            Price:{" "}
            <span className="font-mono">
              ${priceUSD.toFixed(6)}
            </span>
          </p>
        )}
        <p>
          Status:{" "}
          {flagged ? (
            <span className="text-red-500 font-semibold">⚠️ Flagged</span>
          ) : (
            <span className="text-green-500 font-semibold">✔ Clean</span>
          )}
        </p>
        {categories.length > 0 && (
          <p>
            Categories:{" "}
            <span className="italic">{categories.join(", ")}</span>
          </p>
        )}
      </div>
    </div>
  )
}
