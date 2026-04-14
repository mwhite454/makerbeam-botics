import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, TextInput, SelectInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2NutData } from '../../types/mechanical'

export function NutNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2NutData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_mechanical" label="nut" selected={selected}>
      <TextInput label="spec" value={d.spec} onChange={(v) => update(id, { spec: v })} />
      <SelectInput label="shape" value={d.shape} options={["hex", "square"]} onChange={(v) => update(id, { shape: v })} />
      <ExpressionInput label="thickness" value={d.thickness} step={0.1} onChange={(v) => update(id, { thickness: v })} />
    </BaseNode>
  )
}
