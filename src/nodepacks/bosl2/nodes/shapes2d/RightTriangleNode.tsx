import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2RightTriangleData } from '../../types/shapes2d'

export function RightTriangleNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RightTriangleData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes2d" label="right_triangle" selected={selected}>
      <ExpressionInput label="x" value={d.x} step={1} onChange={(v) => update(id, { x: v })} />
      <ExpressionInput label="y" value={d.y} step={1} onChange={(v) => update(id, { y: v })} />
    </BaseNode>
  )
}
