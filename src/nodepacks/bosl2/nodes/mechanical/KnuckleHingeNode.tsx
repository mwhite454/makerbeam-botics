import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2KnuckleHingeData } from '../../types/mechanical'

export function KnuckleHingeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2KnuckleHingeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_mechanical" label="knuckle_hinge" selected={selected}>
      <ExpressionInput label="length" value={d.length} step={1} onChange={(v) => update(id, { length: v })} />
      <ExpressionInput label="offset" value={d.offset} step={1} onChange={(v) => update(id, { offset: v })} />
      <ExpressionInput label="segs" value={d.segs} step={1} onChange={(v) => update(id, { segs: v })} />
    </BaseNode>
  )
}
