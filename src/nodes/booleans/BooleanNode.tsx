import { type NodeProps } from '@xyflow/react'
import { BaseNode } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { BooleanData } from '@/types/nodes'
import type { NodeCategory } from '@/types/nodes'

interface BooleanNodeProps extends NodeProps {
  opLabel: string
  category: NodeCategory
}

export function BooleanNodeBase({ id, data, selected, opLabel, category }: BooleanNodeProps) {
  const d = data as unknown as BooleanData
  const update = useEditorStore((s) => s.updateNodeData)
  const handles = Array.from({ length: d.childCount }, (_, i) => ({
    id: `in-${i}`,
    label: i === 0 ? 'base' : `child ${i}`,
  }))

  return (
    <BaseNode id={id} category={category} label={opLabel} selected={selected} inputHandles={handles}>
      <div className="flex items-center gap-2 pt-1">
        <button
          className="w-5 h-5 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold flex items-center justify-center"
          onClick={() => update(id, { childCount: d.childCount + 1 })}
        >+</button>
        <span className="text-[10px] text-gray-400">{d.childCount} children</span>
        <button
          className="w-5 h-5 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold flex items-center justify-center"
          onClick={() => update(id, { childCount: Math.max(2, d.childCount - 1) })}
        >-</button>
      </div>
    </BaseNode>
  )
}

export function UnionNode(props: NodeProps) {
  return <BooleanNodeBase {...props} opLabel="union" category="boolean" />
}

export function DifferenceNode(props: NodeProps) {
  return <BooleanNodeBase {...props} opLabel="difference" category="boolean" />
}

export function IntersectionNode(props: NodeProps) {
  return <BooleanNodeBase {...props} opLabel="intersection" category="boolean" />
}
