import { type NodeProps } from '@xyflow/react'
import { BaseNode, VectorInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { MirrorData } from '@/types/nodes'

export function MirrorNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as MirrorData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="transform" label="mirror" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }]}>
      <VectorInput label="normal" value={[d.x, d.y, d.z]} step={1}
        onChange={([x, y, z]) => update(id, { x, y, z })} />
    </BaseNode>
  )
}
