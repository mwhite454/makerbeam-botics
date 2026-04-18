import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2RotateSweepData } from '../../types/rounding'

export function RotateSweepNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RotateSweepData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_rounding" label="rotate_sweep" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'child' },
        { id: 'in-1', label: 'angle' },
      ]}
    >
      <ExpressionInput label="angle" value={d.angle} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { angle: v })} />
    </BaseNode>
  )
}
