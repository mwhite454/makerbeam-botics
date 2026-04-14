import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2SquircleData } from '../../types/shapes2d'

export function SquircleNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2SquircleData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes2d" label="squircle" selected={selected}>
      <ExpressionInput label="x" value={d.x} step={1} onChange={(v) => update(id, { x: v })} />
      <ExpressionInput label="y" value={d.y} step={1} onChange={(v) => update(id, { y: v })} />
      <ExpressionInput label="squareness" value={d.squareness} step={0.1} onChange={(v) => update(id, { squareness: v })} />
    </BaseNode>
  )
}
