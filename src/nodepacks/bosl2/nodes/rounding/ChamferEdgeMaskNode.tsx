import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2ChamferEdgeMaskData } from '../../types/rounding'

export function ChamferEdgeMaskNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2ChamferEdgeMaskData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_rounding" label="chamfer_edge_mask" selected={selected}>
      <ExpressionInput label="h" value={d.h} step={1} onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="chamfer" value={d.chamfer} step={0.5} onChange={(v) => update(id, { chamfer: v })} />
    </BaseNode>
  )
}
