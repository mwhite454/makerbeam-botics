import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { CylinderData } from '@/types/nodes'

export function CylinderNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as CylinderData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="primitive3d" label="cylinder" selected={selected}>
      <NumberInput label="height" value={d.h}  min={0.01} step={0.5} onChange={(v) => update(id, { h: v })} />
      <NumberInput label="r1"    value={d.r1} min={0}    step={0.5} onChange={(v) => update(id, { r1: v })} />
      <NumberInput label="r2"    value={d.r2} min={0}    step={0.5} onChange={(v) => update(id, { r2: v })} />
      <NumberInput label="$fn"   value={d.fn} min={3}    step={1}   onChange={(v) => update(id, { fn: v })} />
      <CheckboxInput label="center" value={d.center} onChange={(v) => update(id, { center: v })} />
    </BaseNode>
  )
}
