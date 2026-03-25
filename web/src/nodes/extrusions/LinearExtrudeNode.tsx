import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { LinearExtrudeData } from '@/types/nodes'

export function LinearExtrudeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as LinearExtrudeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="extrusion" label="linear_extrude" selected={selected}
      inputHandles={[{ id: 'in-0', label: '2D shape' }]}>
      <NumberInput label="height" value={d.height} min={0.01} step={1} onChange={(v) => update(id, { height: v })} />
      <NumberInput label="twist"  value={d.twist}  step={5}            onChange={(v) => update(id, { twist: v })} />
      <NumberInput label="slices" value={d.slices} min={1}  step={1}   onChange={(v) => update(id, { slices: v })} />
      <NumberInput label="scale"  value={d.scale}  min={0}  step={0.1} onChange={(v) => update(id, { scale: v })} />
      <NumberInput label="$fn"    value={d.fn}     min={0}  step={1}   onChange={(v) => update(id, { fn: v })} />
      <CheckboxInput label="center" value={d.center} onChange={(v) => update(id, { center: v })} />
    </BaseNode>
  )
}
