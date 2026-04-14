import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2AxisScaleData } from '../../types/transforms'

export function XscaleNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2AxisScaleData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_transforms" label="xscale" selected={selected}>
      <ExpressionInput label="factor" value={d.factor} step={0.1} onChange={(v) => update(id, { factor: v })} />
    </BaseNode>
  )
}
