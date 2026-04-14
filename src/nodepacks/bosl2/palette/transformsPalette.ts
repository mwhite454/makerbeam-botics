import type { PaletteItem } from '@/types/nodes'

export const TRANSFORMS_PALETTE: PaletteItem[] = [
  {
    type: 'bosl2_move', label: 'move', category: 'bosl2_transforms',
    defaultData: { x: 0, y: 0, z: 0 },
    description: 'BOSL2 move() — positional translation shorthand.',
    inputs: 'x, y, z — translation vector',
  },
  {
    type: 'bosl2_left', label: 'left', category: 'bosl2_transforms',
    defaultData: { d: 10 },
    description: 'BOSL2 left() — translate in −X direction.',
    inputs: 'd — distance',
  },
  {
    type: 'bosl2_right', label: 'right', category: 'bosl2_transforms',
    defaultData: { d: 10 },
    description: 'BOSL2 right() — translate in +X direction.',
    inputs: 'd — distance',
  },
  {
    type: 'bosl2_fwd', label: 'fwd', category: 'bosl2_transforms',
    defaultData: { d: 10 },
    description: 'BOSL2 fwd() — translate in −Y direction.',
    inputs: 'd — distance',
  },
  {
    type: 'bosl2_back', label: 'back', category: 'bosl2_transforms',
    defaultData: { d: 10 },
    description: 'BOSL2 back() — translate in +Y direction.',
    inputs: 'd — distance',
  },
  {
    type: 'bosl2_up', label: 'up', category: 'bosl2_transforms',
    defaultData: { d: 10 },
    description: 'BOSL2 up() — translate in +Z direction.',
    inputs: 'd — distance',
  },
  {
    type: 'bosl2_down', label: 'down', category: 'bosl2_transforms',
    defaultData: { d: 10 },
    description: 'BOSL2 down() — translate in −Z direction.',
    inputs: 'd — distance',
  },
  {
    type: 'bosl2_rot', label: 'rot', category: 'bosl2_transforms',
    defaultData: { a: 0, vx: 0, vy: 0, vz: 0 },
    description: 'BOSL2 rot() — rotation around an arbitrary axis.',
    inputs: 'a — angle; vx, vy, vz — rotation axis vector',
  },
  {
    type: 'bosl2_xrot', label: 'xrot', category: 'bosl2_transforms',
    defaultData: { a: 0 },
    description: 'BOSL2 xrot() — rotation around the X axis.',
    inputs: 'a — angle in degrees',
  },
  {
    type: 'bosl2_yrot', label: 'yrot', category: 'bosl2_transforms',
    defaultData: { a: 0 },
    description: 'BOSL2 yrot() — rotation around the Y axis.',
    inputs: 'a — angle in degrees',
  },
  {
    type: 'bosl2_zrot', label: 'zrot', category: 'bosl2_transforms',
    defaultData: { a: 0 },
    description: 'BOSL2 zrot() — rotation around the Z axis.',
    inputs: 'a — angle in degrees',
  },
  {
    type: 'bosl2_xscale', label: 'xscale', category: 'bosl2_transforms',
    defaultData: { factor: 1 },
    description: 'BOSL2 xscale() — scale along the X axis.',
    inputs: 'factor — scale multiplier',
  },
  {
    type: 'bosl2_yscale', label: 'yscale', category: 'bosl2_transforms',
    defaultData: { factor: 1 },
    description: 'BOSL2 yscale() — scale along the Y axis.',
    inputs: 'factor — scale multiplier',
  },
  {
    type: 'bosl2_zscale', label: 'zscale', category: 'bosl2_transforms',
    defaultData: { factor: 1 },
    description: 'BOSL2 zscale() — scale along the Z axis.',
    inputs: 'factor — scale multiplier',
  },
  {
    type: 'bosl2_xflip', label: 'xflip', category: 'bosl2_transforms',
    defaultData: { offset: 0 },
    description: 'BOSL2 xflip() — mirror across the YZ plane.',
    inputs: 'offset — distance from origin',
  },
  {
    type: 'bosl2_yflip', label: 'yflip', category: 'bosl2_transforms',
    defaultData: { offset: 0 },
    description: 'BOSL2 yflip() — mirror across the XZ plane.',
    inputs: 'offset — distance from origin',
  },
  {
    type: 'bosl2_zflip', label: 'zflip', category: 'bosl2_transforms',
    defaultData: { offset: 0 },
    description: 'BOSL2 zflip() — mirror across the XY plane.',
    inputs: 'offset — distance from origin',
  },
  {
    type: 'bosl2_skew', label: 'skew', category: 'bosl2_transforms',
    defaultData: { sxy: 0, sxz: 0, syx: 0, syz: 0, szx: 0, szy: 0 },
    description: 'BOSL2 skew() — shear transformation.',
    inputs: 'sxy, sxz, syx, syz, szx, szy — shear coefficients',
  },
]

export const DISTRIBUTORS_PALETTE: PaletteItem[] = [
  {
    type: 'bosl2_xcopies', label: 'xcopies', category: 'bosl2_distributors',
    defaultData: { spacing: 10, n: 3 },
    description: 'BOSL2 xcopies() — distribute copies along the X axis.',
    inputs: 'spacing — distance between copies; n — count',
  },
  {
    type: 'bosl2_ycopies', label: 'ycopies', category: 'bosl2_distributors',
    defaultData: { spacing: 10, n: 3 },
    description: 'BOSL2 ycopies() — distribute copies along the Y axis.',
    inputs: 'spacing — distance between copies; n — count',
  },
  {
    type: 'bosl2_zcopies', label: 'zcopies', category: 'bosl2_distributors',
    defaultData: { spacing: 10, n: 3 },
    description: 'BOSL2 zcopies() — distribute copies along the Z axis.',
    inputs: 'spacing — distance between copies; n — count',
  },
  {
    type: 'bosl2_grid_copies', label: 'grid_copies', category: 'bosl2_distributors',
    defaultData: { spacing_x: 10, spacing_y: 10, n_x: 3, n_y: 3, stagger: false },
    description: 'BOSL2 grid_copies() — 2D grid of copies.',
    inputs: 'spacing_x/y — grid spacing; n_x/y — counts; stagger — hex stagger',
  },
  {
    type: 'bosl2_rot_copies', label: 'rot_copies', category: 'bosl2_distributors',
    defaultData: { n: 6, sa: 0 },
    description: 'BOSL2 rot_copies() — rotational array of copies.',
    inputs: 'n — count; sa — start angle',
  },
  {
    type: 'bosl2_arc_copies', label: 'arc_copies', category: 'bosl2_distributors',
    defaultData: { n: 6, r: 20, sa: 0, ea: 360 },
    description: 'BOSL2 arc_copies() — copies distributed along an arc.',
    inputs: 'n — count; r — radius; sa — start angle; ea — end angle',
  },
  {
    type: 'bosl2_mirror_copy', label: 'mirror_copy', category: 'bosl2_distributors',
    defaultData: { vx: 1, vy: 0, vz: 0, offset: 0 },
    description: 'BOSL2 mirror_copy() — copy and mirror across a plane.',
    inputs: 'vx, vy, vz — mirror plane normal; offset',
  },
  {
    type: 'bosl2_path_copies', label: 'path_copies', category: 'bosl2_distributors',
    defaultData: { path: '[]', n: 0, closed: false },
    description: 'BOSL2 path_copies() — distribute copies along a path.',
    inputs: 'path — point array; n — count; closed',
  },
]
