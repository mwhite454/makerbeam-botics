import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, TextInput, CheckboxInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2PathCopiesData } from '../../types/transforms'

export function PathCopiesNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2PathCopiesData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_distributors" label="path_copies" selected={selected}>
      <TextInput label="path" value={d.path} onChange={(v) => update(id, { path: v })} />
      <ExpressionInput label="n" value={d.n} step={1} onChange={(v) => update(id, { n: v })} />
      <CheckboxInput label="closed" value={d.closed} onChange={(v) => update(id, { closed: v })} />
    </BaseNode>
  )
}
