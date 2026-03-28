import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode } from '../SketchBaseNode'
import { FilePickerInput } from '../../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { SketchImportData } from '@/types/sketchNodes'

export function ImportSketchNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchImportData
  const update = useEditorStore((s) => s.updateNodeData)
  const addImportedFile = useEditorStore((s) => s.addImportedFile)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_import"
      label="import SVG"
      selected={selected}
      hasOutput={false}
    >
      <FilePickerInput
        label="SVG file"
        accept=".svg"
        filename={d.filename ?? ''}
        onFile={(name, buf) => {
          addImportedFile(name, buf)
          update(id, { filename: name })
        }}
      />
    </SketchBaseNode>
  )
}
