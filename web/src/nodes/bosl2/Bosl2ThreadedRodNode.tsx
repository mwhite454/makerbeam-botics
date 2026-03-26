import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2ThreadedRodData } from '@/types/nodes'

export function Bosl2ThreadedRodNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2ThreadedRodData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2" label="threaded_rod" selected={selected}>
      <NumberInput label="d (diameter)" value={d.d}     min={1} onChange={(v) => update(id, { d: v })} />
      <NumberInput label="l (length)"   value={d.l}     min={1} onChange={(v) => update(id, { l: v })} />
      <NumberInput label="pitch"        value={d.pitch} min={0.1} step={0.1} onChange={(v) => update(id, { pitch: v })} />
      <NumberInput label="$fn"          value={d.fn}    min={3} step={1} onChange={(v) => update(id, { fn: v })} />
    </BaseNode>
  )
}
