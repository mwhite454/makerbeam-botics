import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionVectorInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { TranslateData } from '@/types/nodes'

export function TranslateNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as TranslateData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="transform" label="translate" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }]}>
      <ExpressionVectorInput label="xyz" value={[d.x, d.y, d.z]} step={1}
        onChange={([x, y, z]) => update(id, { x, y, z })} />
    </BaseNode>
  )
}
