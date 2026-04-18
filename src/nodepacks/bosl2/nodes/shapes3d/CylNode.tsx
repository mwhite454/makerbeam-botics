import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, CheckboxInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2CylData } from '../../types/shapes3d'

export function CylNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2CylData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="cyl" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'h' },
        { id: 'in-1', label: 'r' },
        { id: 'in-2', label: 'r1' },
        { id: 'in-3', label: 'r2' },
        { id: 'in-4', label: 'chamfer' },
        { id: 'in-5', label: 'rounding' },
        { id: 'in-6', label: '$fn' },
      ]}
    >
      <ExpressionInput label="h" value={d.h} step={1} nodeId={id} handleId="in-0" onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="r" value={d.r} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { r: v })} />
      <ExpressionInput label="r1" value={d.r1} step={1} nodeId={id} handleId="in-2" onChange={(v) => update(id, { r1: v })} />
      <ExpressionInput label="r2" value={d.r2} step={1} nodeId={id} handleId="in-3" onChange={(v) => update(id, { r2: v })} />
      <ExpressionInput label="chamfer" value={d.chamfer} step={0.5} nodeId={id} handleId="in-4" onChange={(v) => update(id, { chamfer: v })} />
      <ExpressionInput label="rounding" value={d.rounding} step={0.5} nodeId={id} handleId="in-5" onChange={(v) => update(id, { rounding: v })} />
      <CheckboxInput label="circum" value={d.circum} onChange={(v) => update(id, { circum: v })} />
      <ExpressionInput label="$fn" value={d.fn} step={1} nodeId={id} handleId="in-6" onChange={(v) => update(id, { fn: v })} />
    </BaseNode>
  )
}
