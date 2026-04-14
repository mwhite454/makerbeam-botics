import type { Expr } from '@/types/nodes'

// ─── Tier 4: Rounding, Masks, Sweeps ─────────────────────────────────────────

export interface Bosl2OffsetSweepData {
  height: Expr; top_r: Expr; bot_r: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2RoundedPrismData {
  height: Expr; joint_top: Expr; joint_bot: Expr; joint_sides: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2SkinData {
  shapes: string; slices: Expr; method: string; style: string
}

export interface Bosl2LinearSweepData {
  height: Expr; twist: Expr; scale: Expr; slices: Expr; center: boolean
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2RotateSweepData {
  angle: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2PathSweepData {
  method: string; twist: Expr; closed: boolean
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2SpiralSweepData {
  h: Expr; r: Expr; turns: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2EdgeMaskData {
  edges: string; except: string
}

export interface Bosl2CornerMaskData {
  corners: string; except: string
}

export interface Bosl2RoundingEdgeMaskData {
  h: Expr; r: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2ChamferEdgeMaskData {
  h: Expr; chamfer: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2StrokeData {
  width: Expr; closed: boolean; endcaps: string
}

export interface Bosl2FilletData {
  h: Expr; r: Expr; ang: Expr
  anchor: string; spin: Expr; orient: string
}
