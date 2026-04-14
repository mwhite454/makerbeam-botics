import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2Teardrop2dData } from '../../types/shapes2d'

export function Teardrop2dNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2Teardrop2dData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes2d" label="teardrop2d" selected={selected}>
      <ExpressionInput label="r" value={d.r} step={1} onChange={(v) => update(id, { r: v })} />
      <ExpressionInput label="ang" value={d.ang} step={1} onChange={(v) => update(id, { ang: v })} />
    </BaseNode>
  )
}
