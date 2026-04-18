import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2SpiralSweepData } from '../../types/rounding'

export function SpiralSweepNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2SpiralSweepData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_rounding" label="spiral_sweep" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'h' },
        { id: 'in-1', label: 'r' },
        { id: 'in-2', label: 'turns' },
      ]}
    >
      <ExpressionInput label="h" value={d.h} step={1} nodeId={id} handleId="in-0" onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="r" value={d.r} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { r: v })} />
      <ExpressionInput label="turns" value={d.turns} step={1} nodeId={id} handleId="in-2" onChange={(v) => update(id, { turns: v })} />
    </BaseNode>
  )
}
