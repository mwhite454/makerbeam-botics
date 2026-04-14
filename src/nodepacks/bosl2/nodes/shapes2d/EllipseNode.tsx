import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2EllipseData } from '../../types/shapes2d'

export function EllipseNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2EllipseData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes2d" label="ellipse" selected={selected}>
      <ExpressionInput label="rx" value={d.rx} step={1} onChange={(v) => update(id, { rx: v })} />
      <ExpressionInput label="ry" value={d.ry} step={1} onChange={(v) => update(id, { ry: v })} />
    </BaseNode>
  )
}
