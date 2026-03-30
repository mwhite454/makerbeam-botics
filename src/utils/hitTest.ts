export function nearestSegmentIndex(points: [number, number][], x: number, y: number): number {
  if (points.length < 2) return -1
  let best = -1
  let bestDist = Infinity
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const t = projectPointToSegment(a[0], a[1], b[0], b[1], x, y)
    const px = a[0] + (b[0] - a[0]) * t
    const py = a[1] + (b[1] - a[1]) * t
    const d = Math.hypot(px - x, py - y)
    if (d < bestDist) { bestDist = d; best = i - 1 }
  }
  return best
}

function projectPointToSegment(x1: number, y1: number, x2: number, y2: number, px: number, py: number) {
  const vx = x2 - x1
  const vy = y2 - y1
  const wx = px - x1
  const wy = py - y1
  const c1 = vx * wx + vy * wy
  if (c1 <= 0) return 0
  const c2 = vx * vx + vy * vy
  if (c2 <= 0) return 0
  const t = c1 / c2
  return Math.max(0, Math.min(1, t))
}
export function nearestAnchorIndex(points: [number, number][], x: number, y: number, maxDist = 8): number {
  let best = -1
  let bestDist = Infinity
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const d = Math.hypot(p[0] - x, p[1] - y)
    if (d < bestDist) { bestDist = d; best = i }
  }
  return bestDist <= maxDist ? best : -1
}

const _default = { nearestSegmentIndex, nearestAnchorIndex }
export default _default
