import type { PaletteItem } from '@/types/nodes'

export const SHAPES3D_PALETTE: PaletteItem[] = [
  {
    type: 'bosl2_cuboid', label: 'cuboid', category: 'bosl2_shapes3d',
    defaultData: { x: 10, y: 10, z: 10, rounding: 0, chamfer: 0, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 enhanced cube with optional rounding and chamfering on edges.',
    inputs: 'x, y, z — size; rounding — edge radius; chamfer — edge bevel',
  },
  {
    type: 'bosl2_cyl', label: 'cyl', category: 'bosl2_shapes3d',
    defaultData: { h: 10, r: 5, r1: 5, r2: 5, chamfer: 0, rounding: 0, circum: false, fn: 32, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 enhanced cylinder with chamfer and rounding options.',
    inputs: 'h — height; r — radius; r1/r2 — bottom/top radii; chamfer, rounding',
  },
  {
    type: 'bosl2_spheroid', label: 'spheroid', category: 'bosl2_shapes3d',
    defaultData: { r: 10, style: 'aligned', circum: false, fn: 32, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 enhanced sphere with multiple tessellation styles.',
    inputs: 'r — radius; style — tessellation style',
  },
  {
    type: 'bosl2_torus', label: 'torus', category: 'bosl2_shapes3d',
    defaultData: { r_maj: 20, r_min: 5, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 torus (donut shape).',
    inputs: 'r_maj — major radius; r_min — minor (tube) radius',
  },
  {
    type: 'bosl2_tube', label: 'tube', category: 'bosl2_shapes3d',
    defaultData: { h: 20, or: 10, ir: 8, wall: 0, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 hollow tube with inner/outer radius.',
    inputs: 'h — height; or — outer radius; ir — inner radius; wall — wall thickness',
  },
  {
    type: 'bosl2_prismoid', label: 'prismoid', category: 'bosl2_shapes3d',
    defaultData: { size1_x: 20, size1_y: 20, size2_x: 10, size2_y: 10, h: 15, shift_x: 0, shift_y: 0, rounding: 0, chamfer: 0, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 prismoid — a truncated pyramid with rectangular bases.',
    inputs: 'size1 — bottom; size2 — top; h — height; shift — top offset',
  },
  {
    type: 'bosl2_wedge', label: 'wedge', category: 'bosl2_shapes3d',
    defaultData: { x: 10, y: 10, z: 10, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 right-angle wedge.',
    inputs: 'x, y, z — bounding box dimensions',
  },
  {
    type: 'bosl2_pie_slice', label: 'pie_slice', category: 'bosl2_shapes3d',
    defaultData: { h: 10, r: 10, ang: 90, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 pie/wedge slice of a cylinder.',
    inputs: 'h — height; r — radius; ang — sweep angle',
  },
  {
    type: 'bosl2_teardrop', label: 'teardrop', category: 'bosl2_shapes3d',
    defaultData: { h: 10, r: 5, ang: 45, cap_h: 0, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 teardrop shape for 3D printing overhang-friendly holes.',
    inputs: 'h — height; r — radius; ang — teardrop angle; cap_h — cap height',
  },
  {
    type: 'bosl2_onion', label: 'onion', category: 'bosl2_shapes3d',
    defaultData: { r: 10, ang: 45, cap_h: 0, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 onion (teardrop-rotated) shape.',
    inputs: 'r — radius; ang — angle; cap_h — cap height',
  },
  {
    type: 'bosl2_rect_tube', label: 'rect_tube', category: 'bosl2_shapes3d',
    defaultData: { h: 20, size_x: 20, size_y: 20, isize_x: 16, isize_y: 16, wall: 0, rounding: 0, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 rectangular tube with optional rounding.',
    inputs: 'h — height; size — outer dims; isize — inner dims; wall, rounding',
  },
  {
    type: 'bosl2_octahedron', label: 'octahedron', category: 'bosl2_shapes3d',
    defaultData: { size: 20, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 regular octahedron.',
    inputs: 'size — overall size',
  },
  {
    type: 'bosl2_regular_prism', label: 'regular_prism', category: 'bosl2_shapes3d',
    defaultData: { n: 6, h: 10, r: 5, rounding: 0, chamfer: 0, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 regular prism (n-sided) with optional rounding and chamfer.',
    inputs: 'n — sides; h — height; r — radius; rounding, chamfer',
  },
  {
    type: 'bosl2_text3d', label: 'text3d', category: 'bosl2_shapes3d',
    defaultData: { text: 'Hello', h: 2, size: 10, font: 'Liberation Sans', anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 3D extruded text.',
    inputs: 'text — string; h — extrusion height; size — font size; font — font name',
  },
  {
    type: 'bosl2_fillet', label: 'fillet', category: 'bosl2_shapes3d',
    defaultData: { h: 10, r: 3, ang: 90, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 fillet (concave rounding) mask for edges.',
    inputs: 'h — height; r — fillet radius; ang — angle',
  },
]
