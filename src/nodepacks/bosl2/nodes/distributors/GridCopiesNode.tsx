import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, CheckboxInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2GridCopiesData } from '../../types/transforms'

export function GridCopiesNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2GridCopiesData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_distributors" label="grid_copies" selected={selected}>
      <ExpressionInput label="spacing_x" value={d.spacing_x} step={1} onChange={(v) => update(id, { spacing_x: v })} />
      <ExpressionInput label="spacing_y" value={d.spacing_y} step={1} onChange={(v) => update(id, { spacing_y: v })} />
      <ExpressionInput label="n_x" value={d.n_x} step={1} onChange={(v) => update(id, { n_x: v })} />
      <ExpressionInput label="n_y" value={d.n_y} step={1} onChange={(v) => update(id, { n_y: v })} />
      <CheckboxInput label="stagger" value={d.stagger} onChange={(v) => update(id, { stagger: v })} />
    </BaseNode>
  )
}
