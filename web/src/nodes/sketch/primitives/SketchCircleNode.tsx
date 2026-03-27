import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, NumberInput } from '../SketchBaseNode'
import type { SketchCircleData } from '@/types/sketchNodes'
import { useSketchStore } from '@/store/sketchStore'

export function SketchCircleNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchCircleData
  const update = useSketchStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_primitive"
      label="circle"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'r' }, { id: 'in-1', label: 'seg' }]}
    >
      <NumberInput label="radius" value={d.radius} step={1} min={0} onChange={(v) => update(id, { radius: v })} />
      <NumberInput label="segments" value={d.segments} step={1} min={0} onChange={(v) => update(id, { segments: v })} />
    </SketchBaseNode>
  )
}
