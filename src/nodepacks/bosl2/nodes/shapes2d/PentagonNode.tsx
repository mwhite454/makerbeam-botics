import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2PentagonData } from '../../types/shapes2d'

export function PentagonNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2PentagonData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes2d" label="pentagon" selected={selected}>
      <ExpressionInput label="r" value={d.r} step={1} onChange={(v) => update(id, { r: v })} />
    </BaseNode>
  )
}
