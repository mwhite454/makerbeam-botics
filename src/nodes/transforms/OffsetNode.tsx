import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionInput, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { OffsetData } from '@/types/nodes'

export function OffsetNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as OffsetData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="transform" label="offset" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }, { id: 'in-1', label: 'r' }, { id: 'in-2', label: 'delta' }, { id: 'in-3', label: 'chamfer' }]}>
      <CheckboxInput label="use r" value={d.useR} onChange={(v) => update(id, { useR: v })} />
      {d.useR
        ? <ExpressionInput label="r" value={d.r} step={0.5} onChange={(v) => update(id, { r: v })} />
        : <>
            <ExpressionInput label="delta" value={d.delta} step={0.5} onChange={(v) => update(id, { delta: v })} />
            <CheckboxInput label="chamfer" value={d.chamfer} onChange={(v) => update(id, { chamfer: v })} />
          </>
      }
    </BaseNode>
  )
}
