import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2CornerMaskData } from '../../types/rounding'

export function CornerMaskNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2CornerMaskData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_rounding" label="corner_mask" selected={selected}>
      <TextInput label="corners" value={d.corners} onChange={(v) => update(id, { corners: v })} />
      <TextInput label="except" value={d.except} onChange={(v) => update(id, { except: v })} />
    </BaseNode>
  )
}
