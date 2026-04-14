import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, TextInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2Text3dData } from '../../types/shapes3d'

export function Text3dNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2Text3dData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="text3d" selected={selected}>
      <TextInput label="text" value={d.text} onChange={(v) => update(id, { text: v })} />
      <ExpressionInput label="h" value={d.h} step={0.5} onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="size" value={d.size} step={1} onChange={(v) => update(id, { size: v })} />
      <TextInput label="font" value={d.font} onChange={(v) => update(id, { font: v })} />
    </BaseNode>
  )
}
