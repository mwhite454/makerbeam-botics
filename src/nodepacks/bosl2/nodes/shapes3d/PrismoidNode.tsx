import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2PrismoidData } from '../../types/shapes3d'

export function PrismoidNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2PrismoidData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="prismoid" selected={selected}>
      <ExpressionInput label="size1_x" value={d.size1_x} step={1} onChange={(v) => update(id, { size1_x: v })} />
      <ExpressionInput label="size1_y" value={d.size1_y} step={1} onChange={(v) => update(id, { size1_y: v })} />
      <ExpressionInput label="size2_x" value={d.size2_x} step={1} onChange={(v) => update(id, { size2_x: v })} />
      <ExpressionInput label="size2_y" value={d.size2_y} step={1} onChange={(v) => update(id, { size2_y: v })} />
      <ExpressionInput label="h" value={d.h} step={1} onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="shift_x" value={d.shift_x} step={1} onChange={(v) => update(id, { shift_x: v })} />
      <ExpressionInput label="shift_y" value={d.shift_y} step={1} onChange={(v) => update(id, { shift_y: v })} />
      <ExpressionInput label="rounding" value={d.rounding} step={0.5} onChange={(v) => update(id, { rounding: v })} />
      <ExpressionInput label="chamfer" value={d.chamfer} step={0.5} onChange={(v) => update(id, { chamfer: v })} />
    </BaseNode>
  )
}
