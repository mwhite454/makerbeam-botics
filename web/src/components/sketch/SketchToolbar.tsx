import { useRef } from 'react'
import { useSketchStore } from '@/store/sketchStore'

export function SketchToolbar() {
  const {
    codePanelOpen,
    toggleCodePanel,
    exportProject,
    importProject,
  } = useSketchStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const json = exportProject()
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'makerjs-sketch.json'
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
    e.target.value = ''
  }

  return (
    <header className="h-10 bg-gray-950 border-b border-white/10 flex items-center gap-3 px-4 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-5 h-5 bg-pink-500 rounded flex items-center justify-center text-[10px] font-black text-white">
          SK
        </div>
        <span className="text-sm font-semibold text-white">Sketch Editor</span>
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-gray-700" />

      {/* Mode link */}
      <a
        href="/"
        className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
      >
        ← 3D Editor
      </a>

      {/* Separator */}
      <div className="w-px h-5 bg-gray-700" />

      {/* Save/Load */}
      <button
        className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
        onClick={handleSave}
        title="Save sketch project to file"
      >
        Save
      </button>
      <button
        className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
        onClick={handleLoad}
        title="Load sketch project from file"
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

      {/* Code panel toggle */}
      <button
        className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
        onClick={toggleCodePanel}
      >
        {codePanelOpen ? '▼ Code' : '▲ Code'}
      </button>

      {/* Status */}
      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
        <div className="w-2 h-2 rounded-full bg-pink-400" />
        Sketch Mode
      </div>
    </header>
  )
}
