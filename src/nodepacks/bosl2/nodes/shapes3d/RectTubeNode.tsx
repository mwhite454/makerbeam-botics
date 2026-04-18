import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2RectTubeData } from '../../types/shapes3d'

export function RectTubeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RectTubeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="rect_tube" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'h' },
        { id: 'in-1', label: 'size_x' },
        { id: 'in-2', label: 'size_y' },
        { id: 'in-3', label: 'isize_x' },
        { id: 'in-4', label: 'isize_y' },
        { id: 'in-5', label: 'wall' },
        { id: 'in-6', label: 'rounding' },
      ]}
    >
      <ExpressionInput label="h" value={d.h} step={1} nodeId={id} handleId="in-0" onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="size_x" value={d.size_x} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { size_x: v })} />
      <ExpressionInput label="size_y" value={d.size_y} step={1} nodeId={id} handleId="in-2" onChange={(v) => update(id, { size_y: v })} />
      <ExpressionInput label="isize_x" value={d.isize_x} step={1} nodeId={id} handleId="in-3" onChange={(v) => update(id, { isize_x: v })} />
      <ExpressionInput label="isize_y" value={d.isize_y} step={1} nodeId={id} handleId="in-4" onChange={(v) => update(id, { isize_y: v })} />
      <ExpressionInput label="wall" value={d.wall} step={0.5} nodeId={id} handleId="in-5" onChange={(v) => update(id, { wall: v })} />
      <ExpressionInput label="rounding" value={d.rounding} step={0.5} nodeId={id} handleId="in-6" onChange={(v) => update(id, { rounding: v })} />
    </BaseNode>
  )
}
