import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2OnionData } from '../../types/shapes3d'

export function OnionNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2OnionData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="onion" selected={selected}>
      <ExpressionInput label="r" value={d.r} step={1} onChange={(v) => update(id, { r: v })} />
      <ExpressionInput label="ang" value={d.ang} step={5} onChange={(v) => update(id, { ang: v })} />
      <ExpressionInput label="cap_h" value={d.cap_h} step={0.5} onChange={(v) => update(id, { cap_h: v })} />
    </BaseNode>
  )
}
