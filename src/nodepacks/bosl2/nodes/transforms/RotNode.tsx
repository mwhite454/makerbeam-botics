import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2RotData } from '../../types/transforms'

export function RotNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RotData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_transforms" label="rot" selected={selected}>
      <ExpressionInput label="a" value={d.a} step={1} onChange={(v) => update(id, { a: v })} />
      <ExpressionInput label="vx" value={d.vx} step={1} onChange={(v) => update(id, { vx: v })} />
      <ExpressionInput label="vy" value={d.vy} step={1} onChange={(v) => update(id, { vy: v })} />
      <ExpressionInput label="vz" value={d.vz} step={1} onChange={(v) => update(id, { vz: v })} />
    </BaseNode>
  )
}
