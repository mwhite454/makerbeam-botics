import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2SpurGearData } from '../../types/mechanical'

export function SpurGearNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2SpurGearData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_mechanical" label="spur_gear" selected={selected}>
      <ExpressionInput label="mod" value={d.mod} step={0.5} onChange={(v) => update(id, { mod: v })} />
      <ExpressionInput label="teeth" value={d.teeth} step={1} onChange={(v) => update(id, { teeth: v })} />
      <ExpressionInput label="thickness" value={d.thickness} step={1} onChange={(v) => update(id, { thickness: v })} />
      <ExpressionInput label="pressure_angle" value={d.pressure_angle} step={1} onChange={(v) => update(id, { pressure_angle: v })} />
      <ExpressionInput label="helical" value={d.helical} step={1} onChange={(v) => update(id, { helical: v })} />
      <ExpressionInput label="shaft_diam" value={d.shaft_diam} step={1} onChange={(v) => update(id, { shaft_diam: v })} />
    </BaseNode>
  )
}
