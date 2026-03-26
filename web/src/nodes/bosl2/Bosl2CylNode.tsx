import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { Bosl2CylData } from '@/types/nodes'

export function Bosl2CylNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2CylData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="bosl2" label="cyl" selected={selected}>
      <NumberInput label="h"       value={d.h}       onChange={(v) => update(id, { h: v })} />
      <NumberInput label="r"       value={d.r}       min={0} onChange={(v) => update(id, { r: v })} />
      <NumberInput label="chamfer" value={d.chamfer} min={0} onChange={(v) => update(id, { chamfer: v })} />
      <NumberInput label="$fn"     value={d.fn}      min={3} step={1} onChange={(v) => update(id, { fn: v })} />
    </BaseNode>
  )
}
