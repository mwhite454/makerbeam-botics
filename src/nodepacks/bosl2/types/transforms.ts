import type { Expr } from '@/types/nodes'

// ─── Tier 3: Transforms ──────────────────────────────────────────────────────

export interface Bosl2MoveData { x: Expr; y: Expr; z: Expr }
export interface Bosl2DirectionData { d: Expr }
export interface Bosl2RotData { a: Expr; vx: Expr; vy: Expr; vz: Expr }
export interface Bosl2AxisRotData { a: Expr }
export interface Bosl2AxisScaleData { factor: Expr }
export interface Bosl2AxisFlipData { offset: Expr }
export interface Bosl2SkewData {
  sxy: Expr; sxz: Expr; syx: Expr; syz: Expr; szx: Expr; szy: Expr
}

// ─── Tier 3: Distributors ────────────────────────────────────────────────────

export interface Bosl2AxisCopiesData { spacing: Expr; n: Expr }
export interface Bosl2GridCopiesData {
  spacing_x: Expr; spacing_y: Expr; n_x: Expr; n_y: Expr; stagger: boolean
}
export interface Bosl2RotCopiesData { n: Expr; sa: Expr }
export interface Bosl2ArcCopiesData { n: Expr; r: Expr; sa: Expr; ea: Expr }
export interface Bosl2MirrorCopyData { vx: Expr; vy: Expr; vz: Expr; offset: Expr }
export interface Bosl2PathCopiesData { path: string; n: Expr; closed: boolean }
