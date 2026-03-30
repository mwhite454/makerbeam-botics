import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput, ExpressionInput, SelectInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { TextData } from '@/types/nodes'

export function ScadTextNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as TextData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode
      id={id}
      category="primitive2d"
      label="text"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'size' }]}
    >
      <TextInput label="text"   value={d.text} onChange={(v) => update(id, { text: v })} />
      <ExpressionInput label="size" value={d.size} step={0.5} onChange={(v) => update(id, { size: v })} />
      <TextInput label="font"   value={d.font} onChange={(v) => update(id, { font: v })} />
      <SelectInput label="halign" value={d.halign} options={['left','center','right']} onChange={(v) => update(id, { halign: v })} />
      <SelectInput label="valign" value={d.valign} options={['baseline','top','center','bottom']} onChange={(v) => update(id, { valign: v })} />
    </BaseNode>
  )
}
