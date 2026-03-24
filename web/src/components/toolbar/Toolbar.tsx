import { useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { useOpenSCAD }    from '@/wasm/useOpenSCAD'
import type { WasmStatus } from '@/wasm/useOpenSCAD'

interface ToolbarProps {
  onRender: () => void
}

function WasmIndicator({ status }: { status: WasmStatus }) {
  const colors: Record<WasmStatus, string> = {
    loading:     'bg-yellow-400',
    ready:       'bg-green-400',
    unavailable: 'bg-red-500',
  }
  const labels: Record<WasmStatus, string> = {
    loading:     'WASM loading…',
    ready:       'WASM ready',
    unavailable: 'WASM unavailable',
  }
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
      <div className={`w-2 h-2 rounded-full ${colors[status]} ${status === 'loading' ? 'animate-pulse' : ''}`} />
      {labels[status]}
    </div>
  )
}

export function Toolbar({ onRender }: ToolbarProps) {
  const { wasmStatus } = useOpenSCAD()
  const {
    renderStatus, previewMode, autoRender, codePanelOpen,
    setPreviewMode, setAutoRender, toggleCodePanel,
    exportProject, importProject,
  } = useEditorStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const json = exportProject()
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'openscad-project.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoad = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        importProject(reader.result)
      }
    }
    reader.readAsText(file)
    // Reset the input so the same file can be loaded again
    e.target.value = ''
  }

  return (
    <header className="h-10 bg-gray-950 border-b border-white/10 flex items-center gap-3 px-4 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center text-[10px] font-black text-gray-900">
          MB
        </div>
        <span className="text-sm font-semibold text-white">Node Editor</span>
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-gray-700" />

      {/* Save/Load */}
      <button
        className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
        onClick={handleSave}
        title="Save project to file"
      >
        Save
      </button>
      <button
        className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
        onClick={handleLoad}
        title="Load project from file"
      >
        Load
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex-1" />

      {/* Auto-render toggle */}
      <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          className="accent-blue-500"
          checked={autoRender}
          onChange={(e) => setAutoRender(e.target.checked)}
        />
        Auto-render
      </label>

      {/* Manual render button */}
      <button
        className={`
          px-3 py-1 rounded text-xs font-semibold transition-all
          ${renderStatus === 'rendering'
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-500 text-white'}
        `}
        onClick={onRender}
        disabled={renderStatus === 'rendering'}
      >
        {renderStatus === 'rendering' ? 'Rendering…' : 'Render'}
      </button>

      {/* Preview mode */}
      <div className="flex rounded overflow-hidden border border-white/10 text-[11px]">
        {(['stl', 'png'] as const).map((mode) => (
          <button
            key={mode}
            className={`px-2 py-1 transition-colors ${previewMode === mode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            onClick={() => setPreviewMode(mode)}
          >
            {mode.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Code panel toggle */}
      <button
        className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
        onClick={toggleCodePanel}
      >
        {codePanelOpen ? '▼ Code' : '▲ Code'}
      </button>

      <WasmIndicator status={wasmStatus} />
    </header>
  )
}
