import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionVectorInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { RotateData } from '@/types/nodes'

export function RotateNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as RotateData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="transform" label="rotate" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }, { id: 'in-1', label: 'x' }, { id: 'in-2', label: 'y' }, { id: 'in-3', label: 'z' }]}>
      <ExpressionVectorInput label="deg" value={[d.x, d.y, d.z]} step={15}
        onChange={([x, y, z]) => update(id, { x, y, z })} />
    </BaseNode>
  )
}
