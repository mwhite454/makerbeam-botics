import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, CheckboxInput, SelectInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2PathSweepData } from '../../types/rounding'

export function PathSweepNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2PathSweepData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_rounding" label="path_sweep" selected={selected}>
      <SelectInput label="method" value={d.method} options={["incremental", "manual", "natural"]} onChange={(v) => update(id, { method: v })} />
      <ExpressionInput label="twist" value={d.twist} step={1} onChange={(v) => update(id, { twist: v })} />
      <CheckboxInput label="closed" value={d.closed} onChange={(v) => update(id, { closed: v })} />
    </BaseNode>
  )
}
