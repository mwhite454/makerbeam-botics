// ─── Sketch Node Category ─────────────────────────────────────────────────────

export type SketchNodeCategory =
  | 'sketch_primitive'
  | 'sketch_boolean'
  | 'sketch_transform'
  | 'sketch_modifier'
  | 'sketch_control'

// ─── Category styling ─────────────────────────────────────────────────────────

export const SKETCH_CATEGORY_COLORS: Record<SketchNodeCategory, string> = {
  sketch_primitive: 'bg-pink-600',
  sketch_boolean:   'bg-red-600',
  sketch_transform: 'bg-orange-500',
  sketch_modifier:  'bg-teal-600',
  sketch_control:   'bg-amber-600',
}

export const SKETCH_CATEGORY_TEXT: Record<SketchNodeCategory, string> = {
  sketch_primitive: 'text-white',
  sketch_boolean:   'text-white',
  sketch_transform: 'text-white',
  sketch_modifier:  'text-white',
  sketch_control:   'text-white',
}

export const SKETCH_CATEGORY_LABELS: Record<SketchNodeCategory, string> = {
  sketch_primitive: 'Primitives',
  sketch_boolean:   'Booleans',
  sketch_transform: 'Transforms',
  sketch_modifier:  'Modifiers',
  sketch_control:   'Control',
}

// ─── Node data types ──────────────────────────────────────────────────────────

import type { Expr } from '@/types/nodes'
export type { Expr }

export interface SketchRectangleData {
  width: Expr
  height: Expr
  cornerRadius: Expr
  center: boolean
}

export interface SketchCircleData {
  radius: Expr
  segments: number   // integer-only, not expression
}

export interface SketchNgonData {
  sides: number      // integer-only, not expression
  radius: Expr
  inscribed: boolean   // inscribed vs circumscribed
}

export interface SketchLineData {
  points: string       // JSON array [[x,y], [x,y], ...]
  closed: boolean
}

export interface SketchArcData {
  radius: Expr
  startAngle: Expr
  endAngle: Expr
}

export interface SketchEllipseData {
  rx: Expr
  ry: Expr
}

export interface SketchBooleanData {
  childCount: number
}

export interface SketchTranslateData {
  x: Expr
  y: Expr
}

export interface SketchRotateData {
  angle: Expr
}

export interface SketchScaleData {
  x: Expr
  y: Expr
}

export interface SketchMirrorData {
  axisAngle: Expr   // angle of mirror axis in degrees
}

export interface SketchOffsetData {
  distance: Expr
}

export interface SketchExpressionData {
  parameterName: string
  expression: string
}

// Path primitives (connect-the-dots)
export interface SketchPathData {
  // JSON array of anchor objects: [{id, pos:[x,y], handleIn?, handleOut?, kind?}, ...]
  anchorsJson: string
  closed: boolean
}

export interface SketchPathLayoutData {
  mode: 'count' | 'distance'
  count: number
  distance: number
  orientation: 'tangent' | 'normal' | 'fixed'
  align: 'start' | 'center' | 'end'
  offset: number
}

// ─── Union type ───────────────────────────────────────────────────────────────

import type { NodeMeta, GroupNodeData } from './nodes'
export type { NodeMeta }

export type AllSketchNodeData =
  (| SketchRectangleData
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
  | SketchExpressionData
  | SketchPathData
  | SketchPathLayoutData
  | GroupNodeData
  ) & NodeMeta

// ─── Palette definition ───────────────────────────────────────────────────────

export interface SketchPaletteItem {
  type: string
  label: string
  category: SketchNodeCategory
  defaultData: AllSketchNodeData
  description?: string
  inputs?: string
}

export const SKETCH_PALETTE_ITEMS: SketchPaletteItem[] = [
  // Primitives
  { type: 'sketch_rectangle', label: 'rectangle', category: 'sketch_primitive', defaultData: { width: 40, height: 20, cornerRadius: 0, center: true } as SketchRectangleData,
    description: 'Draws a 2D rectangle, optionally with rounded corners.', inputs: 'width / height · cornerRadius · center' },
  { type: 'sketch_circle',    label: 'circle',    category: 'sketch_primitive', defaultData: { radius: 20, segments: 0 } as SketchCircleData,
    description: 'Draws a 2D circle.', inputs: 'radius · segments (0 = auto smooth)' },
  { type: 'sketch_ngon',      label: 'n-gon',     category: 'sketch_primitive', defaultData: { sides: 6, radius: 20, inscribed: true } as SketchNgonData,
    description: 'Draws a regular polygon with N equal sides.', inputs: 'sides · radius · inscribed (vs circumscribed)' },
  { type: 'sketch_line',      label: 'polyline',  category: 'sketch_primitive', defaultData: { points: '[[0,0],[20,0],[20,20]]', closed: false } as SketchLineData,
    description: 'Draws an open or closed polyline through an explicit list of 2D points.', inputs: 'points — [[x,y]…] · closed — connect last point to first' },
  { type: 'sketch_arc',       label: 'arc',       category: 'sketch_primitive', defaultData: { radius: 20, startAngle: 0, endAngle: 180 } as SketchArcData,
    description: 'Draws a circular arc between two angles.', inputs: 'radius · startAngle / endAngle (degrees)' },
  { type: 'sketch_ellipse',   label: 'ellipse',   category: 'sketch_primitive', defaultData: { rx: 30, ry: 15 } as SketchEllipseData,
    description: 'Draws an ellipse with independent X and Y radii.', inputs: 'rx — horizontal radius · ry — vertical radius' },

  // Path & layout
  { type: 'sketch_path', label: 'path', category: 'sketch_primitive', defaultData: { anchorsJson: '[]', closed: false } as SketchPathData,
    description: 'A connect-the-dots path composed of anchors and optional bezier handles.', inputs: 'anchorsJson · closed' },
  { type: 'sketch_path_layout', label: 'layout', category: 'sketch_control', defaultData: { mode: 'count', count: 6, distance: 10, orientation: 'tangent', align: 'center', offset: 0 } as SketchPathLayoutData,
    description: 'Place a template shape along a path with spacing and orientation options.', inputs: 'template · path · spacing · orientation' },

  // Booleans
  { type: 'sketch_union',      label: 'union',      category: 'sketch_boolean', defaultData: { childCount: 2 } as SketchBooleanData,
    description: 'Merges all child shapes into a single 2D outline (logical OR).', inputs: 'connects to: 2+ child nodes' },
  { type: 'sketch_difference', label: 'difference', category: 'sketch_boolean', defaultData: { childCount: 2 } as SketchBooleanData,
    description: 'Subtracts subsequent child shapes from the first (logical NOT).', inputs: 'connects to: 2+ child nodes (first is the base)' },
  { type: 'sketch_intersect',  label: 'intersect',  category: 'sketch_boolean', defaultData: { childCount: 2 } as SketchBooleanData,
    description: 'Keeps only the area shared by all child shapes (logical AND).', inputs: 'connects to: 2+ child nodes' },

  // Transforms
  { type: 'sketch_translate', label: 'translate', category: 'sketch_transform', defaultData: { x: 0, y: 0 } as SketchTranslateData,
    description: 'Moves child shapes by an X/Y offset.', inputs: 'x / y — offset · connects to: child nodes' },
  { type: 'sketch_rotate',    label: 'rotate',    category: 'sketch_transform', defaultData: { angle: 0 } as SketchRotateData,
    description: 'Rotates child shapes around the origin by an angle.', inputs: 'angle — degrees · connects to: child nodes' },
  { type: 'sketch_scale',     label: 'scale',     category: 'sketch_transform', defaultData: { x: 1, y: 1 } as SketchScaleData,
    description: 'Scales child shapes by per-axis factors.', inputs: 'x / y — scale factors · connects to: child nodes' },
  { type: 'sketch_mirror',    label: 'mirror',    category: 'sketch_transform', defaultData: { axisAngle: 0 } as SketchMirrorData,
    description: 'Mirrors child shapes across an axis defined by its angle from the X axis.', inputs: 'axisAngle — degrees · connects to: child nodes' },

  // Modifiers
  { type: 'sketch_offset', label: 'offset', category: 'sketch_modifier', defaultData: { distance: 2 } as SketchOffsetData,
    description: 'Expands or contracts a 2D shape by a fixed distance (positive = outward).', inputs: 'distance — offset amount (negative to shrink)' },

  // Control
  { type: 'sketch_expression', label: 'expression', category: 'sketch_control', defaultData: { parameterName: '', expression: '{param}' } as SketchExpressionData,
    description: 'Evaluates an expression and exposes the result as a named value for use by other nodes.', inputs: 'parameter name · expression (use {varName} to reference upstream values)' },
]
