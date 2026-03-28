import type { Vec2, Path } from '@/types/sketchPath'

export function anchorsToPoints(path: Path): [number, number][] {
  return path.anchors.map((a) => [a.pos.x, a.pos.y])
}

export function pathLength(points: [number, number][]): number {
  let len = 0
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1]
    const [x2, y2] = points[i]
    const dx = x2 - x1
    const dy = y2 - y1
    len += Math.hypot(dx, dy)
  }
  return len
}

export function pointAtT(points: [number, number][], t: number): [number, number] {
  if (points.length === 0) return [0, 0]
  if (t <= 0) return points[0]
  if (t >= 1) return points[points.length - 1]

  const total = pathLength(points)
  let acc = 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const segLen = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (acc + segLen >= t * total) {
      const remain = t * total - acc
      const ratio = segLen === 0 ? 0 : remain / segLen
      return [a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio]
    }
    acc += segLen
  }
  return points[points.length - 1]
}

export function tangentAtT(points: [number, number][], t: number): [number, number] {
  const p = pointAtT(points, t)
  // approximate derivative by sampling nearby t
  const delta = 1e-3
  const p1 = pointAtT(points, Math.max(0, t - delta))
  const p2 = pointAtT(points, Math.min(1, t + delta))
  return [p2[0] - p1[0], p2[1] - p1[1]]
}

export default {}
