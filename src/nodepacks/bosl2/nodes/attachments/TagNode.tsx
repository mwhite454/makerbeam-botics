import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2TagData } from '../../types/attachments'

export function TagNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2TagData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_attachments" label="tag" selected={selected}>
      <TextInput label="tag" value={d.tag} onChange={(v) => update(id, { tag: v })} />
    </BaseNode>
  )
}
