import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { AssertData } from '@/types/nodes'

export function AssertNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as AssertData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <BaseNode
      id={id}
      category="control"
      label="assert"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'body' }]}
    >
      <TextInput label="condition" value={d.condition} onChange={(v) => update(id, { condition: v })} />
      <TextInput label="message" value={d.message} onChange={(v) => update(id, { message: v })} />
    </BaseNode>
  )
}
