import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2OctahedronData } from '../../types/shapes3d'

export function OctahedronNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2OctahedronData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="octahedron" selected={selected}>
      <ExpressionInput label="size" value={d.size} step={1} onChange={(v) => update(id, { size: v })} />
    </BaseNode>
  )
}
