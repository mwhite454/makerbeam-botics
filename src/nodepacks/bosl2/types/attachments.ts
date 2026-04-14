import type { Expr } from '@/types/nodes'

// ─── Tier 6: Attachments & Advanced ──────────────────────────────────────────

export interface Bosl2DiffData {
  remove: string; keep: string
}

export interface Bosl2IntersectData {
  intersect: string; keep: string
}

export interface Bosl2PositionData {
  at: string
}

export interface Bosl2AttachData {
  parent: string; child: string
  overlap: Expr
}

export interface Bosl2TagData {
  tag: string
}

export interface Bosl2RecolorData {
  c: string
}

export interface Bosl2HalfOfData {
  vx: Expr; vy: Expr; vz: Expr
  cpx: Expr; cpy: Expr; cpz: Expr
}

export interface Bosl2PartitionData {
  x: Expr; y: Expr; z: Expr
  spread: Expr; cutpath: string
}
