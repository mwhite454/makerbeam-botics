import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, CheckboxInput, SelectInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2StrokeData } from '../../types/rounding'

export function StrokeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2StrokeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_rounding" label="stroke" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'width' },
      ]}
    >
      <ExpressionInput label="width" value={d.width} step={0.5} nodeId={id} handleId="in-0" onChange={(v) => update(id, { width: v })} />
      <CheckboxInput label="closed" value={d.closed} onChange={(v) => update(id, { closed: v })} />
      <SelectInput label="endcaps" value={d.endcaps} options={["butt", "round", "square", "line", "tail"]} onChange={(v) => update(id, { endcaps: v })} />
    </BaseNode>
  )
}
