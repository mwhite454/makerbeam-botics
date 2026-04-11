import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, ExpressionInput, CheckboxInput } from '../SketchBaseNode'
import type { SketchRectangleData } from '@/types/sketchNodes'
import { useEditorStore } from '@/store/editorStore'

export function SketchRectangleNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchRectangleData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_primitive"
      label="rectangle"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'w' }, { id: 'in-1', label: 'h' }, { id: 'in-2', label: 'r' }]}
    >
      <ExpressionInput label="width" value={d.width} step={1} min={0} nodeId={id} handleId="in-0" onChange={(v) => update(id, { width: v })} />
      <ExpressionInput label="height" value={d.height} step={1} min={0} nodeId={id} handleId="in-1" onChange={(v) => update(id, { height: v })} />
      <ExpressionInput label="radius" value={d.cornerRadius} step={0.5} min={0} nodeId={id} handleId="in-2" onChange={(v) => update(id, { cornerRadius: v })} />
      <CheckboxInput label="center" value={d.center} onChange={(v) => update(id, { center: v })} />
    </SketchBaseNode>
  )
}
