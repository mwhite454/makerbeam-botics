import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, TextInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2AttachData } from '../../types/attachments'

export function AttachNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2AttachData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_attachments" label="attach" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'geom' },
        { id: 'in-1', label: 'overlap' },
      ]}
    >
      <TextInput label="parent" value={d.parent} onChange={(v) => update(id, { parent: v })} />
      <TextInput label="child" value={d.child} onChange={(v) => update(id, { child: v })} />
      <ExpressionInput label="overlap" value={d.overlap} step={0.5} nodeId={id} handleId="in-1" onChange={(v) => update(id, { overlap: v })} />
    </BaseNode>
  )
}
