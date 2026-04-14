import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, SelectInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2SkinData } from '../../types/rounding'

export function SkinNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2SkinData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_rounding" label="skin" selected={selected}>
      <ExpressionInput label="slices" value={d.slices} step={1} onChange={(v) => update(id, { slices: v })} />
      <SelectInput label="method" value={d.method} options={["reindex", "distance", "fast_distance", "tangent"]} onChange={(v) => update(id, { method: v })} />
      <SelectInput label="style" value={d.style} options={["min_edge", "quincunx", "alt_tri", "tri"]} onChange={(v) => update(id, { style: v })} />
    </BaseNode>
  )
}
