import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2FilletData } from '../../types/shapes3d'

export function FilletNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2FilletData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="fillet" selected={selected}>
      <ExpressionInput label="h" value={d.h} step={1} onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="r" value={d.r} step={0.5} onChange={(v) => update(id, { r: v })} />
      <ExpressionInput label="ang" value={d.ang} step={5} onChange={(v) => update(id, { ang: v })} />
    </BaseNode>
  )
}
