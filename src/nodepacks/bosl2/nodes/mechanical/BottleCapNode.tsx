import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, TextInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2BottleCapData } from '../../types/mechanical'

export function BottleCapNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2BottleCapData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_mechanical" label="bottle_cap" selected={selected}>
      <ExpressionInput label="wall" value={d.wall} step={0.5} onChange={(v) => update(id, { wall: v })} />
      <TextInput label="texture" value={d.texture} onChange={(v) => update(id, { texture: v })} />
    </BaseNode>
  )
}
