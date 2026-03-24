import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { VarData } from '@/types/nodes'

export function VarNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as VarData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="control" label="variable" selected={selected} hasOutput={false}>
      <TextInput label="name"  value={d.varName} onChange={(v) => update(id, { varName: v })} />
      <TextInput label="value" value={d.value}   onChange={(v) => update(id, { value: v })} />
    </BaseNode>
  )
}
