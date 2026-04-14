import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2RingData } from '../../types/shapes2d'

export function RingNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RingData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes2d" label="ring" selected={selected}>
      <ExpressionInput label="n" value={d.n} step={1} onChange={(v) => update(id, { n: v })} />
      <ExpressionInput label="r1" value={d.r1} step={1} onChange={(v) => update(id, { r1: v })} />
      <ExpressionInput label="r2" value={d.r2} step={1} onChange={(v) => update(id, { r2: v })} />
    </BaseNode>
  )
}
