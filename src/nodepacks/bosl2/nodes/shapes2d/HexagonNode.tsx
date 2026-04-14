import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2HexagonData } from '../../types/shapes2d'

export function HexagonNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2HexagonData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes2d" label="hexagon" selected={selected}>
      <ExpressionInput label="r" value={d.r} step={1} onChange={(v) => update(id, { r: v })} />
      <ExpressionInput label="rounding" value={d.rounding} step={0.5} onChange={(v) => update(id, { rounding: v })} />
    </BaseNode>
  )
}
