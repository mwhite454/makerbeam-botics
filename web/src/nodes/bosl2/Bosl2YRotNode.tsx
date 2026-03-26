import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2YRotData } from '@/types/nodes'

export function Bosl2YRotNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2YRotData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2" label="yrot" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }]}>
      <NumberInput label="angle" value={d.angle} step={1} onChange={(v) => update(id, { angle: v })} />
    </BaseNode>
  )
}
