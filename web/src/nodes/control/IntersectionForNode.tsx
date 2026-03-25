import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput, NumberInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { IntersectionForData } from '@/types/nodes'

export function IntersectionForNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as IntersectionForData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <BaseNode
      id={id}
      category="control"
      label="intersection_for"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'body' }]}
    >
      <TextInput label="variable" value={d.varName} onChange={(v) => update(id, { varName: v })} />
      <NumberInput label="start" value={d.start} step={1} onChange={(v) => update(id, { start: v })} />
      <NumberInput label="end" value={d.end} step={1} onChange={(v) => update(id, { end: v })} />
      <NumberInput label="step" value={d.step} step={1} onChange={(v) => update(id, { step: v })} />
    </BaseNode>
  )
}
