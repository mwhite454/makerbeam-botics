import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, ExpressionInput, CheckboxInput } from '../SketchBaseNode'
import type { SketchNgonData } from '@/types/sketchNodes'
import { useEditorStore } from '@/store/editorStore'

export function SketchNgonNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchNgonData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_primitive"
      label="n-gon"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'sides' }, { id: 'in-1', label: 'r' }]}
    >
      <ExpressionInput
        label="sides"
        value={d.sides}
        step={1}
        min={3}
        nodeId={id}
        handleId="in-0"
        onChange={(v) => {
          const n = typeof v === 'number' ? v : Number(v) || 3
          update(id, { sides: Math.max(3, Math.round(n)) })
        }}
      />
      <ExpressionInput label="radius" value={d.radius} step={1} min={0} nodeId={id} handleId="in-1" onChange={(v) => update(id, { radius: v })} />
      <CheckboxInput label="inscribed" value={d.inscribed} onChange={(v) => update(id, { inscribed: v })} />
    </SketchBaseNode>
  )
}
