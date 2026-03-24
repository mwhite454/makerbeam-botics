import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { PolyhedronData } from '@/types/nodes'

export function PolyhedronNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as PolyhedronData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="primitive3d" label="polyhedron" selected={selected}>
      <TextInput label="points" value={d.points} onChange={(v) => update(id, { points: v })} />
      <TextInput label="faces"  value={d.faces}  onChange={(v) => update(id, { faces: v })} />
    </BaseNode>
  )
}
