import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { SquareData } from '@/types/nodes'

export function SquareNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SquareData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode
      id={id}
      category="primitive2d"
      label="square"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'x' }, { id: 'in-1', label: 'y' }, { id: 'in-2', label: 'center' }]}
    >
      <ExpressionInput label="width" value={d.x} step={0.5} onChange={(v) => update(id, { x: v })} />
      <ExpressionInput label="height" value={d.y} step={0.5} onChange={(v) => update(id, { y: v })} />
      <CheckboxInput label="center" value={d.center} onChange={(v) => update(id, { center: v })} />
    </BaseNode>
  )
}
