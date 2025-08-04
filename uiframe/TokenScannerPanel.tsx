import { useState, KeyboardEvent } from "react"

interface TokenScannerPanelProps {
  onScan: (tokenAddress: string) => Promise<void> | void
  placeholder?: string
}

export default function TokenScannerPanel({
  onScan,
  placeholder = "Enter token address...",
}: TokenScannerPanelProps) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const addr = input.trim()
    if (!addr) {
      setError("Please enter a token address")
      return
    }
    setError(null)
    setLoading(true)
    try {
      await onScan(addr)
      setInput("")
    } catch (e: any) {
      setError(e.message || "Scan failed")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <div className="p-4 border rounded-md bg-black/10 max-w-sm">
      <h2 className="text-lg font-semibold mb-2">Token Scanner</h2>
      <input
        type="text"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
        className="w-full p-2 mb-2 border rounded-md bg-white/10 text-sm disabled:opacity-50"
      />
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={loading || !input.trim()}
        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm disabled:opacity-50"
      >
        {loading ? "Scanning..." : "Analyze Token"}
      </button>
    </div>
  )
}
