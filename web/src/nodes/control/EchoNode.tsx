import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { EchoData } from '@/types/nodes'

export function EchoNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as EchoData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="control" label="echo" selected={selected} hasOutput={false}>
      <TextInput label="message" value={d.message} onChange={(v) => update(id, { message: v })} />
    </BaseNode>
  )
}
