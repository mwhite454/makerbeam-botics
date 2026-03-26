import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2CuboidData } from '@/types/nodes'

export function Bosl2CuboidNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2CuboidData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2" label="cuboid" selected={selected}>
      <NumberInput label="x" value={d.x} onChange={(v) => update(id, { x: v })} />
      <NumberInput label="y" value={d.y} onChange={(v) => update(id, { y: v })} />
      <NumberInput label="z" value={d.z} onChange={(v) => update(id, { z: v })} />
      <NumberInput label="rounding" value={d.rounding} min={0} onChange={(v) => update(id, { rounding: v })} />
      <NumberInput label="chamfer"  value={d.chamfer}  min={0} onChange={(v) => update(id, { chamfer: v })} />
    </BaseNode>
  )
}
