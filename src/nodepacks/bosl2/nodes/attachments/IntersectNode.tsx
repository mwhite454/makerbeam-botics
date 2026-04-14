import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2IntersectData } from '../../types/attachments'

export function IntersectNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2IntersectData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_attachments" label="intersect" selected={selected}>
      <TextInput label="intersect" value={d.intersect} onChange={(v) => update(id, { intersect: v })} />
      <TextInput label="keep" value={d.keep} onChange={(v) => update(id, { keep: v })} />
    </BaseNode>
  )
}
