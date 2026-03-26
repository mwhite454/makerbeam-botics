import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, NumberInput } from '../SketchBaseNode'
import type { SketchEllipseData } from '@/types/sketchNodes'
import { useSketchStore } from '@/store/sketchStore'

export function SketchEllipseNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchEllipseData
  const update = useSketchStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode id={id} category="sketch_primitive" label="ellipse" selected={selected}>
      <NumberInput label="rx" value={d.rx} step={1} min={0} onChange={(v) => update(id, { rx: v })} />
      <NumberInput label="ry" value={d.ry} step={1} min={0} onChange={(v) => update(id, { ry: v })} />
    </SketchBaseNode>
  )
}
