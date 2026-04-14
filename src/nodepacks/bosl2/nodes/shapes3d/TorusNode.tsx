import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2TorusData } from '../../types/shapes3d'

export function TorusNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2TorusData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="torus" selected={selected}>
      <ExpressionInput label="r_maj" value={d.r_maj} step={1} onChange={(v) => update(id, { r_maj: v })} />
      <ExpressionInput label="r_min" value={d.r_min} step={0.5} onChange={(v) => update(id, { r_min: v })} />
    </BaseNode>
  )
}
