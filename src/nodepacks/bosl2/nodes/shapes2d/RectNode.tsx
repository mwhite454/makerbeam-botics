import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2RectData } from '../../types/shapes2d'

export function RectNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RectData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes2d" label="rect" selected={selected}>
      <ExpressionInput label="x" value={d.x} step={1} onChange={(v) => update(id, { x: v })} />
      <ExpressionInput label="y" value={d.y} step={1} onChange={(v) => update(id, { y: v })} />
      <ExpressionInput label="rounding" value={d.rounding} step={0.5} onChange={(v) => update(id, { rounding: v })} />
      <ExpressionInput label="chamfer" value={d.chamfer} step={0.5} onChange={(v) => update(id, { chamfer: v })} />
    </BaseNode>
  )
}
