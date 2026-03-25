import { type NodeProps } from '@xyflow/react'
import { BaseNode, VectorInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ScaleData } from '@/types/nodes'

export function ScaleNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ScaleData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="transform" label="scale" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }]}>
      <VectorInput label="xyz" value={[d.x, d.y, d.z]} step={0.1}
        onChange={([x, y, z]) => update(id, { x, y, z })} />
    </BaseNode>
  )
}
