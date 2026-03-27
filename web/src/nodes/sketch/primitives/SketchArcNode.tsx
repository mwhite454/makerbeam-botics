import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, NumberInput } from '../SketchBaseNode'
import type { SketchArcData } from '@/types/sketchNodes'
import { useSketchStore } from '@/store/sketchStore'

export function SketchArcNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchArcData
  const update = useSketchStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_primitive"
      label="arc"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'r' }, { id: 'in-1', label: 'start' }, { id: 'in-2', label: 'end' }]}
    >
      <NumberInput label="radius" value={d.radius} step={1} min={0} onChange={(v) => update(id, { radius: v })} />
      <NumberInput label="start°" value={d.startAngle} step={5} onChange={(v) => update(id, { startAngle: v })} />
      <NumberInput label="end°" value={d.endAngle} step={5} onChange={(v) => update(id, { endAngle: v })} />
    </SketchBaseNode>
  )
}
