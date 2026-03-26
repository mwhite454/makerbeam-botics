import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2ZRotData } from '@/types/nodes'

export function Bosl2ZRotNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2ZRotData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2" label="zrot" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }]}>
      <NumberInput label="angle" value={d.angle} step={1} onChange={(v) => update(id, { angle: v })} />
    </BaseNode>
  )
}
