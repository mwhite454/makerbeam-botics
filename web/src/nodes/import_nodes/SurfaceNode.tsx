import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { SurfaceData } from '@/types/nodes'

export function SurfaceNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SurfaceData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="import" label="surface" selected={selected}>
      <TextInput label="filename" value={d.filename} onChange={(v) => update(id, { filename: v })} />
      <CheckboxInput label="center" value={d.center} onChange={(v) => update(id, { center: v })} />
    </BaseNode>
  )
}
