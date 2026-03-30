import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, ExpressionInput } from '../SketchBaseNode'
import type { SketchOffsetData } from '@/types/sketchNodes'
import { useEditorStore } from '@/store/editorStore'

export function SketchOffsetNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchOffsetData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_modifier"
      label="offset"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'shape' }, { id: 'in-1', label: 'dist' }]}
    >
      <ExpressionInput label="distance" value={d.distance} step={0.5} nodeId={id} handleId="in-1" onChange={(v) => update(id, { distance: v })} />
    </SketchBaseNode>
  )
}
