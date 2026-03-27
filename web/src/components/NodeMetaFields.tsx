import { useState, useCallback } from 'react'

interface NodeMetaFieldsProps {
  id: string
  nodeName?: string
  nodeTags?: string[]
  updateNodeData: (id: string, data: Record<string, unknown>) => void
  accentColor?: string // tailwind color class for focus ring, e.g. 'blue' or 'pink'
}

export function NodeMetaFields({ id, nodeName, nodeTags = [], updateNodeData, accentColor = 'blue' }: NodeMetaFieldsProps) {
  const [expanded, setExpanded] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const focusBorder = accentColor === 'pink' ? 'focus:border-pink-500' : 'focus:border-blue-500'

  const onNameChange = useCallback((v: string) => {
    updateNodeData(id, { nodeName: v || undefined })
  }, [id, updateNodeData])

  const addTag = useCallback(() => {
    const tag = tagInput.trim()
    if (!tag) return
    const existing = nodeTags ?? []
    if (!existing.includes(tag)) {
      updateNodeData(id, { nodeTags: [...existing, tag] })
    }
    setTagInput('')
  }, [id, tagInput, nodeTags, updateNodeData])

  const removeTag = useCallback((tag: string) => {
    updateNodeData(id, { nodeTags: (nodeTags ?? []).filter((t) => t !== tag) })
  }, [id, nodeTags, updateNodeData])

  const onTagKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }, [addTag])

  return (
    <div className="nodrag nopan">
      {/* Collapsed: show name if set, plus toggle */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors w-full py-0.5"
          title="Edit name & tags"
        >
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          {nodeName ? (
            <span className="text-gray-400 truncate">{nodeName}</span>
          ) : (
            <span className="italic">name / tags</span>
          )}
        </button>
      )}

      {/* Expanded editor */}
      {expanded && (
        <div className="space-y-1.5 py-1">
          <div className="flex items-center gap-1">
            <input
              type="text"
              className={`flex-1 bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none ${focusBorder} nodrag`}
              placeholder="Node name"
              value={nodeName ?? ''}
              onChange={(e) => onNameChange(e.target.value)}
            />
            <button
              onClick={() => setExpanded(false)}
              className="text-gray-500 hover:text-gray-300 text-xs px-1"
              title="Collapse"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {(nodeTags ?? []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 bg-gray-700/80 text-gray-300 text-[9px] px-1.5 py-0.5 rounded-full"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-gray-500 hover:text-red-400 leading-none"
                >
                  x
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <input
              type="text"
              className={`flex-1 bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none ${focusBorder} nodrag`}
              placeholder="Add tag + Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={onTagKeyDown}
              onBlur={addTag}
            />
          </div>
        </div>
      )}

      {/* Tag pills (always visible when collapsed and tags exist) */}
      {!expanded && nodeTags && nodeTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {nodeTags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-700/60 text-gray-400 text-[9px] px-1.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
