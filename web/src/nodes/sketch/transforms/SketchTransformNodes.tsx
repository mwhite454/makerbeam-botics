import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, NumberInput } from '../SketchBaseNode'
import type { SketchTranslateData, SketchRotateData, SketchScaleData, SketchMirrorData } from '@/types/sketchNodes'
import { useSketchStore } from '@/store/sketchStore'

export function SketchTranslateNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchTranslateData
  const update = useSketchStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_transform"
      label="translate"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'shape' }, { id: 'in-1', label: 'x' }, { id: 'in-2', label: 'y' }]}
    >
      <NumberInput label="x" value={d.x} step={1} onChange={(v) => update(id, { x: v })} />
      <NumberInput label="y" value={d.y} step={1} onChange={(v) => update(id, { y: v })} />
    </SketchBaseNode>
  )
}

export function SketchRotateNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchRotateData
  const update = useSketchStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_transform"
      label="rotate"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'shape' }, { id: 'in-1', label: 'angle' }]}
    >
      <NumberInput label="angle°" value={d.angle} step={5} onChange={(v) => update(id, { angle: v })} />
    </SketchBaseNode>
  )
}

export function SketchScaleNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchScaleData
  const update = useSketchStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_transform"
      label="scale"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'shape' }, { id: 'in-1', label: 'x' }, { id: 'in-2', label: 'y' }]}
    >
      <NumberInput label="x" value={d.x} step={0.1} onChange={(v) => update(id, { x: v })} />
      <NumberInput label="y" value={d.y} step={0.1} onChange={(v) => update(id, { y: v })} />
    </SketchBaseNode>
  )
}

export function SketchMirrorNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchMirrorData
  const update = useSketchStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_transform"
      label="mirror"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'shape' }, { id: 'in-1', label: 'axis' }]}
    >
      <NumberInput label="axis°" value={d.axisAngle} step={5} onChange={(v) => update(id, { axisAngle: v })} />
    </SketchBaseNode>
  )
}
