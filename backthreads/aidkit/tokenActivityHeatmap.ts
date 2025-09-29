export interface ActivityEvent {
  /** unix timestamp in seconds */
  timestamp: number
  /** transaction amount in base units (USD, token, etc.) */
  amount: number
}

export interface HeatmapCell {
  /** UTC hour of day, 0–23 */
  hour: number
  /** total amount aggregated for this hour */
  totalAmount: number
  /** number of events that fell into this hour */
  count: number
  /** percentage share of total volume (0–100) */
  pctOfTotal?: number
}

/**
 * Builds a UTC hour-based heatmap of token activity.
 */
export function buildTokenActivityHeatmap(events: ActivityEvent[]): HeatmapCell[] {
  const map = new Map<number, HeatmapCell>()

  for (const event of events) {
    if (!event || typeof event.timestamp !== "number" || typeof event.amount !== "number") {
      continue
    }

    const date = new Date(event.timestamp * 1000)
    const hour = date.getUTCHours()

    if (!map.has(hour)) {
      map.set(hour, { hour, totalAmount: 0, count: 0 })
    }

    const cell = map.get(hour)!
    cell.totalAmount += event.amount
    cell.count += 1
  }

  const cells = Array.from(map.values()).sort((a, b) => a.hour - b.hour)

  // normalize with pctOfTotal
  const grandTotal = cells.reduce((acc, c) => acc + c.totalAmount, 0)
  if (grandTotal > 0) {
    for (const c of cells) {
      c.pctOfTotal = (c.totalAmount / grandTotal) * 100
    }
  }

  return cells
}

/**
 * Print a human-readable summary of a heatmap.
 */
export function printHeatmapSummary(cells: HeatmapCell[]): void {
  for (const cell of cells) {
    const avg = cell.totalAmount / (cell.count || 1)
    const pct = cell.pctOfTotal !== undefined ? `, share: ${cell.pctOfTotal.toFixed(1)}%` : ""
    console.log(`[${pad(cell.hour)}:00] tx: ${cell.count}, avg: ${avg.toFixed(2)}${pct}`)
  }
}

/* ----------------------------------------
   helpers
---------------------------------------- */

function pad(n: number): string {
  return n.toString().padStart(2, "0")
}
