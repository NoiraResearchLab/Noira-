interface LogEntry {
  timestamp: string
  token: string
  risk: string
}

interface ResearchLogProps {
  logs: LogEntry[]
}

export default function ResearchLog({ logs }: ResearchLogProps) {
  return (
    <div className="p-4 border rounded-md bg-black/10 mt-4">
      <h2 className="text-lg font-semibold mb-2">Research Log</h2>
      <ul className="space-y-1 text-sm">
        {logs.map((entry, idx) => (
          <li key={idx} className="border-b border-white/10 pb-1">
            [{entry.timestamp}] {entry.token} → <span className="font-mono">{entry.risk}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
