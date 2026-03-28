import { type NodeProps } from '@xyflow/react'
import { BaseNode, ExpressionVectorInput, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { CubeData } from '@/types/nodes'

export function CubeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as CubeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode
      id={id}
      category="primitive3d"
      label="cube"
      selected={selected}
      inputHandles={[
        { id: 'in-0', label: 'x' },
        { id: 'in-1', label: 'y' },
        { id: 'in-2', label: 'z' },
        { id: 'in-3', label: 'center' },
      ]}
    >
      <ExpressionVectorInput label="size" value={[d.x, d.y, d.z]} step={0.5}
        nodeId={id} handleIds={['in-0', 'in-1', 'in-2']}
        onChange={([x, y, z]) => update(id, { x, y, z })} />
      <CheckboxInput label="center" value={d.center}
        onChange={(v) => update(id, { center: v })} />
    </BaseNode>
  )
}
