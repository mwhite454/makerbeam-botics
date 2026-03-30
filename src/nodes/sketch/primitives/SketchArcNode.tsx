import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, ExpressionInput } from '../SketchBaseNode'
import type { SketchArcData } from '@/types/sketchNodes'
import { useEditorStore } from '@/store/editorStore'

export function SketchArcNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchArcData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_primitive"
      label="arc"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'r' }, { id: 'in-1', label: 'start' }, { id: 'in-2', label: 'end' }]}
    >
      <ExpressionInput label="radius" value={d.radius} step={1} min={0} nodeId={id} handleId="in-0" onChange={(v) => update(id, { radius: v })} />
      <ExpressionInput label="start°" value={d.startAngle} step={5} nodeId={id} handleId="in-1" onChange={(v) => update(id, { startAngle: v })} />
      <ExpressionInput label="end°" value={d.endAngle} step={5} nodeId={id} handleId="in-2" onChange={(v) => update(id, { endAngle: v })} />
    </SketchBaseNode>
  )
}
