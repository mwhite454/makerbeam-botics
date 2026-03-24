import { useCallback } from 'react'
import { PALETTE_ITEMS, CATEGORY_COLORS, CATEGORY_TEXT, CATEGORY_LABELS, type NodeCategory } from '@/types/nodes'

const CATEGORY_ORDER: NodeCategory[] = [
  'primitive3d',
  'primitive2d',
  'transform',
  'boolean',
  'extrusion',
  'modifier',
  'makerbeam',
]

export function NodePalette() {
  const onDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow-nodetype', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: PALETTE_ITEMS.filter((item) => item.category === cat),
  }))

  return (
    <aside className="w-44 shrink-0 bg-gray-900/80 border-r border-white/10 overflow-y-auto flex flex-col gap-0">
      <div className="px-3 py-2 border-b border-white/10">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nodes</span>
      </div>
      {grouped.map(({ category, items }) => (
        <div key={category} className="border-b border-white/5">
          <div className="px-3 py-1.5">
            <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">
              {CATEGORY_LABELS[category]}
            </span>
          </div>
          <div className="px-2 pb-2 flex flex-wrap gap-1">
            {items.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => onDragStart(e, item.type)}
                className={`
                  cursor-grab active:cursor-grabbing
                  ${CATEGORY_COLORS[item.category]} ${CATEGORY_TEXT[item.category]}
                  rounded px-2 py-0.5 text-[10px] font-medium
                  select-none hover:opacity-80 transition-opacity
                  border border-white/10
                `}
                title={`Drag to add ${item.label}`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      ))}
    </aside>
  )
}
