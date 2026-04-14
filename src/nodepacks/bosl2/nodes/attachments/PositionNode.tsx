import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2PositionData } from '../../types/attachments'

export function PositionNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2PositionData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_attachments" label="position" selected={selected}>
      <TextInput label="at" value={d.at} onChange={(v) => update(id, { at: v })} />
    </BaseNode>
  )
}
