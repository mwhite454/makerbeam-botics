import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2RecolorData } from '../../types/attachments'

export function RecolorNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RecolorData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_attachments" label="recolor" selected={selected}>
      <TextInput label="c" value={d.c} onChange={(v) => update(id, { c: v })} />
    </BaseNode>
  )
}
