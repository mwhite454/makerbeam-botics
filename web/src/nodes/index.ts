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

import { MakerBeamNode }    from './makerbeam/MakerBeamNode'

export const nodeTypes: NodeTypes = {
  sphere:           SphereNode,
  cube:             CubeNode,
  cylinder:         CylinderNode,
  polyhedron:       PolyhedronNode,

  circle:           CircleNode,
  square:           SquareNode,
  polygon:          PolygonNode,
  scadtext:         ScadTextNode,

  translate:        TranslateNode,
  rotate:           RotateNode,
  scale:            ScaleNode,
  mirror:           MirrorNode,
  resize:           ResizeNode,
  multmatrix:       MultmatrixNode,
  offset:           OffsetNode,

  union:            UnionNode,
  difference:       DifferenceNode,
  intersection:     IntersectionNode,

  linear_extrude:   LinearExtrudeNode,
  rotate_extrude:   RotateExtrudeNode,

  hull:             HullNode,
  minkowski:        MinkowskiNode,
  color:            ColorNode,
  projection:       ProjectionNode,

  makerbeam:        MakerBeamNode,
}
