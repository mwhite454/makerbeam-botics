import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { PolygonData } from '@/types/nodes'

export function PolygonNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as PolygonData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="primitive2d" label="polygon" selected={selected}>
      <TextInput label="points" value={d.points} onChange={(v) => update(id, { points: v })} />
    </BaseNode>
  )
}
