import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2HalfOfData } from '../../types/attachments'

export function HalfOfNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2HalfOfData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2_attachments" label="half_of" selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'child' },
        { id: 'in-1', label: 'vx' },
        { id: 'in-2', label: 'vy' },
        { id: 'in-3', label: 'vz' },
        { id: 'in-4', label: 'cpx' },
        { id: 'in-5', label: 'cpy' },
        { id: 'in-6', label: 'cpz' },
      ]}
    >
      <ExpressionInput label="vx" value={d.vx} step={1} nodeId={id} handleId="in-1" onChange={(v) => update(id, { vx: v })} />
      <ExpressionInput label="vy" value={d.vy} step={1} nodeId={id} handleId="in-2" onChange={(v) => update(id, { vy: v })} />
      <ExpressionInput label="vz" value={d.vz} step={1} nodeId={id} handleId="in-3" onChange={(v) => update(id, { vz: v })} />
      <ExpressionInput label="cpx" value={d.cpx} step={1} nodeId={id} handleId="in-4" onChange={(v) => update(id, { cpx: v })} />
      <ExpressionInput label="cpy" value={d.cpy} step={1} nodeId={id} handleId="in-5" onChange={(v) => update(id, { cpy: v })} />
      <ExpressionInput label="cpz" value={d.cpz} step={1} nodeId={id} handleId="in-6" onChange={(v) => update(id, { cpz: v })} />
    </BaseNode>
  )
}
