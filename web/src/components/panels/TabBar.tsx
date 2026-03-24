import { useState } from 'react'
import { useEditorStore } from '@/store/editorStore'

export function TabBar() {
  const { tabs, activeTabId, addTab, removeTab, renameTab, setActiveTab } = useEditorStore()
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const startRename = (id: string, currentLabel: string) => {
    setEditing(id)
    setEditValue(currentLabel)
  }

  const finishRename = () => {
    if (editing && editValue.trim()) {
      renameTab(editing, editValue.trim())
    }
    setEditing(null)
  }

  return (
    <div className="h-8 bg-gray-900 border-t border-white/10 flex items-stretch shrink-0 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            flex items-center gap-1 px-3 border-r border-white/5 cursor-pointer
            text-[11px] font-medium transition-colors select-none min-w-0 shrink-0
            ${activeTabId === tab.id
              ? 'bg-gray-800 text-white border-t-2 border-t-blue-500'
              : 'bg-gray-900 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 border-t-2 border-t-transparent'}
          `}
          onClick={() => setActiveTab(tab.id)}
          onDoubleClick={() => startRename(tab.id, tab.label)}
        >
          {/* Module badge */}
          {tab.isModule && (
            <span className="text-[8px] bg-purple-600/50 text-purple-300 rounded px-1 py-0 font-bold uppercase">
              mod
            </span>
          )}

          {/* Tab name (editable) */}
          {editing === tab.id ? (
            <input
              autoFocus
              className="bg-gray-700 text-white text-[11px] px-1 py-0 rounded border border-blue-500 outline-none w-20"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={finishRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') finishRename()
                if (e.key === 'Escape') setEditing(null)
              }}
            />
          ) : (
            <span className="truncate max-w-[100px]">{tab.label}</span>
          )}

          {/* Close button (not for main tab) */}
          {tab.id !== 'main' && (
            <button
              className="text-gray-600 hover:text-red-400 transition-colors ml-1 text-sm leading-none"
              onClick={(e) => {
                e.stopPropagation()
                removeTab(tab.id)
              }}
              title="Close tab"
            >
              ×
            </button>
          )}
        </div>
      ))}

      {/* Add tab buttons */}
      <div className="flex items-center gap-0 ml-1 shrink-0">
        <button
          className="text-gray-600 hover:text-white transition-colors px-2 text-[11px] h-full hover:bg-gray-800/50"
          onClick={() => addTab(`Tab ${tabs.length + 1}`, false)}
          title="Add new tab"
        >
          + Tab
        </button>
        <button
          className="text-gray-600 hover:text-purple-300 transition-colors px-2 text-[11px] h-full hover:bg-gray-800/50"
          onClick={() => {
            const name = `module_${tabs.filter(t => t.isModule).length + 1}`
            addTab(name, true)
          }}
          title="Add new module tab"
        >
          + Module
        </button>
      </div>
    </div>
  )
}
