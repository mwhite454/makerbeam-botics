import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2MoveData } from '../../types/transforms'

export function MoveNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2MoveData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_transforms" label="move" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'child' },
        { id: 'in-1', label: 'x' },
        { id: 'in-2', label: 'y' },
        { id: 'in-3', label: 'z' },
      ]}>
      <ExpressionInput label="x" value={d.x} step={1} onChange={(v) => update(id, { x: v })} />
      <ExpressionInput label="y" value={d.y} step={1} onChange={(v) => update(id, { y: v })} />
      <ExpressionInput label="z" value={d.z} step={1} onChange={(v) => update(id, { z: v })} />
    </BaseNode>
  )
}
