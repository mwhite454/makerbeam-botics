import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { RotateExtrudeData } from '@/types/nodes'

export function RotateExtrudeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as RotateExtrudeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="extrusion" label="rotate_extrude" selected={selected}
      inputHandles={[{ id: 'in-0', label: '2D shape' }]}>
      <NumberInput label="angle" value={d.angle} min={0} max={360} step={15} onChange={(v) => update(id, { angle: v })} />
      <NumberInput label="$fn"   value={d.fn}    min={3}            step={1}  onChange={(v) => update(id, { fn: v })} />
    </BaseNode>
  )
}
