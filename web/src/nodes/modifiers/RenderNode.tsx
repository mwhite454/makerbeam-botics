import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'

export function RenderNode({ id, selected }: NodeProps) {
  return (
    <BaseNode id={id} category="modifier" label="render" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }]}>
      <div className="text-[9px] text-gray-500">Forces full geometry evaluation</div>
    </BaseNode>
  )
}
