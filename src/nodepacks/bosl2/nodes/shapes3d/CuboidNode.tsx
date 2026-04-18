import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2CuboidData } from '../../types/shapes3d'

export function CuboidNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2CuboidData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="cuboid" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'x' },
        { id: 'in-1', label: 'y' },
        { id: 'in-2', label: 'z' },
        { id: 'in-3', label: 'rounding' },
        { id: 'in-4', label: 'chamfer' },
      ]}
    >
      <ExpressionInput label="x" value={d.x} step={1} nodeId={id} handleId="in-0" onChange={(v) => update(id, { x: v })} />
      <ExpressionInput label="y" value={d.y} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { y: v })} />
      <ExpressionInput label="z" value={d.z} step={1} nodeId={id} handleId="in-2" onChange={(v) => update(id, { z: v })} />
      <ExpressionInput label="rounding" value={d.rounding} step={0.5} nodeId={id} handleId="in-3" onChange={(v) => update(id, { rounding: v })} />
      <ExpressionInput label="chamfer" value={d.chamfer} step={0.5} nodeId={id} handleId="in-4" onChange={(v) => update(id, { chamfer: v })} />
    </BaseNode>
  )
}
