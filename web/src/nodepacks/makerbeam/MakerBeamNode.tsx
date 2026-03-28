import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput } from '@/nodes/BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { MakerBeamData } from './types'

export function MakerBeamNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as MakerBeamData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="makerbeam" label="makerbeam" selected={selected}>
      <NumberInput label="length (mm)" value={d.length} min={1} step={10} onChange={(v) => update(id, { length: v })} />
      <div className="text-[9px] text-yellow-600 mt-1">MakerBeamXL 15×15mm</div>
    </BaseNode>
  )
}
