import type { PaletteItem } from '@/types/nodes'

export const ROUNDING_PALETTE: PaletteItem[] = [
  {
    type: 'bosl2_offset_sweep', label: 'offset_sweep', category: 'bosl2_rounding',
    defaultData: { height: 10, top_r: 1, bot_r: 1, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 offset_sweep() — sweep a 2D path upward with offset profiles.',
    inputs: 'height; top_r, bot_r — rounding radii at top/bottom',
  },
  {
    type: 'bosl2_rounded_prism', label: 'rounded_prism', category: 'bosl2_rounding',
    defaultData: { height: 10, joint_top: 1, joint_bot: 1, joint_sides: 1, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 rounded_prism() — prism with continuous curvature rounding.',
    inputs: 'height; joint_top, joint_bot, joint_sides — joint radii',
  },
  {
    type: 'bosl2_skin', label: 'skin', category: 'bosl2_rounding',
    defaultData: { slices: 10, method: 'reindex', style: 'min_edge' },
    description: 'BOSL2 skin() — create a solid between a list of profiles.',
    inputs: 'slices; method — vertex matching; style — triangulation',
  },
  {
    type: 'bosl2_linear_sweep', label: 'linear_sweep', category: 'bosl2_rounding',
    defaultData: { height: 10, twist: 0, scale: 1, slices: 0, center: false, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 linear_sweep() — enhanced linear extrusion with twist and scale.',
    inputs: 'height; twist — degrees; scale; slices; center',
  },
  {
    type: 'bosl2_rotate_sweep', label: 'rotate_sweep', category: 'bosl2_rounding',
    defaultData: { angle: 360, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 rotate_sweep() — enhanced rotational extrusion.',
    inputs: 'angle — sweep angle in degrees',
  },
  {
    type: 'bosl2_path_sweep', label: 'path_sweep', category: 'bosl2_rounding',
    defaultData: { method: 'incremental', twist: 0, closed: false, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 path_sweep() — sweep a 2D shape along a 3D path.',
    inputs: 'method; twist; closed',
  },
  {
    type: 'bosl2_spiral_sweep', label: 'spiral_sweep', category: 'bosl2_rounding',
    defaultData: { h: 20, r: 10, turns: 3, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 spiral_sweep() — sweep a profile in a spiral/helix.',
    inputs: 'h — height; r — radius; turns — number of revolutions',
  },
  {
    type: 'bosl2_edge_mask', label: 'edge_mask', category: 'bosl2_rounding',
    defaultData: { edges: 'ALL', except: '' },
    description: 'BOSL2 edge_mask() — apply a mask to selected edges of a parent shape.',
    inputs: 'edges — edge selection; except — edges to skip',
  },
  {
    type: 'bosl2_corner_mask', label: 'corner_mask', category: 'bosl2_rounding',
    defaultData: { corners: 'ALL', except: '' },
    description: 'BOSL2 corner_mask() — apply a mask to selected corners of a parent shape.',
    inputs: 'corners — corner selection; except — corners to skip',
  },
  {
    type: 'bosl2_rounding_edge_mask', label: 'rounding_edge_mask', category: 'bosl2_rounding',
    defaultData: { h: 10, r: 2, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 rounding_edge_mask() — mask for rounding edges.',
    inputs: 'h — length; r — rounding radius',
  },
  {
    type: 'bosl2_chamfer_edge_mask', label: 'chamfer_edge_mask', category: 'bosl2_rounding',
    defaultData: { h: 10, chamfer: 2, anchor: 'CENTER', spin: 0, orient: 'UP' },
    description: 'BOSL2 chamfer_edge_mask() — mask for chamfering edges.',
    inputs: 'h — length; chamfer — chamfer size',
  },
  {
    type: 'bosl2_stroke', label: 'stroke', category: 'bosl2_rounding',
    defaultData: { width: 1, closed: false, endcaps: 'butt' },
    description: 'BOSL2 stroke() — draw a path as a 3D stroke with width.',
    inputs: 'width; closed; endcaps — end cap style',
  },
]
