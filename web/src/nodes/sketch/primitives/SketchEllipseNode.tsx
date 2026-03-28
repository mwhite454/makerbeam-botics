import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, ExpressionInput } from '../SketchBaseNode'
import type { SketchEllipseData } from '@/types/sketchNodes'
import { useEditorStore } from '@/store/editorStore'

export function SketchEllipseNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchEllipseData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_primitive"
      label="ellipse"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'rx' }, { id: 'in-1', label: 'ry' }]}
    >
      <ExpressionInput label="rx" value={d.rx} step={1} min={0} nodeId={id} handleId="in-0" onChange={(v) => update(id, { rx: v })} />
      <ExpressionInput label="ry" value={d.ry} step={1} min={0} nodeId={id} handleId="in-1" onChange={(v) => update(id, { ry: v })} />
    </SketchBaseNode>
  )
}
