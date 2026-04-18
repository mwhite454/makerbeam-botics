import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, CheckboxInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2LinearSweepData } from '../../types/rounding'

export function LinearSweepNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2LinearSweepData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_rounding" label="linear_sweep" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'child' },
        { id: 'in-1', label: 'height' },
        { id: 'in-2', label: 'twist' },
        { id: 'in-3', label: 'scale' },
        { id: 'in-4', label: 'slices' },
      ]}
    >
      <ExpressionInput label="height" value={d.height} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { height: v })} />
      <ExpressionInput label="twist" value={d.twist} step={1} nodeId={id} handleId="in-2" onChange={(v) => update(id, { twist: v })} />
      <ExpressionInput label="scale" value={d.scale} step={0.1} nodeId={id} handleId="in-3" onChange={(v) => update(id, { scale: v })} />
      <ExpressionInput label="slices" value={d.slices} step={1} nodeId={id} handleId="in-4" onChange={(v) => update(id, { slices: v })} />
      <CheckboxInput label="center" value={d.center} onChange={(v) => update(id, { center: v })} />
    </BaseNode>
  )
}
