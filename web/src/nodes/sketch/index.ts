import type { NodeTypes } from '@xyflow/react'

import { SketchRectangleNode } from './primitives/SketchRectangleNode'
import { SketchCircleNode }    from './primitives/SketchCircleNode'
import { SketchNgonNode }      from './primitives/SketchNgonNode'
import { SketchLineNode }      from './primitives/SketchLineNode'
import { SketchArcNode }       from './primitives/SketchArcNode'
import { SketchEllipseNode }   from './primitives/SketchEllipseNode'

import { SketchUnionNode, SketchDifferenceNode, SketchIntersectNode } from './booleans/SketchBooleanNode'

import { SketchTranslateNode, SketchRotateNode, SketchScaleNode, SketchMirrorNode } from './transforms/SketchTransformNodes'

import { SketchOffsetNode } from './modifiers/SketchOffsetNode'
import { SketchExpressionNode } from './control/SketchExpressionNode'
import { GroupNode }         from '../GroupNode'

export const sketchNodeTypes: NodeTypes = {
  // Primitives
  sketch_rectangle: SketchRectangleNode,
  sketch_circle:    SketchCircleNode,
  sketch_ngon:      SketchNgonNode,
  sketch_line:      SketchLineNode,
  sketch_arc:       SketchArcNode,
  sketch_ellipse:   SketchEllipseNode,

  // Booleans
  sketch_union:      SketchUnionNode,
  sketch_difference: SketchDifferenceNode,
  sketch_intersect:  SketchIntersectNode,

  // Transforms
  sketch_translate: SketchTranslateNode,
  sketch_rotate:    SketchRotateNode,
  sketch_scale:     SketchScaleNode,
  sketch_mirror:    SketchMirrorNode,

  // Modifiers
  sketch_offset: SketchOffsetNode,

  // Control
  sketch_expression: SketchExpressionNode,

  // Visual groups (Node Wrangler)
  group_node: GroupNode,
}
