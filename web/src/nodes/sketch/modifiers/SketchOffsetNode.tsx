import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, NumberInput } from '../SketchBaseNode'
import type { SketchOffsetData } from '@/types/sketchNodes'
import { useSketchStore } from '@/store/sketchStore'

export function SketchOffsetNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchOffsetData
  const update = useSketchStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_modifier"
      label="offset"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'shape' }]}
    >
      <NumberInput label="distance" value={d.distance} step={0.5} onChange={(v) => update(id, { distance: v })} />
    </SketchBaseNode>
  )
}
