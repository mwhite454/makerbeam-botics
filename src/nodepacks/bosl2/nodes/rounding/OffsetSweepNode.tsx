import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2OffsetSweepData } from '../../types/rounding'

export function OffsetSweepNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2OffsetSweepData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_rounding" label="offset_sweep" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'height' },
        { id: 'in-1', label: 'top_r' },
        { id: 'in-2', label: 'bot_r' },
      ]}
    >
      <ExpressionInput label="height" value={d.height} step={1} nodeId={id} handleId="in-0" onChange={(v) => update(id, { height: v })} />
      <ExpressionInput label="top_r" value={d.top_r} step={0.5} nodeId={id} handleId="in-1" onChange={(v) => update(id, { top_r: v })} />
      <ExpressionInput label="bot_r" value={d.bot_r} step={0.5} nodeId={id} handleId="in-2" onChange={(v) => update(id, { bot_r: v })} />
    </BaseNode>
  )
}
