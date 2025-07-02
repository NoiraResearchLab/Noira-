interface AlertSignalBarProps {
  alerts: string[]
}

export default function AlertSignalBar({ alerts }: AlertSignalBarProps) {
  if (alerts.length === 0) return null

  return (
    <div className="mt-4 bg-red-600 text-white text-sm p-3 rounded-md shadow-md">
      <strong>⚠ Alerts:</strong>
      <ul className="list-disc list-inside ml-2">
        {alerts.map((alert, index) => (
          <li key={index}>{alert}</li>
        ))}
      </ul>
    </div>
  )
}
