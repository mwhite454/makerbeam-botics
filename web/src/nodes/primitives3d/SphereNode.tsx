import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { SphereData } from '@/types/nodes'

export function SphereNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SphereData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode
      id={id}
      category="primitive3d"
      label="sphere"
      selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'r' },
        { id: 'in-1', label: '$fn' },
      ]}
    >
      <ExpressionInput label="radius" value={d.r}  min={0.01} step={0.5} nodeId={id} handleId="in-0" onChange={(v) => update(id, { r: v })} />
      <ExpressionInput label="$fn"   value={d.fn} min={3}    step={1}   nodeId={id} handleId="in-1" onChange={(v) => update(id, { fn: v })} />
    </BaseNode>
  )
}
