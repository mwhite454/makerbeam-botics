import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2SnapPinData } from '../../types/mechanical'

export function SnapPinNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2SnapPinData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_mechanical" label="snap_pin" selected={selected}>
      <ExpressionInput label="r" value={d.r} step={0.5} onChange={(v) => update(id, { r: v })} />
      <ExpressionInput label="l" value={d.l} step={1} onChange={(v) => update(id, { l: v })} />
      <ExpressionInput label="nub_depth" value={d.nub_depth} step={0.1} onChange={(v) => update(id, { nub_depth: v })} />
    </BaseNode>
  )
}
