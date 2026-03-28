export type SegmentType = 'line' | 'polyline' | 'bezier' | 'arc'

export interface Vec2 {
  x: number
  y: number
}

export interface Anchor {
  id: string
  pos: Vec2
  // Optional Bezier handles (relative to anchor position, in absolute coordinates)
  handleIn?: Vec2 | null
  handleOut?: Vec2 | null
  // 'corner' = sharp, 'smooth' = used with bezier handles
  kind?: 'corner' | 'smooth'
}

export interface Segment {
  id: string
  type: SegmentType
  // Ordered anchor ids belonging to this segment (usually 2 for line, >2 for polyline)
  anchors: string[]
  // Optional metadata (e.g., for arcs: radius, sweep)
  meta?: Record<string, any>
}

export interface Path {
  id: string
  anchors: Anchor[]
  segments: Segment[]
  closed?: boolean
  // Cached length (optional) and other derived properties
  length?: number
  // Arbitrary user label or tag
  label?: string
}

export type SpacingMode = 'count' | 'distance'
export type OrientationMode = 'tangent' | 'normal' | 'fixed'

export interface LayoutOptions {
  mode: SpacingMode
  count?: number
  distance?: number
  orientation?: OrientationMode
  align?: 'start' | 'center' | 'end'
  offset?: number
}

export interface Transform2D {
  x: number
  y: number
  rotation: number // radians
  scale?: number
}

export interface LayoutResult {
  transforms: Transform2D[]
  positions: Vec2[]
}

export default Path
