import { useState } from "react"

interface TokenScannerPanelProps {
  onScan: (tokenAddress: string) => void
}

export default function TokenScannerPanel({ onScan }: TokenScannerPanelProps) {
  const [input, setInput] = useState("")

  const handleSubmit = () => {
    if (input.trim()) onScan(input.trim())
  }

  return (
    <div className="p-4 border rounded-md bg-black/10">
      <h2 className="text-lg font-semibold mb-2">Token Scanner</h2>
      <input
        type="text"
        placeholder="Enter token address..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 mb-2 border rounded-md bg-white/10 text-sm"
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-sm"
      >
        Analyze Token
      </button>
    </div>
  )
}
