import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2DirectionData } from '../../types/transforms'

export function DownNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2DirectionData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_transforms" label="down" selected={selected}>
      <ExpressionInput label="d" value={d.d} step={1} onChange={(v) => update(id, { d: v })} />
    </BaseNode>
  )
}
