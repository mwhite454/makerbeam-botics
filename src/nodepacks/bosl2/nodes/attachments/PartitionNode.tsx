import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, TextInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2PartitionData } from '../../types/attachments'

export function PartitionNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2PartitionData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_attachments" label="partition" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'child' },
        { id: 'in-1', label: 'x' },
        { id: 'in-2', label: 'y' },
        { id: 'in-3', label: 'z' },
        { id: 'in-4', label: 'spread' },
      ]}
    >
      <ExpressionInput label="x" value={d.x} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { x: v })} />
      <ExpressionInput label="y" value={d.y} step={1} nodeId={id} handleId="in-2" onChange={(v) => update(id, { y: v })} />
      <ExpressionInput label="z" value={d.z} step={1} nodeId={id} handleId="in-3" onChange={(v) => update(id, { z: v })} />
      <ExpressionInput label="spread" value={d.spread} step={1} nodeId={id} handleId="in-4" onChange={(v) => update(id, { spread: v })} />
      <TextInput label="cutpath" value={d.cutpath} onChange={(v) => update(id, { cutpath: v })} />
    </BaseNode>
  )
}
