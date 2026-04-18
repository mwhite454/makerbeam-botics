import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2TeardropData } from '../../types/shapes3d'

export function TeardropNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2TeardropData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_shapes3d" label="teardrop" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'h' },
        { id: 'in-1', label: 'r' },
        { id: 'in-2', label: 'ang' },
        { id: 'in-3', label: 'cap_h' },
      ]}
    >
      <ExpressionInput label="h" value={d.h} step={1} nodeId={id} handleId="in-0" onChange={(v) => update(id, { h: v })} />
      <ExpressionInput label="r" value={d.r} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { r: v })} />
      <ExpressionInput label="ang" value={d.ang} step={5} nodeId={id} handleId="in-2" onChange={(v) => update(id, { ang: v })} />
      <ExpressionInput label="cap_h" value={d.cap_h} step={0.5} nodeId={id} handleId="in-3" onChange={(v) => update(id, { cap_h: v })} />
    </BaseNode>
  )
}
