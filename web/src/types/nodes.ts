// ─── Node Category ────────────────────────────────────────────────────────────

export type NodeCategory =
  | 'primitive3d'
  | 'primitive2d'
  | 'transform'
  | 'boolean'
  | 'extrusion'
  | 'modifier'
  | 'makerbeam'

// ─── Category styling ─────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  primitive3d: 'bg-blue-600',
  primitive2d: 'bg-cyan-600',
  transform:   'bg-orange-500',
  boolean:     'bg-red-600',
  extrusion:   'bg-purple-600',
  modifier:    'bg-green-600',
  makerbeam:   'bg-yellow-500',
}

export const CATEGORY_TEXT: Record<NodeCategory, string> = {
  primitive3d: 'text-white',
  primitive2d: 'text-white',
  transform:   'text-white',
  boolean:     'text-white',
  extrusion:   'text-white',
  modifier:    'text-white',
  makerbeam:   'text-gray-900',
}

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  primitive3d: '3D Primitives',
  primitive2d: '2D Primitives',
  transform:   'Transforms',
  boolean:     'Booleans',
  extrusion:   'Extrusions',
  modifier:    'Modifiers',
  makerbeam:   'MakerBeam',
}

// ─── Node data types ──────────────────────────────────────────────────────────

// 3D Primitives
export interface SphereData    { r: number; fn: number }
export interface CubeData      { x: number; y: number; z: number; center: boolean }
export interface CylinderData  { h: number; r1: number; r2: number; center: boolean; fn: number }
export interface PolyhedronData { points: string; faces: string }  // JSON arrays as strings

// 2D Primitives
export interface CircleData    { r: number; fn: number }
export interface SquareData    { x: number; y: number; center: boolean }
export interface PolygonData   { points: string }  // JSON array as string
export interface TextData      { text: string; size: number; font: string; halign: string; valign: string }

// Transforms
export interface TranslateData  { x: number; y: number; z: number }
export interface RotateData     { x: number; y: number; z: number }
export interface ScaleData      { x: number; y: number; z: number }
export interface MirrorData     { x: number; y: number; z: number }
export interface ResizeData     { x: number; y: number; z: number; auto: boolean }
export interface MultmatrixData { matrix: string }  // 4x4 as JSON
export interface OffsetData     { r: number; delta: number; useR: boolean; chamfer: boolean }

// Booleans
export interface BooleanData   { childCount: number }

// Extrusions
export interface LinearExtrudeData  { height: number; center: boolean; twist: number; slices: number; scale: number; fn: number }
export interface RotateExtrudeData  { angle: number; fn: number }

// Modifiers
export interface ColorData      { r: number; g: number; b: number; alpha: number }
export interface ProjectionData { cut: boolean }

// MakerBeam
export interface MakerBeamData  { length: number }

// ─── Node type → data mapping ─────────────────────────────────────────────────

export type AllNodeData =
  | SphereData
  | CubeData
  | CylinderData
  | PolyhedronData
  | CircleData
  | SquareData
  | PolygonData
  | TextData
  | TranslateData
  | RotateData
  | ScaleData
  | MirrorData
  | ResizeData
  | MultmatrixData
  | OffsetData
  | BooleanData
  | LinearExtrudeData
  | RotateExtrudeData
  | ColorData
  | ProjectionData
  | MakerBeamData

// ─── Palette definition ───────────────────────────────────────────────────────

export interface PaletteItem {
  type: string
  label: string
  category: NodeCategory
  defaultData: AllNodeData
}

export const PALETTE_ITEMS: PaletteItem[] = [
  // 3D Primitives
  { type: 'sphere',     label: 'sphere',     category: 'primitive3d', defaultData: { r: 10, fn: 32 } as SphereData },
  { type: 'cube',       label: 'cube',       category: 'primitive3d', defaultData: { x: 10, y: 10, z: 10, center: false } as CubeData },
  { type: 'cylinder',   label: 'cylinder',   category: 'primitive3d', defaultData: { h: 10, r1: 5, r2: 5, center: false, fn: 32 } as CylinderData },
  { type: 'polyhedron', label: 'polyhedron', category: 'primitive3d', defaultData: { points: '[[0,0,0],[1,0,0],[0,1,0],[0,0,1]]', faces: '[[0,1,2],[0,1,3],[0,2,3],[1,2,3]]' } as PolyhedronData },

  // 2D Primitives
  { type: 'circle',   label: 'circle',   category: 'primitive2d', defaultData: { r: 10, fn: 32 } as CircleData },
  { type: 'square',   label: 'square',   category: 'primitive2d', defaultData: { x: 10, y: 10, center: false } as SquareData },
  { type: 'polygon',  label: 'polygon',  category: 'primitive2d', defaultData: { points: '[[0,0],[10,0],[5,10]]' } as PolygonData },
  { type: 'scadtext', label: 'text',     category: 'primitive2d', defaultData: { text: 'Hello', size: 10, font: 'Liberation Sans', halign: 'left', valign: 'baseline' } as TextData },

  // Transforms
  { type: 'translate',  label: 'translate',  category: 'transform', defaultData: { x: 0, y: 0, z: 0 } as TranslateData },
  { type: 'rotate',     label: 'rotate',     category: 'transform', defaultData: { x: 0, y: 0, z: 0 } as RotateData },
  { type: 'scale',      label: 'scale',      category: 'transform', defaultData: { x: 1, y: 1, z: 1 } as ScaleData },
  { type: 'mirror',     label: 'mirror',     category: 'transform', defaultData: { x: 1, y: 0, z: 0 } as MirrorData },
  { type: 'resize',     label: 'resize',     category: 'transform', defaultData: { x: 10, y: 10, z: 10, auto: false } as ResizeData },
  { type: 'multmatrix', label: 'multmatrix', category: 'transform', defaultData: { matrix: '[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]' } as MultmatrixData },
  { type: 'offset',     label: 'offset',     category: 'transform', defaultData: { r: 1, delta: 1, useR: true, chamfer: false } as OffsetData },

  // Booleans
  { type: 'union',        label: 'union',        category: 'boolean', defaultData: { childCount: 2 } as BooleanData },
  { type: 'difference',   label: 'difference',   category: 'boolean', defaultData: { childCount: 2 } as BooleanData },
  { type: 'intersection', label: 'intersection', category: 'boolean', defaultData: { childCount: 2 } as BooleanData },

  // Extrusions
  { type: 'linear_extrude', label: 'linear_extrude', category: 'extrusion', defaultData: { height: 10, center: false, twist: 0, slices: 20, scale: 1, fn: 0 } as LinearExtrudeData },
  { type: 'rotate_extrude', label: 'rotate_extrude', category: 'extrusion', defaultData: { angle: 360, fn: 32 } as RotateExtrudeData },

  // Modifiers
  { type: 'hull',       label: 'hull',       category: 'modifier', defaultData: { childCount: 2 } as BooleanData },
  { type: 'minkowski',  label: 'minkowski',  category: 'modifier', defaultData: { childCount: 2 } as BooleanData },
  { type: 'color',      label: 'color',      category: 'modifier', defaultData: { r: 0.5, g: 0.5, b: 0.8, alpha: 1 } as ColorData },
  { type: 'projection', label: 'projection', category: 'modifier', defaultData: { cut: false } as ProjectionData },

  // MakerBeam
  { type: 'makerbeam', label: 'makerbeam', category: 'makerbeam', defaultData: { length: 150 } as MakerBeamData },
]
