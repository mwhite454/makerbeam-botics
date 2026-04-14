import type { Expr } from '@/types/nodes'

// ─── Tier 2: 2D Shape Primitives ──────────────────────────────────────────────

export interface Bosl2RectData {
  x: Expr; y: Expr
  rounding: Expr; chamfer: Expr
  anchor: string; spin: Expr
}

export interface Bosl2EllipseData {
  rx: Expr; ry: Expr
  anchor: string; spin: Expr
}

export interface Bosl2RegularNgonData {
  n: Expr; r: Expr
  anchor: string; spin: Expr
}

export interface Bosl2PentagonData {
  r: Expr
  anchor: string; spin: Expr
}

export interface Bosl2HexagonData {
  r: Expr; rounding: Expr
  anchor: string; spin: Expr
}

export interface Bosl2OctagonData {
  r: Expr; rounding: Expr
  anchor: string; spin: Expr
}

export interface Bosl2StarData {
  n: Expr; r: Expr; ir: Expr
  anchor: string; spin: Expr
}

export interface Bosl2TrapezoidData {
  h: Expr; w1: Expr; w2: Expr
  rounding: Expr
  anchor: string; spin: Expr
}

export interface Bosl2RightTriangleData {
  x: Expr; y: Expr
  anchor: string; spin: Expr
}

export interface Bosl2Teardrop2dData {
  r: Expr; ang: Expr
  anchor: string; spin: Expr
}

export interface Bosl2SquircleData {
  x: Expr; y: Expr; squareness: Expr
  anchor: string; spin: Expr
}

export interface Bosl2RingData {
  n: Expr; r1: Expr; r2: Expr
  anchor: string; spin: Expr
}
