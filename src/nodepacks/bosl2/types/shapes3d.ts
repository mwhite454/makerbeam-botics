import type { Expr } from '@/types/nodes'

// ─── Tier 1: 3D Shape Primitives ──────────────────────────────────────────────

export interface Bosl2CuboidData {
  x: Expr; y: Expr; z: Expr
  rounding: Expr; chamfer: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2CylData {
  h: Expr; r: Expr; r1: Expr; r2: Expr
  chamfer: Expr; rounding: Expr; circum: boolean
  fn: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2SpheroidData {
  r: Expr; style: string; circum: boolean
  fn: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2TorusData {
  r_maj: Expr; r_min: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2TubeData {
  h: Expr; or: Expr; ir: Expr; wall: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2PrismoidData {
  size1_x: Expr; size1_y: Expr
  size2_x: Expr; size2_y: Expr
  h: Expr; shift_x: Expr; shift_y: Expr
  rounding: Expr; chamfer: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2WedgeData {
  x: Expr; y: Expr; z: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2PieSliceData {
  h: Expr; r: Expr; ang: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2TeardropData {
  h: Expr; r: Expr; ang: Expr; cap_h: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2OnionData {
  r: Expr; ang: Expr; cap_h: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2RectTubeData {
  h: Expr
  size_x: Expr; size_y: Expr
  isize_x: Expr; isize_y: Expr
  wall: Expr; rounding: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2OctahedronData {
  size: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2RegularPrismData {
  n: Expr; h: Expr; r: Expr
  rounding: Expr; chamfer: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2Text3dData {
  text: string; h: Expr; size: Expr; font: string
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2FilletData {
  h: Expr; r: Expr; ang: Expr
  anchor: string; spin: Expr; orient: string
}
