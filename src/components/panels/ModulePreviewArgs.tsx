/**
 * F-002 R5: Module Argument Override UI
 *
 * Compact panel rendered inside the PreviewPanel when the active tab is a
 * module. Shows each module_arg node's name and type with an editable value
 * field. Changes trigger re-codegen and re-render via the store.
 */
import { useEditorStore } from '@/store/editorStore'

export function ModulePreviewArgs() {
  const tabs           = useEditorStore((s) => s.tabs)
  const activeTabId    = useEditorStore((s) => s.activeTabId)
  const nodes          = useEditorStore((s) => s.nodes)
  const modulePreviewArgs    = useEditorStore((s) => s.modulePreviewArgs)
  const setModulePreviewArgs = useEditorStore((s) => s.setModulePreviewArgs)

  const activeTab = tabs.find((t) => t.id === activeTabId)

  // Use live nodes (since the active tab's nodes are in state.nodes)
  const argNodes = nodes.filter((n) => n.type === 'module_arg')

  if (argNodes.length === 0) {
    return (
      <div className="px-3 py-2 border-b border-white/10 bg-purple-950/20 shrink-0">
        <span className="text-[9px] text-purple-400/60 uppercase tracking-widest font-bold">
          Module Preview
        </span>
        <p className="text-[10px] text-gray-500 mt-1">
          Add <span className="font-mono text-purple-300">module_arg</span> nodes to expose parameters.
        </p>
      </div>
    )
  }

  const handleChange = (argName: string, value: string) => {
    setModulePreviewArgs({ ...modulePreviewArgs, [argName]: value })
  }

  const handleReset = () => {
    const defaults: Record<string, string> = {}
    for (const n of argNodes) {
      const d = n.data as Record<string, unknown>
      const name = String(d.argName || '')
      if (name) defaults[name] = String(d.defaultValue ?? '0')
    }
    setModulePreviewArgs(defaults)
  }

  return (
    <div className="px-3 py-2 border-b border-white/10 bg-purple-950/20 flex flex-col gap-1.5 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">
          Module Preview — {activeTab?.label ?? ''}
        </span>
        <button
          onClick={handleReset}
          className="ml-auto text-[9px] text-gray-400 hover:text-white transition-colors px-1.5 py-0.5 rounded border border-gray-700 hover:border-gray-500"
          title="Reset all args to defaults"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {argNodes.map((n) => {
          const d = n.data as Record<string, unknown>
          const argName  = String(d.argName  || '')
          const dataType = String(d.dataType || 'number')
          const defaultVal = String(d.defaultValue ?? '0')
          const currentVal = modulePreviewArgs[argName] ?? defaultVal

          return (
            <div key={n.id} className="flex items-center gap-1.5">
              <span
                className="text-[10px] text-gray-300 font-mono min-w-0 flex-1 truncate"
                title={argName}
              >
                {argName}
              </span>
              <span className="text-[9px] text-gray-600 shrink-0">{dataType}</span>
              {dataType === 'boolean' ? (
                <select
                  value={currentVal}
                  onChange={(e) => handleChange(argName, e.target.value)}
                  className="w-16 text-[10px] bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-purple-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : (
                // Use text for all non-boolean types — numeric args can hold
                // expression values (e.g. "WIDTH/2") that are invalid for
                // <input type="number"> and would silently render as blank.
                <input
                  type="text"
                  value={currentVal}
                  onChange={(e) => handleChange(argName, e.target.value)}
                  className="w-20 text-[10px] text-right bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-purple-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
