import { type NodeProps } from '@xyflow/react'
import { BaseNode, VectorInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { RotateData } from '@/types/nodes'

export function RotateNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as RotateData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="transform" label="rotate" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }]}>
      <VectorInput label="deg" value={[d.x, d.y, d.z]} step={15}
        onChange={([x, y, z]) => update(id, { x, y, z })} />
    </BaseNode>
  )
}
