import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2EdgeMaskData } from '../../types/rounding'

export function EdgeMaskNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2EdgeMaskData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_rounding" label="edge_mask" selected={selected}>
      <TextInput label="edges" value={d.edges} onChange={(v) => update(id, { edges: v })} />
      <TextInput label="except" value={d.except} onChange={(v) => update(id, { except: v })} />
    </BaseNode>
  )
}
