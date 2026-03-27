import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { RotateExtrudeData } from '@/types/nodes'

export function RotateExtrudeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as RotateExtrudeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="extrusion" label="rotate_extrude" selected={selected}
      inputHandles={[{ id: 'in-0', label: '2D shape' }, { id: 'in-1', label: 'angle' }, { id: 'in-2', label: '$fn' }]}> 
      <ExpressionInput label="angle" value={d.angle} step={15} onChange={(v) => update(id, { angle: v })} />
      <ExpressionInput label="$fn" value={d.fn} step={1} onChange={(v) => update(id, { fn: v })} />
    </BaseNode>
  )
}
