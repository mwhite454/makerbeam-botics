import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ImportSTLData } from '@/types/nodes'

export function ImportSTLNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ImportSTLData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="import" label="import" selected={selected}>
      <TextInput label="filename" value={d.filename} onChange={(v) => update(id, { filename: v })} />
      <div className="text-[9px] text-gray-500 mt-1">STL, DXF, SVG, AMF, 3MF</div>
    </BaseNode>
  )
}
