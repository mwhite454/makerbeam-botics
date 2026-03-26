import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, NumberInput, CheckboxInput } from '../SketchBaseNode'
import type { SketchNgonData } from '@/types/sketchNodes'
import { useSketchStore } from '@/store/sketchStore'

export function SketchNgonNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchNgonData
  const update = useSketchStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode id={id} category="sketch_primitive" label="n-gon" selected={selected}>
      <NumberInput label="sides" value={d.sides} step={1} min={3} onChange={(v) => update(id, { sides: Math.max(3, Math.round(v)) })} />
      <NumberInput label="radius" value={d.radius} step={1} min={0} onChange={(v) => update(id, { radius: v })} />
      <CheckboxInput label="inscribed" value={d.inscribed} onChange={(v) => update(id, { inscribed: v })} />
    </SketchBaseNode>
  )
}
