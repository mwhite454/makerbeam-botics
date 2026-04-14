import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2AxisRotData } from '../../types/transforms'

export function YrotNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2AxisRotData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_transforms" label="yrot" selected={selected}>
      <ExpressionInput label="a" value={d.a} step={1} onChange={(v) => update(id, { a: v })} />
    </BaseNode>
  )
}
