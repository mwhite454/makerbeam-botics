import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, TextInput, CheckboxInput } from '../SketchBaseNode'
import type { SketchLineData } from '@/types/sketchNodes'
import { useSketchStore } from '@/store/sketchStore'

export function SketchLineNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchLineData
  const update = useSketchStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode id={id} category="sketch_primitive" label="polyline" selected={selected}>
      <TextInput label="points" value={d.points} onChange={(v) => update(id, { points: v })} />
      <CheckboxInput label="closed" value={d.closed} onChange={(v) => update(id, { closed: v })} />
    </SketchBaseNode>
  )
}
