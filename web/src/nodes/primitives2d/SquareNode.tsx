import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { SquareData } from '@/types/nodes'

export function SquareNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SquareData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="primitive2d" label="square" selected={selected}>
      <NumberInput label="width"  value={d.x} min={0.01} step={0.5} onChange={(v) => update(id, { x: v })} />
      <NumberInput label="height" value={d.y} min={0.01} step={0.5} onChange={(v) => update(id, { y: v })} />
      <CheckboxInput label="center" value={d.center} onChange={(v) => update(id, { center: v })} />
    </BaseNode>
  )
}
