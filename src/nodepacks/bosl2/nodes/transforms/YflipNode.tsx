import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2AxisFlipData } from '../../types/transforms'

export function YflipNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2AxisFlipData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_transforms" label="yflip" selected={selected}>
      <ExpressionInput label="offset" value={d.offset} step={1} onChange={(v) => update(id, { offset: v })} />
    </BaseNode>
  )
}
