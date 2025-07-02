interface InsightViewportProps {
  tokenName: string
  riskScore: number
  liquidity: number
  flagged: boolean
}

export default function InsightViewport({
  tokenName,
  riskScore,
  liquidity,
  flagged
}: InsightViewportProps) {
  return (
    <div className="p-4 border rounded-md bg-black/10 mt-4">
      <h2 className="text-lg font-semibold mb-2">Token Insight: {tokenName}</h2>
      <div className="text-sm space-y-1">
        <p>Risk Score: <span className="font-mono">{riskScore.toFixed(2)}</span></p>
        <p>Liquidity: <span className="font-mono">{liquidity.toLocaleString()}</span></p>
        <p>Status: {flagged ? <span className="text-red-500">Flagged</span> : "Clean"}</p>
      </div>
    </div>
  )
}
