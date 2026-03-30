import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionVectorInput, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ResizeData } from '@/types/nodes'

export function ResizeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ResizeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="transform" label="resize" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }, { id: 'in-1', label: 'x' }, { id: 'in-2', label: 'y' }, { id: 'in-3', label: 'z' }, { id: 'in-4', label: 'auto' }]}> 
      <ExpressionVectorInput label="new size" value={[d.x, d.y, d.z]} step={1}
        onChange={([x, y, z]) => update(id, { x, y, z })} />
      <CheckboxInput label="auto" value={d.auto} onChange={(v) => update(id, { auto: v })} />
    </BaseNode>
  )
}
