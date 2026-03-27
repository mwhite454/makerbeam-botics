import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { LinearExtrudeData } from '@/types/nodes'

export function LinearExtrudeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as LinearExtrudeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="extrusion" label="linear_extrude" selected={selected}
      inputHandles={[
        { id: 'in-0', label: '2D shape' },
        { id: 'in-1', label: 'height' },
        { id: 'in-2', label: 'twist' },
        { id: 'in-3', label: 'slices' },
        { id: 'in-4', label: 'scale' },
        { id: 'in-5', label: '$fn' },
        { id: 'in-6', label: 'center' },
      ]}>
      <ExpressionInput label="height" value={d.height} step={1} onChange={(v) => update(id, { height: v })} />
      <ExpressionInput label="twist" value={d.twist} step={5} onChange={(v) => update(id, { twist: v })} />
      <ExpressionInput label="slices" value={d.slices} step={1} onChange={(v) => update(id, { slices: v })} />
      <ExpressionInput label="scale" value={d.scale} step={0.1} onChange={(v) => update(id, { scale: v })} />
      <ExpressionInput label="$fn" value={d.fn} step={1} onChange={(v) => update(id, { fn: v })} />
      <CheckboxInput label="center" value={d.center} onChange={(v) => update(id, { center: v })} />
    </BaseNode>
  )
}
