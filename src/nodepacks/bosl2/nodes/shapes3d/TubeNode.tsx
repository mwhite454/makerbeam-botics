import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2TubeData } from '../../types/shapes3d'

export function TubeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2TubeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="tube" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'h' },
        { id: 'in-1', label: 'or' },
        { id: 'in-2', label: 'ir' },
        { id: 'in-3', label: 'wall' },
      ]}
    >
      <ExpressionInput label="h" value={d.h} step={1} nodeId={id} handleId="in-0" onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="or" value={d.or} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { or: v })} />
      <ExpressionInput label="ir" value={d.ir} step={1} nodeId={id} handleId="in-2" onChange={(v) => update(id, { ir: v })} />
      <ExpressionInput label="wall" value={d.wall} step={0.5} nodeId={id} handleId="in-3" onChange={(v) => update(id, { wall: v })} />
    </BaseNode>
  )
}
