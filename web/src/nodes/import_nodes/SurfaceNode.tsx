import { type NodeProps } from '@xyflow/react'
import { BaseNode, FilePickerInput, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { SurfaceData } from '@/types/nodes'

export function SurfaceNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SurfaceData
  const update = useEditorStore((s) => s.updateNodeData)
  const addImportedFile = useEditorStore((s) => s.addImportedFile)
  return (
    <BaseNode id={id} category="import" label="surface" selected={selected}>
      <FilePickerInput
        label="heightmap"
        accept=".dat,.png"
        filename={d.filename ?? ''}
        onFile={(name, buf) => {
          addImportedFile(name, buf)
          update(id, { filename: name })
        }}
      />
      <CheckboxInput label="center" value={d.center} onChange={(v) => update(id, { center: v })} />
    </BaseNode>
  )
}
