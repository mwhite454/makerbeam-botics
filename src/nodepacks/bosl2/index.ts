import type { Node } from '@xyflow/react'
import type { NodePackDefinition } from '@/types/nodePack'
import { bosl2Preamble } from './preamble'

// ─── Node components ─────────────────────────────────────────────────────────

// Tier 1: 3D Shape Primitives
import { CuboidNode } from './nodes/shapes3d/CuboidNode'
import { CylNode } from './nodes/shapes3d/CylNode'
import { SpheroidNode } from './nodes/shapes3d/SpheroidNode'
import { TorusNode } from './nodes/shapes3d/TorusNode'
import { TubeNode } from './nodes/shapes3d/TubeNode'
import { PrismoidNode } from './nodes/shapes3d/PrismoidNode'
import { WedgeNode } from './nodes/shapes3d/WedgeNode'
import { PieSliceNode } from './nodes/shapes3d/PieSliceNode'
import { TeardropNode } from './nodes/shapes3d/TeardropNode'
import { OnionNode } from './nodes/shapes3d/OnionNode'
import { RectTubeNode } from './nodes/shapes3d/RectTubeNode'
import { OctahedronNode } from './nodes/shapes3d/OctahedronNode'
import { RegularPrismNode } from './nodes/shapes3d/RegularPrismNode'
import { Text3dNode } from './nodes/shapes3d/Text3dNode'
import { FilletNode } from './nodes/shapes3d/FilletNode'

// Tier 2: 2D Shape Primitives
import { RectNode } from './nodes/shapes2d/RectNode'
import { EllipseNode } from './nodes/shapes2d/EllipseNode'
import { RegularNgonNode } from './nodes/shapes2d/RegularNgonNode'
import { PentagonNode } from './nodes/shapes2d/PentagonNode'
import { HexagonNode } from './nodes/shapes2d/HexagonNode'
import { OctagonNode } from './nodes/shapes2d/OctagonNode'
import { StarNode } from './nodes/shapes2d/StarNode'
import { TrapezoidNode } from './nodes/shapes2d/TrapezoidNode'
import { RightTriangleNode } from './nodes/shapes2d/RightTriangleNode'
import { Teardrop2dNode } from './nodes/shapes2d/Teardrop2dNode'
import { SquircleNode } from './nodes/shapes2d/SquircleNode'
import { RingNode } from './nodes/shapes2d/RingNode'

// Tier 3: Transforms
import { MoveNode } from './nodes/transforms/MoveNode'
import { LeftNode } from './nodes/transforms/LeftNode'
import { RightNode } from './nodes/transforms/RightNode'
import { FwdNode } from './nodes/transforms/FwdNode'
import { BackNode } from './nodes/transforms/BackNode'
import { UpNode } from './nodes/transforms/UpNode'
import { DownNode } from './nodes/transforms/DownNode'
import { RotNode } from './nodes/transforms/RotNode'
import { XrotNode } from './nodes/transforms/XrotNode'
import { YrotNode } from './nodes/transforms/YrotNode'
import { ZrotNode } from './nodes/transforms/ZrotNode'
import { XscaleNode } from './nodes/transforms/XscaleNode'
import { YscaleNode } from './nodes/transforms/YscaleNode'
import { ZscaleNode } from './nodes/transforms/ZscaleNode'
import { XflipNode } from './nodes/transforms/XflipNode'
import { YflipNode } from './nodes/transforms/YflipNode'
import { ZflipNode } from './nodes/transforms/ZflipNode'
import { SkewNode } from './nodes/transforms/SkewNode'

// Tier 3: Distributors
import { XcopiesNode } from './nodes/distributors/XcopiesNode'
import { YcopiesNode } from './nodes/distributors/YcopiesNode'
import { ZcopiesNode } from './nodes/distributors/ZcopiesNode'
import { GridCopiesNode } from './nodes/distributors/GridCopiesNode'
import { RotCopiesNode } from './nodes/distributors/RotCopiesNode'
import { ArcCopiesNode } from './nodes/distributors/ArcCopiesNode'
import { MirrorCopyNode } from './nodes/distributors/MirrorCopyNode'
import { PathCopiesNode } from './nodes/distributors/PathCopiesNode'

// Tier 4: Rounding, Masks, Sweeps
import { OffsetSweepNode } from './nodes/rounding/OffsetSweepNode'
import { RoundedPrismNode } from './nodes/rounding/RoundedPrismNode'
import { SkinNode } from './nodes/rounding/SkinNode'
import { LinearSweepNode } from './nodes/rounding/LinearSweepNode'
import { RotateSweepNode } from './nodes/rounding/RotateSweepNode'
import { PathSweepNode } from './nodes/rounding/PathSweepNode'
import { SpiralSweepNode } from './nodes/rounding/SpiralSweepNode'
import { EdgeMaskNode } from './nodes/rounding/EdgeMaskNode'
import { CornerMaskNode } from './nodes/rounding/CornerMaskNode'
import { RoundingEdgeMaskNode } from './nodes/rounding/RoundingEdgeMaskNode'
import { ChamferEdgeMaskNode } from './nodes/rounding/ChamferEdgeMaskNode'
import { StrokeNode } from './nodes/rounding/StrokeNode'

// Tier 5: Mechanical Parts
import { SpurGearNode } from './nodes/mechanical/SpurGearNode'
import { RackNode } from './nodes/mechanical/RackNode'
import { BevelGearNode } from './nodes/mechanical/BevelGearNode'
import { WormNode } from './nodes/mechanical/WormNode'
import { WormGearNode } from './nodes/mechanical/WormGearNode'
import { ThreadedRodNode } from './nodes/mechanical/ThreadedRodNode'
import { ThreadedNutNode } from './nodes/mechanical/ThreadedNutNode'
import { ScrewNode } from './nodes/mechanical/ScrewNode'
import { ScrewHoleNode } from './nodes/mechanical/ScrewHoleNode'
import { NutNode } from './nodes/mechanical/NutNode'
import { DovetailNode } from './nodes/mechanical/DovetailNode'
import { SnapPinNode } from './nodes/mechanical/SnapPinNode'
import { KnuckleHingeNode } from './nodes/mechanical/KnuckleHingeNode'
import { BottleNeckNode } from './nodes/mechanical/BottleNeckNode'
import { BottleCapNode } from './nodes/mechanical/BottleCapNode'

// Tier 6: Attachments & Advanced
import { DiffNode } from './nodes/attachments/DiffNode'
import { IntersectNode } from './nodes/attachments/IntersectNode'
import { PositionNode } from './nodes/attachments/PositionNode'
import { AttachNode } from './nodes/attachments/AttachNode'
import { TagNode } from './nodes/attachments/TagNode'
import { RecolorNode } from './nodes/attachments/RecolorNode'
import { HalfOfNode } from './nodes/attachments/HalfOfNode'
import { PartitionNode } from './nodes/attachments/PartitionNode'

// ─── Codegen handlers ────────────────────────────────────────────────────────

import { shapes3dCodegen } from './codegen/shapes3dCodegen'
import { shapes2dCodegen } from './codegen/shapes2dCodegen'
import { transformsCodegen } from './codegen/transformsCodegen'
import { distributorsCodegen } from './codegen/distributorsCodegen'
import { roundingCodegen } from './codegen/roundingCodegen'
import { mechanicalCodegen } from './codegen/mechanicalCodegen'
import { attachmentsCodegen } from './codegen/attachmentsCodegen'

// ─── Palette definitions ─────────────────────────────────────────────────────

import { SHAPES3D_PALETTE } from './palette/shapes3dPalette'
import { SHAPES2D_PALETTE } from './palette/shapes2dPalette'
import { TRANSFORMS_PALETTE, DISTRIBUTORS_PALETTE } from './palette/transformsPalette'
import { ROUNDING_PALETTE } from './palette/roundingPalette'
import { MECHANICAL_PALETTE } from './palette/mechanicalPalette'
import { ATTACHMENTS_PALETTE } from './palette/attachmentsPalette'

// ─── Pack definitions (Option A: one pack per sub-category) ──────────────────
// NOTE: preamble is assigned to bosl2Shapes3dPack ONLY.
// The codegen pipeline calls pack.preamble(nodes) for every registered pack, so
// assigning bosl2Preamble to all 7 packs would emit the includes 7× in the
// generated output. One pack owns the preamble; the others omit the field.

export const bosl2Shapes3dPack: NodePackDefinition = {
  id: 'bosl2_shapes3d',
  category: 'bosl2_shapes3d',
  categoryLabel: 'BOSL2 3D Shapes',
  categoryColor: 'bg-indigo-600',
  categoryTextColor: 'text-white',
  nodeTypes: {
    bosl2_cuboid: CuboidNode,
    bosl2_cyl: CylNode,
    bosl2_spheroid: SpheroidNode,
    bosl2_torus: TorusNode,
    bosl2_tube: TubeNode,
    bosl2_prismoid: PrismoidNode,
    bosl2_wedge: WedgeNode,
    bosl2_pie_slice: PieSliceNode,
    bosl2_teardrop: TeardropNode,
    bosl2_onion: OnionNode,
    bosl2_rect_tube: RectTubeNode,
    bosl2_octahedron: OctahedronNode,
    bosl2_regular_prism: RegularPrismNode,
    bosl2_text3d: Text3dNode,
    bosl2_fillet: FilletNode,
  },
  paletteItems: SHAPES3D_PALETTE,
  codegenHandlers: shapes3dCodegen,
  preamble: bosl2Preamble,
}

export const bosl2Shapes2dPack: NodePackDefinition = {
  id: 'bosl2_shapes2d',
  category: 'bosl2_shapes2d',
  categoryLabel: 'BOSL2 2D Shapes',
  categoryColor: 'bg-teal-600',
  categoryTextColor: 'text-white',
  nodeTypes: {
    bosl2_rect: RectNode,
    bosl2_ellipse: EllipseNode,
    bosl2_regular_ngon: RegularNgonNode,
    bosl2_pentagon: PentagonNode,
    bosl2_hexagon: HexagonNode,
    bosl2_octagon: OctagonNode,
    bosl2_star: StarNode,
    bosl2_trapezoid: TrapezoidNode,
    bosl2_right_triangle: RightTriangleNode,
    bosl2_teardrop2d: Teardrop2dNode,
    bosl2_squircle: SquircleNode,
    bosl2_ring: RingNode,
  },
  paletteItems: SHAPES2D_PALETTE,
  codegenHandlers: shapes2dCodegen,
}

export const bosl2TransformsPack: NodePackDefinition = {
  id: 'bosl2_transforms',
  category: 'bosl2_transforms',
  categoryLabel: 'BOSL2 Transforms',
  categoryColor: 'bg-amber-600',
  categoryTextColor: 'text-white',
  nodeTypes: {
    bosl2_move: MoveNode,
    bosl2_left: LeftNode,
    bosl2_right: RightNode,
    bosl2_fwd: FwdNode,
    bosl2_back: BackNode,
    bosl2_up: UpNode,
    bosl2_down: DownNode,
    bosl2_rot: RotNode,
    bosl2_xrot: XrotNode,
    bosl2_yrot: YrotNode,
    bosl2_zrot: ZrotNode,
    bosl2_xscale: XscaleNode,
    bosl2_yscale: YscaleNode,
    bosl2_zscale: ZscaleNode,
    bosl2_xflip: XflipNode,
    bosl2_yflip: YflipNode,
    bosl2_zflip: ZflipNode,
    bosl2_skew: SkewNode,
  },
  paletteItems: TRANSFORMS_PALETTE,
  codegenHandlers: transformsCodegen,
}

export const bosl2DistributorsPack: NodePackDefinition = {
  id: 'bosl2_distributors',
  category: 'bosl2_distributors',
  categoryLabel: 'BOSL2 Distributors',
  categoryColor: 'bg-lime-600',
  categoryTextColor: 'text-white',
  nodeTypes: {
    bosl2_xcopies: XcopiesNode,
    bosl2_ycopies: YcopiesNode,
    bosl2_zcopies: ZcopiesNode,
    bosl2_grid_copies: GridCopiesNode,
    bosl2_rot_copies: RotCopiesNode,
    bosl2_arc_copies: ArcCopiesNode,
    bosl2_mirror_copy: MirrorCopyNode,
    bosl2_path_copies: PathCopiesNode,
  },
  paletteItems: DISTRIBUTORS_PALETTE,
  codegenHandlers: distributorsCodegen,
}

export const bosl2RoundingPack: NodePackDefinition = {
  id: 'bosl2_rounding',
  category: 'bosl2_rounding',
  categoryLabel: 'BOSL2 Rounding & Sweeps',
  categoryColor: 'bg-violet-600',
  categoryTextColor: 'text-white',
  nodeTypes: {
    bosl2_offset_sweep: OffsetSweepNode,
    bosl2_rounded_prism: RoundedPrismNode,
    bosl2_skin: SkinNode,
    bosl2_linear_sweep: LinearSweepNode,
    bosl2_rotate_sweep: RotateSweepNode,
    bosl2_path_sweep: PathSweepNode,
    bosl2_spiral_sweep: SpiralSweepNode,
    bosl2_edge_mask: EdgeMaskNode,
    bosl2_corner_mask: CornerMaskNode,
    bosl2_rounding_edge_mask: RoundingEdgeMaskNode,
    bosl2_chamfer_edge_mask: ChamferEdgeMaskNode,
    bosl2_stroke: StrokeNode,
  },
  paletteItems: ROUNDING_PALETTE,
  codegenHandlers: roundingCodegen,
}

export const bosl2MechanicalPack: NodePackDefinition = {
  id: 'bosl2_mechanical',
  category: 'bosl2_mechanical',
  categoryLabel: 'BOSL2 Mechanical',
  categoryColor: 'bg-rose-600',
  categoryTextColor: 'text-white',
  nodeTypes: {
    bosl2_spur_gear: SpurGearNode,
    bosl2_rack: RackNode,
    bosl2_bevel_gear: BevelGearNode,
    bosl2_worm: WormNode,
    bosl2_worm_gear: WormGearNode,
    bosl2_threaded_rod: ThreadedRodNode,
    bosl2_threaded_nut: ThreadedNutNode,
    bosl2_screw: ScrewNode,
    bosl2_screw_hole: ScrewHoleNode,
    bosl2_nut: NutNode,
    bosl2_dovetail: DovetailNode,
    bosl2_snap_pin: SnapPinNode,
    bosl2_knuckle_hinge: KnuckleHingeNode,
    bosl2_bottle_neck: BottleNeckNode,
    bosl2_bottle_cap: BottleCapNode,
  },
  paletteItems: MECHANICAL_PALETTE,
  codegenHandlers: mechanicalCodegen,
}

export const bosl2AttachmentsPack: NodePackDefinition = {
  id: 'bosl2_attachments',
  category: 'bosl2_attachments',
  categoryLabel: 'BOSL2 Attachments',
  categoryColor: 'bg-sky-600',
  categoryTextColor: 'text-white',
  nodeTypes: {
    bosl2_diff: DiffNode,
    bosl2_intersect: IntersectNode,
    bosl2_position: PositionNode,
    bosl2_attach: AttachNode,
    bosl2_tag: TagNode,
    bosl2_recolor: RecolorNode,
    bosl2_half_of: HalfOfNode,
    bosl2_partition: PartitionNode,
  },
  paletteItems: ATTACHMENTS_PALETTE,
  codegenHandlers: attachmentsCodegen,
}
