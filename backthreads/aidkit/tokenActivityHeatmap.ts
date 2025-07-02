export interface ActivityEvent {
  timestamp: number
  amount: number
}

export interface HeatmapCell {
  hour: number
  totalAmount: number
  count: number
}

export function buildTokenActivityHeatmap(events: ActivityEvent[]): HeatmapCell[] {
  const map = new Map<number, HeatmapCell>()

  for (const event of events) {
    const date = new Date(event.timestamp * 1000)
    const hour = date.getUTCHours()

    if (!map.has(hour)) {
      map.set(hour, { hour, totalAmount: 0, count: 0 })
    }

    const cell = map.get(hour)!
    cell.totalAmount += event.amount
    cell.count += 1
  }

  return Array.from(map.values()).sort((a, b) => a.hour - b.hour)
}

export function printHeatmapSummary(cells: HeatmapCell[]): void {
  for (const cell of cells) {
    const avg = cell.totalAmount / (cell.count || 1)
    console.log(`[${cell.hour}:00] tx: ${cell.count}, avg: ${avg.toFixed(2)}`)
  }
}
