import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { SphereData } from '@/types/nodes'

export function SphereNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SphereData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="primitive3d" label="sphere" selected={selected}>
      <NumberInput label="radius" value={d.r}  min={0.01} step={0.5} onChange={(v) => update(id, { r: v })} />
      <NumberInput label="$fn"   value={d.fn} min={3}    step={1}   onChange={(v) => update(id, { fn: v })} />
    </BaseNode>
  )
}
