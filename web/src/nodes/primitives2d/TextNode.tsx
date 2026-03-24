import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput, NumberInput, SelectInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { TextData } from '@/types/nodes'

export function ScadTextNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as TextData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="primitive2d" label="text" selected={selected}>
      <TextInput label="text"   value={d.text} onChange={(v) => update(id, { text: v })} />
      <NumberInput label="size" value={d.size} min={0.1} step={0.5} onChange={(v) => update(id, { size: v })} />
      <TextInput label="font"   value={d.font} onChange={(v) => update(id, { font: v })} />
      <SelectInput label="halign" value={d.halign} options={['left','center','right']} onChange={(v) => update(id, { halign: v })} />
      <SelectInput label="valign" value={d.valign} options={['baseline','top','center','bottom']} onChange={(v) => update(id, { valign: v })} />
    </BaseNode>
  )
}
