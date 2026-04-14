import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2RoundingEdgeMaskData } from '../../types/rounding'

export function RoundingEdgeMaskNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RoundingEdgeMaskData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_rounding" label="rounding_edge_mask" selected={selected}>
      <ExpressionInput label="h" value={d.h} step={1} onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="r" value={d.r} step={0.5} onChange={(v) => update(id, { r: v })} />
    </BaseNode>
  )
}
