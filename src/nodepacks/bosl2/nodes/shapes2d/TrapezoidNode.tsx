import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2TrapezoidData } from '../../types/shapes2d'

export function TrapezoidNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2TrapezoidData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes2d" label="trapezoid" selected={selected}>
      <ExpressionInput label="h" value={d.h} step={1} onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="w1" value={d.w1} step={1} onChange={(v) => update(id, { w1: v })} />
      <ExpressionInput label="w2" value={d.w2} step={1} onChange={(v) => update(id, { w2: v })} />
      <ExpressionInput label="rounding" value={d.rounding} step={0.5} onChange={(v) => update(id, { rounding: v })} />
    </BaseNode>
  )
}
