import { useCallback, useMemo, useRef, useState } from 'react'
import {
  SKETCH_PALETTE_ITEMS,
  SKETCH_CATEGORY_COLORS,
  SKETCH_CATEGORY_TEXT,
  SKETCH_CATEGORY_LABELS,
  type SketchNodeCategory,
  type SketchPaletteItem,
} from '@/types/sketchNodes'
import { NodeTooltipPopover } from '@/components/toolbar/NodeTooltipPopover'
import { useTouchNodeDrop } from '@/hooks/useTouchNodeDrop'

const SKETCH_CATEGORY_ORDER: SketchNodeCategory[] = [
  'sketch_primitive',
  'sketch_boolean',
  'sketch_transform',
  'sketch_modifier',
  'sketch_control',
]

export function SketchNodePalette() {
  const [tooltip, setTooltip] = useState<{ item: SketchPaletteItem; rect: DOMRect } | null>(null)
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { handleTouchStart } = useTouchNodeDrop()

  const handleMouseEnter = useCallback((e: React.MouseEvent, item: SketchPaletteItem) => {
    const rect = e.currentTarget.getBoundingClientRect()
    tooltipTimer.current && clearTimeout(tooltipTimer.current)
    tooltipTimer.current = setTimeout(() => setTooltip({ item, rect }), 400)
  }, [])

  const handleMouseLeave = useCallback(() => {
    tooltipTimer.current && clearTimeout(tooltipTimer.current)
    setTooltip(null)
  }, [])

  const onDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow-nodetype', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  const grouped = useMemo(() =>
    SKETCH_CATEGORY_ORDER.map((cat) => ({
      category: cat,
      items: SKETCH_PALETTE_ITEMS.filter((item) => item.category === cat),
    }))
  , [])

  return (
    <>
      <aside className="h-full bg-gray-900/80 border-r border-white/10 overflow-y-auto flex flex-col gap-0">
        <div className="px-3 py-2 border-b border-white/10">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sketch Nodes</span>
        </div>
        {grouped.map(({ category, items }) => (
          <div key={category} className="border-b border-white/5">
            <div className="px-3 py-1.5">
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">
                {SKETCH_CATEGORY_LABELS[category]}
              </span>
            </div>
            <div className="px-2 pb-2 flex flex-wrap gap-1">
              {items.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type)}
                  onMouseEnter={(e) => handleMouseEnter(e, item)}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={(e) =>
                    handleTouchStart(e, item.type, item.defaultData as Record<string, unknown>, item.label)
                  }
                  className={`
                    cursor-grab active:cursor-grabbing
                    ${SKETCH_CATEGORY_COLORS[item.category]} ${SKETCH_CATEGORY_TEXT[item.category]}
                    rounded px-2 py-0.5 text-[10px] font-medium
                    select-none hover:opacity-80 transition-opacity
                    border border-white/10
                  `}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </aside>
      {tooltip?.item.description && (
        <NodeTooltipPopover
          label={tooltip.item.label}
          description={tooltip.item.description}
          inputs={tooltip.item.inputs}
          anchorRect={tooltip.rect}
        />
      )}
    </>
  )
}
