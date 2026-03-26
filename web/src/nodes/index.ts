import type { NodeTypes } from '@xyflow/react'

import { SphereNode }       from './primitives3d/SphereNode'
import { CubeNode }         from './primitives3d/CubeNode'
import { CylinderNode }     from './primitives3d/CylinderNode'
import { PolyhedronNode }   from './primitives3d/PolyhedronNode'

import { CircleNode }       from './primitives2d/CircleNode'
import { SquareNode }       from './primitives2d/SquareNode'
import { PolygonNode }      from './primitives2d/PolygonNode'
import { ScadTextNode }     from './primitives2d/TextNode'

import { TranslateNode }    from './transforms/TranslateNode'
import { RotateNode }       from './transforms/RotateNode'
import { ScaleNode }        from './transforms/ScaleNode'
import { MirrorNode }       from './transforms/MirrorNode'
import { ResizeNode }       from './transforms/ResizeNode'
import { MultmatrixNode }   from './transforms/MultmatrixNode'
import { OffsetNode }       from './transforms/OffsetNode'

import { UnionNode, DifferenceNode, IntersectionNode } from './booleans/BooleanNode'

import { LinearExtrudeNode } from './extrusions/LinearExtrudeNode'
import { RotateExtrudeNode } from './extrusions/RotateExtrudeNode'

import { HullNode, MinkowskiNode } from './modifiers/HullMinkowskiNode'
import { ColorNode }        from './modifiers/ColorNode'
import { ProjectionNode }   from './modifiers/ProjectionNode'
import { RenderNode }       from './modifiers/RenderNode'

import { ForLoopNode }      from './control/ForLoopNode'
import { IfCondNode }       from './control/IfCondNode'
import { VarNode }          from './control/VarNode'
import { EchoNode }         from './control/EchoNode'
import { IntersectionForNode } from './control/IntersectionForNode'
import { AssertNode }       from './control/AssertNode'
import { ParameterNode, ParameterListNode } from './control/ParameterNode'
import { ModuleCallNode }   from './control/ModuleCallNode'

import { ImportSTLNode }    from './import_nodes/ImportSTLNode'
import { SurfaceNode }      from './import_nodes/SurfaceNode'

import { MakerBeamNode }    from './makerbeam/MakerBeamNode'

import { Bosl2CuboidNode }      from './bosl2/Bosl2CuboidNode'
import { Bosl2CylNode }         from './bosl2/Bosl2CylNode'
import { Bosl2TubeNode }        from './bosl2/Bosl2TubeNode'
import { Bosl2XRotNode }        from './bosl2/Bosl2XRotNode'
import { Bosl2YRotNode }        from './bosl2/Bosl2YRotNode'
import { Bosl2ZRotNode }        from './bosl2/Bosl2ZRotNode'
import { Bosl2ThreadedRodNode } from './bosl2/Bosl2ThreadedRodNode'

export const nodeTypes: NodeTypes = {
  // 3D Primitives
  sphere:           SphereNode,
  cube:             CubeNode,
  cylinder:         CylinderNode,
  polyhedron:       PolyhedronNode,

  // 2D Primitives
  circle:           CircleNode,
  square:           SquareNode,
  polygon:          PolygonNode,
  scadtext:         ScadTextNode,

  // Transforms
  translate:        TranslateNode,
  rotate:           RotateNode,
  scale:            ScaleNode,
  mirror:           MirrorNode,
  resize:           ResizeNode,
  multmatrix:       MultmatrixNode,
  offset:           OffsetNode,

  // Booleans
  union:            UnionNode,
  difference:       DifferenceNode,
  intersection:     IntersectionNode,

  // Extrusions
  linear_extrude:   LinearExtrudeNode,
  rotate_extrude:   RotateExtrudeNode,

  // Modifiers
  hull:             HullNode,
  minkowski:        MinkowskiNode,
  color:            ColorNode,
  projection:       ProjectionNode,
  render_node:      RenderNode,

  // Control Flow
  for_loop:         ForLoopNode,
  if_cond:          IfCondNode,
  var_node:         VarNode,
  echo_node:        EchoNode,
  intersection_for: IntersectionForNode,
  assert_node:      AssertNode,
  parameter_node:   ParameterNode,
  parameter_list:   ParameterListNode,
  module_call:      ModuleCallNode,

  // Import
  import_stl:       ImportSTLNode,
  surface_node:     SurfaceNode,

  // MakerBeam
  makerbeam:        MakerBeamNode,

  // BOSL2
  bosl2_cuboid:       Bosl2CuboidNode,
  bosl2_cyl:          Bosl2CylNode,
  bosl2_tube:         Bosl2TubeNode,
  bosl2_xrot:         Bosl2XRotNode,
  bosl2_yrot:         Bosl2YRotNode,
  bosl2_zrot:         Bosl2ZRotNode,
  bosl2_threaded_rod: Bosl2ThreadedRodNode,
}
