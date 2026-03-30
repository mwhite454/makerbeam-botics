import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'
import type { LoopVarData } from '@/types/nodes'

export function LoopVarNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as LoopVarData
  return (
    <BaseNode id={id} category="control" label="loop var" selected={selected} hasOutput={true}>
      <div className="px-1 py-0.5">
        <span className="text-[10px] text-gray-400">variable: </span>
        <span className="text-[10px] text-amber-300 font-mono">{d.varName || 'i'}</span>
      </div>
    </BaseNode>
  )
}
