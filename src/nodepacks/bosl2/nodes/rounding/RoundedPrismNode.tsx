import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2RoundedPrismData } from '../../types/rounding'

export function RoundedPrismNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RoundedPrismData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_rounding" label="rounded_prism" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'child' },
        { id: 'in-1', label: 'height' },
        { id: 'in-2', label: 'joint_top' },
        { id: 'in-3', label: 'joint_bot' },
        { id: 'in-4', label: 'joint_sides' },
      ]}
    >
      <ExpressionInput label="height" value={d.height} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { height: v })} />
      <ExpressionInput label="joint_top" value={d.joint_top} step={0.5} nodeId={id} handleId="in-2" onChange={(v) => update(id, { joint_top: v })} />
      <ExpressionInput label="joint_bot" value={d.joint_bot} step={0.5} nodeId={id} handleId="in-3" onChange={(v) => update(id, { joint_bot: v })} />
      <ExpressionInput label="joint_sides" value={d.joint_sides} step={0.5} nodeId={id} handleId="in-4" onChange={(v) => update(id, { joint_sides: v })} />
    </BaseNode>
  )
}
