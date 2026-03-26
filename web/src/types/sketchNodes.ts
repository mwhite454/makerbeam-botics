// ─── Sketch Node Category ─────────────────────────────────────────────────────

export type SketchNodeCategory =
  | 'sketch_primitive'
  | 'sketch_boolean'
  | 'sketch_transform'
  | 'sketch_modifier'

// ─── Category styling ─────────────────────────────────────────────────────────

export const SKETCH_CATEGORY_COLORS: Record<SketchNodeCategory, string> = {
  sketch_primitive: 'bg-pink-600',
  sketch_boolean:   'bg-red-600',
  sketch_transform: 'bg-orange-500',
  sketch_modifier:  'bg-teal-600',
}

export const SKETCH_CATEGORY_TEXT: Record<SketchNodeCategory, string> = {
  sketch_primitive: 'text-white',
  sketch_boolean:   'text-white',
  sketch_transform: 'text-white',
  sketch_modifier:  'text-white',
}

export const SKETCH_CATEGORY_LABELS: Record<SketchNodeCategory, string> = {
  sketch_primitive: 'Primitives',
  sketch_boolean:   'Booleans',
  sketch_transform: 'Transforms',
  sketch_modifier:  'Modifiers',
}

// ─── Node data types ──────────────────────────────────────────────────────────

export interface SketchRectangleData {
  width: number
  height: number
  cornerRadius: number
  center: boolean
}

export interface SketchCircleData {
  radius: number
  segments: number
}

export interface SketchNgonData {
  sides: number
  radius: number
  inscribed: boolean   // inscribed vs circumscribed
}

export interface SketchLineData {
  points: string       // JSON array [[x,y], [x,y], ...]
  closed: boolean
}

export interface SketchArcData {
  radius: number
  startAngle: number
  endAngle: number
}

export interface SketchEllipseData {
  rx: number
  ry: number
}

export interface SketchBooleanData {
  childCount: number
}

export interface SketchTranslateData {
  x: number
  y: number
}

export interface SketchRotateData {
  angle: number
}

export interface SketchScaleData {
  x: number
  y: number
}

export interface SketchMirrorData {
  axisAngle: number   // angle of mirror axis in degrees
}

export interface SketchOffsetData {
  distance: number
}

// ─── Union type ───────────────────────────────────────────────────────────────

export type AllSketchNodeData =
  | SketchRectangleData
  | SketchCircleData
  | SketchNgonData
  | SketchLineData
  | SketchArcData
  | SketchEllipseData
  | SketchBooleanData
  | SketchTranslateData
  | SketchRotateData
  | SketchScaleData
  | SketchMirrorData
  | SketchOffsetData

// ─── Palette definition ───────────────────────────────────────────────────────

export interface SketchPaletteItem {
  type: string
  label: string
  category: SketchNodeCategory
  defaultData: AllSketchNodeData
}

export const SKETCH_PALETTE_ITEMS: SketchPaletteItem[] = [
  // Primitives
  { type: 'sketch_rectangle', label: 'rectangle', category: 'sketch_primitive', defaultData: { width: 40, height: 20, cornerRadius: 0, center: true } as SketchRectangleData },
  { type: 'sketch_circle',    label: 'circle',    category: 'sketch_primitive', defaultData: { radius: 20, segments: 0 } as SketchCircleData },
  { type: 'sketch_ngon',      label: 'n-gon',     category: 'sketch_primitive', defaultData: { sides: 6, radius: 20, inscribed: true } as SketchNgonData },
  { type: 'sketch_line',      label: 'polyline',  category: 'sketch_primitive', defaultData: { points: '[[0,0],[20,0],[20,20]]', closed: false } as SketchLineData },
  { type: 'sketch_arc',       label: 'arc',       category: 'sketch_primitive', defaultData: { radius: 20, startAngle: 0, endAngle: 180 } as SketchArcData },
  { type: 'sketch_ellipse',   label: 'ellipse',   category: 'sketch_primitive', defaultData: { rx: 30, ry: 15 } as SketchEllipseData },

  // Booleans
  { type: 'sketch_union',      label: 'union',      category: 'sketch_boolean', defaultData: { childCount: 2 } as SketchBooleanData },
  { type: 'sketch_difference', label: 'difference', category: 'sketch_boolean', defaultData: { childCount: 2 } as SketchBooleanData },
  { type: 'sketch_intersect',  label: 'intersect',  category: 'sketch_boolean', defaultData: { childCount: 2 } as SketchBooleanData },

  // Transforms
  { type: 'sketch_translate', label: 'translate', category: 'sketch_transform', defaultData: { x: 0, y: 0 } as SketchTranslateData },
  { type: 'sketch_rotate',    label: 'rotate',    category: 'sketch_transform', defaultData: { angle: 0 } as SketchRotateData },
  { type: 'sketch_scale',     label: 'scale',     category: 'sketch_transform', defaultData: { x: 1, y: 1 } as SketchScaleData },
  { type: 'sketch_mirror',    label: 'mirror',    category: 'sketch_transform', defaultData: { axisAngle: 0 } as SketchMirrorData },

  // Modifiers
  { type: 'sketch_offset', label: 'offset', category: 'sketch_modifier', defaultData: { distance: 2 } as SketchOffsetData },
]
