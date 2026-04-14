import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2RegularPrismData } from '../../types/shapes3d'

export function RegularPrismNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RegularPrismData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="regular_prism" selected={selected}>
      <ExpressionInput label="n" value={d.n} step={1} onChange={(v) => update(id, { n: v })} />
      <ExpressionInput label="h" value={d.h} step={1} onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="r" value={d.r} step={1} onChange={(v) => update(id, { r: v })} />
      <ExpressionInput label="rounding" value={d.rounding} step={0.5} onChange={(v) => update(id, { rounding: v })} />
      <ExpressionInput label="chamfer" value={d.chamfer} step={0.5} onChange={(v) => update(id, { chamfer: v })} />
    </BaseNode>
  )
}
