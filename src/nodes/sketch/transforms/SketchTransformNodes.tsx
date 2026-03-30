import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, ExpressionInput } from '../SketchBaseNode'
import type { SketchTranslateData, SketchRotateData, SketchScaleData, SketchMirrorData } from '@/types/sketchNodes'
import { useEditorStore } from '@/store/editorStore'

export function SketchTranslateNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchTranslateData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_transform"
      label="translate"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'shape' }, { id: 'in-1', label: 'x' }, { id: 'in-2', label: 'y' }]}
    >
      <ExpressionInput label="x" value={d.x} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { x: v })} />
      <ExpressionInput label="y" value={d.y} step={1} nodeId={id} handleId="in-2" onChange={(v) => update(id, { y: v })} />
    </SketchBaseNode>
  )
}

export function SketchRotateNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchRotateData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_transform"
      label="rotate"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'shape' }, { id: 'in-1', label: 'angle' }]}
    >
      <ExpressionInput label="angle°" value={d.angle} step={5} nodeId={id} handleId="in-1" onChange={(v) => update(id, { angle: v })} />
    </SketchBaseNode>
  )
}

export function SketchScaleNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchScaleData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_transform"
      label="scale"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'shape' }, { id: 'in-1', label: 'x' }, { id: 'in-2', label: 'y' }]}
    >
      <ExpressionInput label="x" value={d.x} step={0.1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { x: v })} />
      <ExpressionInput label="y" value={d.y} step={0.1} nodeId={id} handleId="in-2" onChange={(v) => update(id, { y: v })} />
    </SketchBaseNode>
  )
}

export function SketchMirrorNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchMirrorData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_transform"
      label="mirror"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'shape' }, { id: 'in-1', label: 'axis' }]}
    >
      <ExpressionInput label="axis°" value={d.axisAngle} step={5} nodeId={id} handleId="in-1" onChange={(v) => update(id, { axisAngle: v })} />
    </SketchBaseNode>
  )
}
