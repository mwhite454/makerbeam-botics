import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode } from '../SketchBaseNode'
import type { SketchBooleanData } from '@/types/sketchNodes'

function SketchBooleanNodeBase({ id, data, selected, label }: NodeProps & { label: string }) {
  const _d = data as unknown as SketchBooleanData

  return (
    <SketchBaseNode
      id={id}
      category="sketch_boolean"
      label={label}
      selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'A' },
        { id: 'in-1', label: 'B' },
      ]}
    >
      <div className="text-[10px] text-gray-500 italic">Connect shapes A and B</div>
    </SketchBaseNode>
  )
}

export function SketchUnionNode(props: NodeProps) {
  return <SketchBooleanNodeBase {...props} label="union" />
}

export function SketchDifferenceNode(props: NodeProps) {
  return <SketchBooleanNodeBase {...props} label="difference" />
}

export function SketchIntersectNode(props: NodeProps) {
  return <SketchBooleanNodeBase {...props} label="intersect" />
}
