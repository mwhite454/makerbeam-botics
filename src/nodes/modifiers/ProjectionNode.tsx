import { type NodeProps } from '@xyflow/react'
import { BaseNode, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ProjectionData } from '@/types/nodes'

export function ProjectionNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ProjectionData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="modifier" label="projection" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }, { id: 'in-1', label: 'cut' }]}> 
      <CheckboxInput label="cut" value={d.cut} onChange={(v) => update(id, { cut: v })} />
    </BaseNode>
  )
}
