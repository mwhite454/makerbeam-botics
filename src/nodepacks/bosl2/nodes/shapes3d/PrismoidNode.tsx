import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2PrismoidData } from '../../types/shapes3d'

export function PrismoidNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2PrismoidData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="prismoid" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'size1_x' },
        { id: 'in-1', label: 'size1_y' },
        { id: 'in-2', label: 'size2_x' },
        { id: 'in-3', label: 'size2_y' },
        { id: 'in-4', label: 'h' },
        { id: 'in-5', label: 'shift_x' },
        { id: 'in-6', label: 'shift_y' },
        { id: 'in-7', label: 'rounding' },
        { id: 'in-8', label: 'chamfer' },
      ]}
    >
      <ExpressionInput label="size1_x" value={d.size1_x} step={1} nodeId={id} handleId="in-0" onChange={(v) => update(id, { size1_x: v })} />
      <ExpressionInput label="size1_y" value={d.size1_y} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { size1_y: v })} />
      <ExpressionInput label="size2_x" value={d.size2_x} step={1} nodeId={id} handleId="in-2" onChange={(v) => update(id, { size2_x: v })} />
      <ExpressionInput label="size2_y" value={d.size2_y} step={1} nodeId={id} handleId="in-3" onChange={(v) => update(id, { size2_y: v })} />
      <ExpressionInput label="h" value={d.h} step={1} nodeId={id} handleId="in-4" onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="shift_x" value={d.shift_x} step={1} nodeId={id} handleId="in-5" onChange={(v) => update(id, { shift_x: v })} />
      <ExpressionInput label="shift_y" value={d.shift_y} step={1} nodeId={id} handleId="in-6" onChange={(v) => update(id, { shift_y: v })} />
      <ExpressionInput label="rounding" value={d.rounding} step={0.5} nodeId={id} handleId="in-7" onChange={(v) => update(id, { rounding: v })} />
      <ExpressionInput label="chamfer" value={d.chamfer} step={0.5} nodeId={id} handleId="in-8" onChange={(v) => update(id, { chamfer: v })} />
    </BaseNode>
  )
}
