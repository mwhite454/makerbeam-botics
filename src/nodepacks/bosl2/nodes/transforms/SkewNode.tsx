import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2SkewData } from '../../types/transforms'

export function SkewNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2SkewData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_transforms" label="skew" selected={selected}>
      <ExpressionInput label="sxy" value={d.sxy} step={0.1} onChange={(v) => update(id, { sxy: v })} />
      <ExpressionInput label="sxz" value={d.sxz} step={0.1} onChange={(v) => update(id, { sxz: v })} />
      <ExpressionInput label="syx" value={d.syx} step={0.1} onChange={(v) => update(id, { syx: v })} />
      <ExpressionInput label="syz" value={d.syz} step={0.1} onChange={(v) => update(id, { syz: v })} />
      <ExpressionInput label="szx" value={d.szx} step={0.1} onChange={(v) => update(id, { szx: v })} />
      <ExpressionInput label="szy" value={d.szy} step={0.1} onChange={(v) => update(id, { szy: v })} />
    </BaseNode>
  )
}
