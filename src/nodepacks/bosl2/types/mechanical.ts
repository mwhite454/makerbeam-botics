import type { Expr } from '@/types/nodes'

// ─── Tier 5: Mechanical Parts ────────────────────────────────────────────────

export interface Bosl2SpurGearData {
  mod: Expr; teeth: Expr; thickness: Expr
  pressure_angle: Expr; helical: Expr; shaft_diam: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2RackData {
  mod: Expr; teeth: Expr; thickness: Expr
  pressure_angle: Expr; helical: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2BevelGearData {
  mod: Expr; teeth: Expr; mate_teeth: Expr
  shaft_angle: Expr; face_width: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2WormData {
  mod: Expr; d: Expr; l: Expr; starts: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2WormGearData {
  mod: Expr; teeth: Expr; worm_diam: Expr; worm_starts: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2ThreadedRodData {
  d: Expr; l: Expr; pitch: Expr; internal: boolean
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2ThreadedNutData {
  nutwidth: Expr; id: Expr; h: Expr; pitch: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2ScrewData {
  spec: string; head: string; drive: string
  length: Expr; thread_len: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2ScrewHoleData {
  spec: string; head: string
  length: Expr; oversize: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2NutData {
  spec: string; shape: string; thickness: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2DovetailData {
  gender: string; width: Expr; height: Expr
  slope: Expr; slide: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2SnapPinData {
  r: Expr; l: Expr; nub_depth: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2KnuckleHingeData {
  length: Expr; offset: Expr; segs: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2BottleNeckData {
  wall: Expr
  anchor: string; spin: Expr; orient: string
}

export interface Bosl2BottleCapData {
  wall: Expr; texture: string
  anchor: string; spin: Expr; orient: string
}
