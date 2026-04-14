import type { PaletteItem } from '@/types/nodes'

export const SHAPES2D_PALETTE: PaletteItem[] = [
  {
    type: 'bosl2_rect', label: 'rect', category: 'bosl2_shapes2d',
    defaultData: { x: 20, y: 10, rounding: 0, chamfer: 0, anchor: 'CENTER', spin: 0 },
    description: 'BOSL2 enhanced rectangle with optional rounding and chamfer.',
    inputs: 'x, y — dimensions; rounding, chamfer',
  },
  {
    type: 'bosl2_ellipse', label: 'ellipse', category: 'bosl2_shapes2d',
    defaultData: { rx: 10, ry: 5, anchor: 'CENTER', spin: 0 },
    description: 'BOSL2 ellipse.',
    inputs: 'rx, ry — semi-axis radii',
  },
  {
    type: 'bosl2_regular_ngon', label: 'regular_ngon', category: 'bosl2_shapes2d',
    defaultData: { n: 6, r: 10, anchor: 'CENTER', spin: 0 },
    description: 'BOSL2 regular N-sided polygon.',
    inputs: 'n — number of sides; r — radius',
  },
  {
    type: 'bosl2_pentagon', label: 'pentagon', category: 'bosl2_shapes2d',
    defaultData: { r: 10, anchor: 'CENTER', spin: 0 },
    description: 'BOSL2 regular pentagon.',
    inputs: 'r — radius',
  },
  {
    type: 'bosl2_hexagon', label: 'hexagon', category: 'bosl2_shapes2d',
    defaultData: { r: 10, rounding: 0, anchor: 'CENTER', spin: 0 },
    description: 'BOSL2 regular hexagon with optional rounding.',
    inputs: 'r — radius; rounding',
  },
  {
    type: 'bosl2_octagon', label: 'octagon', category: 'bosl2_shapes2d',
    defaultData: { r: 10, rounding: 0, anchor: 'CENTER', spin: 0 },
    description: 'BOSL2 regular octagon with optional rounding.',
    inputs: 'r — radius; rounding',
  },
  {
    type: 'bosl2_star', label: 'star', category: 'bosl2_shapes2d',
    defaultData: { n: 5, r: 10, ir: 5, anchor: 'CENTER', spin: 0 },
    description: 'BOSL2 star shape.',
    inputs: 'n — points; r — outer radius; ir — inner radius',
  },
  {
    type: 'bosl2_trapezoid', label: 'trapezoid', category: 'bosl2_shapes2d',
    defaultData: { h: 10, w1: 20, w2: 10, rounding: 0, anchor: 'CENTER', spin: 0 },
    description: 'BOSL2 trapezoid shape.',
    inputs: 'h — height; w1 — bottom width; w2 — top width; rounding',
  },
  {
    type: 'bosl2_right_triangle', label: 'right_triangle', category: 'bosl2_shapes2d',
    defaultData: { x: 10, y: 10, anchor: 'CENTER', spin: 0 },
    description: 'BOSL2 right triangle.',
    inputs: 'x, y — leg lengths',
  },
  {
    type: 'bosl2_teardrop2d', label: 'teardrop2d', category: 'bosl2_shapes2d',
    defaultData: { r: 10, ang: 45, anchor: 'CENTER', spin: 0 },
    description: 'BOSL2 2D teardrop for printable holes.',
    inputs: 'r — radius; ang — angle',
  },
  {
    type: 'bosl2_squircle', label: 'squircle', category: 'bosl2_shapes2d',
    defaultData: { x: 20, y: 20, squareness: 0.5, anchor: 'CENTER', spin: 0 },
    description: 'BOSL2 squircle (rounded square) shape.',
    inputs: 'x, y — dimensions; squareness — 0=circle, 1=square',
  },
  {
    type: 'bosl2_ring', label: 'ring', category: 'bosl2_shapes2d',
    defaultData: { n: 36, r1: 10, r2: 8, anchor: 'CENTER', spin: 0 },
    description: 'BOSL2 2D ring (annulus).',
    inputs: 'n — segments; r1 — outer radius; r2 — inner radius',
  },
]
