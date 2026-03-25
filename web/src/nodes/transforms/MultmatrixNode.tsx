import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { MultmatrixData } from '@/types/nodes'

export function MultmatrixNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as MultmatrixData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="transform" label="multmatrix" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }]}>
      <TextInput label="matrix (4x4 JSON)" value={d.matrix} onChange={(v) => update(id, { matrix: v })} />
    </BaseNode>
  )
}
