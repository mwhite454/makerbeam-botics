import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, CheckboxInput, SelectInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2SpheroidData } from '../../types/shapes3d'

const STYLE_OPTIONS = ['aligned', 'stagger', 'octa', 'icosa']

export function SpheroidNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2SpheroidData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="spheroid" selected={selected}>
      <ExpressionInput label="r" value={d.r} step={1} onChange={(v) => update(id, { r: v })} />
      <SelectInput label="style" value={d.style} options={STYLE_OPTIONS} onChange={(v) => update(id, { style: v })} />
      <CheckboxInput label="circum" value={d.circum} onChange={(v) => update(id, { circum: v })} />
    </BaseNode>
  )
}
