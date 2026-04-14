import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2DiffData } from '../../types/attachments'

export function DiffNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2DiffData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_attachments" label="diff" selected={selected}>
      <TextInput label="remove" value={d.remove} onChange={(v) => update(id, { remove: v })} />
      <TextInput label="keep" value={d.keep} onChange={(v) => update(id, { keep: v })} />
    </BaseNode>
  )
}
