import { memo, useCallback } from 'react'
import { NodeResizer, useReactFlow, type NodeProps } from '@xyflow/react'
import type { GroupNodeData } from '@/types/nodes'

const GROUP_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export const GroupNode = memo(function GroupNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as GroupNodeData
  const { deleteElements, updateNodeData } = useReactFlow()

  const color = d.color || GROUP_COLORS[0]

  const onNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { notes: e.target.value })
  }, [id, updateNodeData])

  const onLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { label: e.target.value })
  }, [id, updateNodeData])

  const cycleColor = useCallback(() => {
    const idx = GROUP_COLORS.indexOf(color)
    const next = GROUP_COLORS[(idx + 1) % GROUP_COLORS.length]
    updateNodeData(id, { color: next })
  }, [id, color, updateNodeData])

  const onDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElements({ nodes: [{ id }] })
  }, [id, deleteElements])

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={150}
        minHeight={100}
        lineClassName="!border-white/30"
        handleClassName="!w-2.5 !h-2.5 !bg-white/60 !border-white/80"
        onResize={(_event, params) => {
          updateNodeData(id, { width: params.width, height: params.height })
        }}
      />
      <div
        className="w-full h-full rounded-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: `${color}15`,
          border: `2px ${selected ? 'solid' : 'dashed'} ${color}50`,
          minWidth: d.width || 200,
          minHeight: d.height || 150,
        }}
      >
        {/* Drag handle / header */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 shrink-0 cursor-grab active:cursor-grabbing"
          style={{ backgroundColor: `${color}25` }}
        >
          {/* Grip icon */}
          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="8" cy="6" r="1.5" />
            <circle cx="16" cy="6" r="1.5" />
            <circle cx="8" cy="12" r="1.5" />
            <circle cx="16" cy="12" r="1.5" />
            <circle cx="8" cy="18" r="1.5" />
            <circle cx="16" cy="18" r="1.5" />
          </svg>

          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-[11px] font-semibold text-gray-300 placeholder-gray-500 nodrag nopan"
            placeholder="Group name"
            value={d.label || ''}
            onChange={onLabelChange}
          />

          {/* Color cycle button */}
          <button
            onClick={cycleColor}
            className="w-4 h-4 rounded-full border border-white/20 shrink-0 nodrag nopan hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title="Change color"
          />

          {/* Delete button */}
          <button
            onClick={onDelete}
            className="text-gray-500 hover:text-red-400 text-xs leading-none nodrag nopan"
            title="Remove group"
          >
            ✕
          </button>
        </div>

        {/* Notes area */}
        <div className="flex-1 p-2">
          <textarea
            className="w-full h-full bg-transparent border-none outline-none text-[10px] text-gray-400 placeholder-gray-600 resize-none nodrag nopan"
            placeholder="Notes..."
            value={d.notes || ''}
            onChange={onNotesChange}
          />
        </div>
      </div>
    </>
  )
})
