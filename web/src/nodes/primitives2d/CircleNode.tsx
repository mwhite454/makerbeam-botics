import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { CircleData } from '@/types/nodes'

export function CircleNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as CircleData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode
      id={id}
      category="primitive2d"
      label="circle"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'r' }, { id: 'in-1', label: '$fn' }]}
    >
      <ExpressionInput label="radius" value={d.r} step={0.5} onChange={(v) => update(id, { r: v })} />
      <ExpressionInput label="$fn" value={d.fn} step={1} onChange={(v) => update(id, { fn: v })} />
    </BaseNode>
  )
}
