import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { CylinderData } from '@/types/nodes'

export function CylinderNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as CylinderData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode
      id={id}
      category="primitive3d"
      label="cylinder"
      selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'h' },
        { id: 'in-1', label: 'r1' },
        { id: 'in-2', label: 'r2' },
        { id: 'in-3', label: 'center' },
        { id: 'in-4', label: '$fn' },
      ]}
    >
      <ExpressionInput label="height" value={d.h}  min={0.01} step={0.5} nodeId={id} handleId="in-0" onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="r1"    value={d.r1} min={0}    step={0.5} nodeId={id} handleId="in-1" onChange={(v) => update(id, { r1: v })} />
      <ExpressionInput label="r2"    value={d.r2} min={0}    step={0.5} nodeId={id} handleId="in-2" onChange={(v) => update(id, { r2: v })} />
      <ExpressionInput label="$fn"   value={d.fn} min={3}    step={1}   nodeId={id} handleId="in-4" onChange={(v) => update(id, { fn: v })} />
      <CheckboxInput label="center" value={d.center} onChange={(v) => update(id, { center: v })} />
    </BaseNode>
  )
}
