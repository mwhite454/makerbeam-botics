import { useState, useCallback, useEffect, useRef } from 'react'
import type { Node, ReactFlowInstance } from '@xyflow/react'

interface SearchBarProps {
  nodes: Node[]
  updateNodeData: (id: string, data: Record<string, unknown>) => void
  rfInstance: React.RefObject<ReactFlowInstance | null>
}

export function SearchBar({ nodes, updateNodeData, rfInstance }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Clear all search highlights
  const clearHighlights = useCallback(() => {
    for (const node of nodes) {
      const d = node.data as Record<string, unknown>
      if (d._searchMatch) {
        updateNodeData(node.id, { _searchMatch: undefined })
      }
    }
    setMatchCount(0)
  }, [nodes, updateNodeData])

  // Perform search
  const doSearch = useCallback((q: string) => {
    const term = q.trim().toLowerCase()
    if (!term) {
      clearHighlights()
      return
    }

    const matched: Node[] = []
    for (const node of nodes) {
      if (node.type === 'group_node') continue
      const d = node.data as Record<string, unknown>
      const name = ((d.nodeName as string) ?? '').toLowerCase()
      const tags = (d.nodeTags as string[]) ?? []

      const nameMatch = name.includes(term)
      const tagMatch = tags.some((t) => t.toLowerCase().includes(term))

      if (nameMatch || tagMatch) {
        matched.push(node)
        if (!d._searchMatch) updateNodeData(node.id, { _searchMatch: true })
      } else {
        if (d._searchMatch) updateNodeData(node.id, { _searchMatch: undefined })
      }
    }

    setMatchCount(matched.length)

    // Fit view to matched nodes
    if (matched.length > 0 && rfInstance.current) {
      rfInstance.current.fitView({
        nodes: matched.map((n) => ({ id: n.id })),
        padding: 0.3,
        duration: 300,
      })
    }
  }, [nodes, updateNodeData, rfInstance, clearHighlights])

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, doSearch])

  // Cleanup highlights when closing
  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    clearHighlights()
  }, [clearHighlights])

  // Keyboard shortcut: Ctrl+F to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-gray-800/90 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors backdrop-blur-sm flex items-center gap-2"
        title="Search nodes (Ctrl+F)"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        Search
      </button>
    )
  }

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-gray-800/95 border border-gray-600 rounded-lg px-3 py-2 backdrop-blur-sm flex items-center gap-2 shadow-xl">
      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-500 w-48 nodrag"
        placeholder="Search by name or tag..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') close()
        }}
      />
      {query && (
        <span className="text-[10px] text-gray-500 shrink-0">
          {matchCount} match{matchCount !== 1 ? 'es' : ''}
        </span>
      )}
      <button
        onClick={close}
        className="text-gray-500 hover:text-gray-300 text-xs shrink-0"
        title="Close (Esc)"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
