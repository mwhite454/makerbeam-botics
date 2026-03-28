import { useRef, useEffect, useState } from 'react'
import * as makerjs from 'makerjs'
import { useEditorStore } from '@/store/editorStore'
import { buildSketchModel, generateSketchSvg } from '@/codegen/sketchCodegen'

type SketchFormat = 'svg' | 'dxf'

interface SketchModalState {
  format: SketchFormat
  selectedTabId: string
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function SketchExportModal({
  state,
  onClose,
}: {
  state: SketchModalState
  onClose: () => void
}) {
  const tabs = useEditorStore((s) => s.tabs)
  const globalParameters = useEditorStore((s) => s.globalParameters)
  const sketchTabs = tabs.filter((t) => t.tabType === 'sketch')

  const [selectedTabId, setSelectedTabId] = useState(state.selectedTabId)

  const handleExport = () => {
    const tab = useEditorStore.getState().tabs.find((t) => t.id === selectedTabId)
    if (!tab) return
    const { globalParameters: gp, importedFiles } = useEditorStore.getState()
    const model = buildSketchModel(tab.nodes, tab.edges, gp, importedFiles)
    if (!model) {
      alert('Nothing to export in this sketch.')
      return
    }
    if (state.format === 'svg') {
      const svg = generateSketchSvg(model)
      downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${tab.label || 'sketch'}.svg`)
    } else {
      const dxf = makerjs.exporter.toDXF(model)
      downloadBlob(new Blob([dxf], { type: 'application/dxf' }), `${tab.label || 'sketch'}.dxf`)
    }
    onClose()
  }

  const formatLabel = state.format.toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-gray-900 border border-white/10 rounded-lg shadow-2xl w-80 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-semibold text-white mb-4">Export as {formatLabel}</h2>

        {sketchTabs.length === 0 ? (
          <p className="text-xs text-gray-400 mb-4">No sketch tabs found. Add a sketch tab first.</p>
        ) : (
          <label className="flex flex-col gap-1 mb-4">
            <span className="text-[11px] text-gray-400">Sketch</span>
            <select
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
              value={selectedTabId}
              onChange={(e) => setSelectedTabId(e.target.value)}
            >
              {sketchTabs.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </label>
        )}

        <div className="flex justify-end gap-2">
          <button
            className="text-[11px] px-3 py-1.5 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="text-[11px] px-3 py-1.5 rounded bg-pink-600 text-white hover:bg-pink-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleExport}
            disabled={sketchTabs.length === 0 || !selectedTabId}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  )
}

export function ExportDropdown() {
  const [open, setOpen] = useState(false)
  const [sketchModal, setSketchModal] = useState<SketchModalState | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const openSketchModal = (format: SketchFormat) => {
    setOpen(false)
    const sketchTabs = tabs.filter((t) => t.tabType === 'sketch')
    // Preselect: active tab if it's a sketch, else first sketch tab
    const activeTab = tabs.find((t) => t.id === activeTabId)
    const preselect =
      activeTab?.tabType === 'sketch'
        ? activeTabId
        : sketchTabs[0]?.id ?? ''
    setSketchModal({ format, selectedTabId: preselect })
  }

  const handleSTL = () => {
    setOpen(false)
    const { renderResultSTL } = useEditorStore.getState()
    if (!renderResultSTL) {
      alert('No render result yet. Click Render first.')
      return
    }
    downloadBlob(new Blob([renderResultSTL], { type: 'application/octet-stream' }), 'model.stl')
  }

  const handleOFF = () => {
    setOpen(false)
    const { renderResultOFF } = useEditorStore.getState()
    if (!renderResultOFF) {
      alert('No render result yet. Click Render first.')
      return
    }
    downloadBlob(new Blob([renderResultOFF], { type: 'application/octet-stream' }), 'model.off')
  }

  const handleCSV = () => {
    setOpen(false)
    const { globalParameters } = useEditorStore.getState()
    const rows = ['name,dataType,value', ...globalParameters.map((p) =>
      [p.name, p.dataType, p.value].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
    )]
    downloadBlob(new Blob([rows.join('\n')], { type: 'text/csv' }), 'parameters.csv')
  }

  const menuItems: { label: string; onClick: () => void; section?: 'sketch' | '3d' | 'data' }[] = [
    { label: 'SVG', onClick: () => openSketchModal('svg'), section: 'sketch' },
    { label: 'DXF', onClick: () => openSketchModal('dxf'), section: 'sketch' },
    { label: 'STL', onClick: handleSTL, section: '3d' },
    { label: 'OFF', onClick: handleOFF, section: '3d' },
    { label: 'CSV (Parameters)', onClick: handleCSV, section: 'data' },
  ]

  return (
    <>
      <div ref={dropdownRef} className="relative">
        <button
          className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800 flex items-center gap-1"
          onClick={() => setOpen((v) => !v)}
          title="Export"
        >
          Export
          <span className="text-[9px] opacity-60">▾</span>
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-gray-900 border border-white/10 rounded-lg shadow-2xl py-1 min-w-[160px]">
            <div className="px-2 py-0.5 text-[9px] text-gray-500 uppercase tracking-widest">2D Sketch</div>
            {menuItems.filter((m) => m.section === 'sketch').map((m) => (
              <button
                key={m.label}
                className="w-full text-left px-3 py-1.5 text-[11px] text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                onClick={m.onClick}
              >
                {m.label}
              </button>
            ))}
            <div className="border-t border-white/5 my-1" />
            <div className="px-2 py-0.5 text-[9px] text-gray-500 uppercase tracking-widest">3D Model</div>
            {menuItems.filter((m) => m.section === '3d').map((m) => (
              <button
                key={m.label}
                className="w-full text-left px-3 py-1.5 text-[11px] text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                onClick={m.onClick}
              >
                {m.label}
              </button>
            ))}
            <div className="border-t border-white/5 my-1" />
            <div className="px-2 py-0.5 text-[9px] text-gray-500 uppercase tracking-widest">Data</div>
            {menuItems.filter((m) => m.section === 'data').map((m) => (
              <button
                key={m.label}
                className="w-full text-left px-3 py-1.5 text-[11px] text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                onClick={m.onClick}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {sketchModal && (
        <SketchExportModal
          state={sketchModal}
          onClose={() => setSketchModal(null)}
        />
      )}
    </>
  )
}
