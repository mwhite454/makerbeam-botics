import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2WedgeData } from '../../types/shapes3d'

export function WedgeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2WedgeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="wedge" selected={selected}>
      <ExpressionInput label="x" value={d.x} step={1} onChange={(v) => update(id, { x: v })} />
      <ExpressionInput label="y" value={d.y} step={1} onChange={(v) => update(id, { y: v })} />
      <ExpressionInput label="z" value={d.z} step={1} onChange={(v) => update(id, { z: v })} />
    </BaseNode>
  )
}
