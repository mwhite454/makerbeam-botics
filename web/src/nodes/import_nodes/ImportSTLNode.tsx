import { type NodeProps } from '@xyflow/react'
import { BaseNode, FilePickerInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ImportSTLData } from '@/types/nodes'

export function ImportSTLNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ImportSTLData
  const update = useEditorStore((s) => s.updateNodeData)
  const addImportedFile = useEditorStore((s) => s.addImportedFile)
  return (
    <BaseNode id={id} category="import" label="import" selected={selected}>
      <FilePickerInput
        label="file"
        accept=".stl,.dxf,.svg,.amf,.3mf"
        filename={d.filename ?? ''}
        onFile={(name, buf) => {
          addImportedFile(name, buf)
          update(id, { filename: name })
        }}
      />
    </BaseNode>
  )
}
