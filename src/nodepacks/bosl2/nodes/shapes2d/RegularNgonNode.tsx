import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2RegularNgonData } from '../../types/shapes2d'

export function RegularNgonNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RegularNgonData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes2d" label="regular_ngon" selected={selected}>
      <ExpressionInput label="n" value={d.n} step={1} onChange={(v) => update(id, { n: v })} />
      <ExpressionInput label="r" value={d.r} step={1} onChange={(v) => update(id, { r: v })} />
    </BaseNode>
  )
}
