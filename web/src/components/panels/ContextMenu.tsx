import { useEffect, useRef } from 'react'

interface ContextMenuProps {
  x: number
  y: number
  onGroupNodes: () => void
  onClose: () => void
}

export function ContextMenu({ x, y, onGroupNodes, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Dismiss on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Dismiss on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: y, left: x, zIndex: 1000 }}
      className="bg-gray-900 border border-gray-700 rounded shadow-xl py-1 min-w-[160px]"
    >
      <button
        className="w-full text-left px-3 py-1.5 text-[12px] text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        onClick={() => { onGroupNodes(); onClose() }}
      >
        Group Nodes
      </button>
    </div>
  )
}
