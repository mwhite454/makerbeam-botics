import { type NodeProps } from '@xyflow/react'
import { BooleanNodeBase } from '../booleans/BooleanNode'

export function HullNode(props: NodeProps) {
  return <BooleanNodeBase {...props} opLabel="hull" category="modifier" />
}

export function MinkowskiNode(props: NodeProps) {
  return <BooleanNodeBase {...props} opLabel="minkowski" category="modifier" />
}
