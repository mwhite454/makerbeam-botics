import { anchorsToPoints, pathLength, pointAtT, tangentAtT } from './paths'
import type { Path, LayoutOptions, LayoutResult, Transform2D } from '@/types/sketchPath'

export function layoutAlongPath(path: Path, options: LayoutOptions): LayoutResult {
  const pts = anchorsToPoints(path)
  const result: Transform2D[] = []
  if (pts.length === 0) return { transforms: [], positions: [] }

  const len = pathLength(pts)
  let positions: [number, number][] = []
  if (options.mode === 'count' && options.count && options.count > 0) {
    const count = options.count
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count
      positions.push(pointAtT(pts, t))
    }
  } else if (options.mode === 'distance' && options.distance && options.distance > 0) {
    const step = Math.max(0.0001, options.distance)
    const n = Math.max(1, Math.floor(len / step))
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) * (step / len)
      positions.push(pointAtT(pts, Math.min(1, t)))
    }
  } else {
    // fallback: single center
    positions.push(pointAtT(pts, 0.5))
  }

  const transforms: Transform2D[] = positions.map((p, idx) => {
    const t = Math.min(1, Math.max(0, (idx + 0.5) / (positions.length || 1)))
    const tan = tangentAtT(pts, t)
    const angle = Math.atan2(tan[1], tan[0])
    const rotation = options.orientation === 'normal' ? angle + Math.PI / 2 : angle
    return { x: p[0], y: p[1], rotation, scale: 1 }
  })

  return { transforms, positions: positions.map((p) => ({ x: p[0], y: p[1] })) }
}

export default layoutAlongPath
