import { type NodeProps } from '@xyflow/react'
import { BaseNode, VectorInput, CheckboxInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { CubeData } from '@/types/nodes'

export function CubeNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as CubeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode id={id} category="primitive3d" label="cube" selected={selected}>
      <VectorInput label="size" value={[d.x, d.y, d.z]} step={0.5}
        onChange={([x, y, z]) => update(id, { x, y, z })} />
      <CheckboxInput label="center" value={d.center}
        onChange={(v) => update(id, { center: v })} />
    </BaseNode>
  )
}
