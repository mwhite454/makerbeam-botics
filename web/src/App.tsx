import { useEffect, useState, useCallback } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Group, Panel, Separator, usePanelRef } from 'react-resizable-panels'
import { Toolbar }      from './components/toolbar/Toolbar'
import { NodePalette }  from './components/toolbar/NodePalette'
import { EditorPanel }  from './components/panels/EditorPanel'
import { PreviewPanel } from './components/panels/PreviewPanel'
import { CodePanel }    from './components/panels/CodePanel'
import { TabBar }       from './components/panels/TabBar'
import { useCodegen }   from './hooks/useCodegen'
import { useAutoRender } from './hooks/useAutoRender'
import { useEditorStore } from './store/editorStore'

function CollapsedSideLabel({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-full w-full flex items-center justify-center bg-gray-900/80 hover:bg-gray-800/80 transition-colors cursor-pointer"
      title={`Expand ${label}`}
    >
      <span className="panel-collapsed-label text-[9px] font-bold text-gray-500 uppercase tracking-widest select-none">
        {label}
      </span>
    </button>
  )
}

function CollapsedBottomLabel({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-full flex items-center justify-center bg-gray-950 hover:bg-gray-900 transition-colors cursor-pointer"
      title={`Expand ${label}`}
    >
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest select-none">
        {label}
      </span>
    </button>
  )
}

function AppInner() {
  useCodegen()
  const { doRender } = useAutoRender()

  const paletteRef = usePanelRef()
  const previewRef = usePanelRef()
  const codeRef    = usePanelRef()

  const [paletteCollapsed, setPaletteCollapsed] = useState(false)
  const [previewCollapsed, setPreviewCollapsed] = useState(false)
  const [codeCollapsed, setCodeCollapsed]       = useState(false)

  const codePanelOpen  = useEditorStore((s) => s.codePanelOpen)
  const setCodePanelOpen = useEditorStore((s) => s.setCodePanelOpen)

  // Sync store → panel when the toolbar toggle is clicked
  useEffect(() => {
    const panel = codeRef.current
    if (!panel) return
    if (codePanelOpen && panel.isCollapsed()) {
      panel.expand()
    } else if (!codePanelOpen && !panel.isCollapsed()) {
      panel.collapse()
    }
  }, [codePanelOpen])

  // Track collapsed states via onResize callbacks
  const onPaletteResize = useCallback(() => {
    setPaletteCollapsed(paletteRef.current?.isCollapsed() ?? false)
  }, [])

  const onPreviewResize = useCallback(() => {
    setPreviewCollapsed(previewRef.current?.isCollapsed() ?? false)
  }, [])

  const onCodeResize = useCallback(() => {
    const collapsed = codeRef.current?.isCollapsed() ?? false
    setCodeCollapsed(collapsed)
    setCodePanelOpen(!collapsed)
  }, [setCodePanelOpen])

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Top toolbar — fixed */}
      <Toolbar onRender={doRender} />

      {/* Everything below the toolbar is resizable */}
      <Group orientation="vertical" className="flex-1">
        {/* ── Main area (palette + editor + preview) ── */}
        <Panel defaultSize="75%" minSize="30%">
          <Group orientation="horizontal" className="h-full">
            {/* Left palette */}
            <Panel
              panelRef={paletteRef}
              id="palette"
              defaultSize="12%"
              minSize="8%"
              collapsible
              collapsedSize="0%"
              onResize={onPaletteResize}
            >
              {paletteCollapsed ? (
                <CollapsedSideLabel label="Nodes" onClick={() => paletteRef.current?.expand()} />
              ) : (
                <NodePalette />
              )}
            </Panel>

            <Separator className="separator-h" />

            {/* Center: canvas + tab bar */}
            <Panel id="editor" defaultSize="58%" minSize="20%">
              <div className="flex flex-col h-full overflow-hidden">
                <EditorPanel />
                <TabBar />
              </div>
            </Panel>

            <Separator className="separator-h" />

            {/* Right preview */}
            <Panel
              panelRef={previewRef}
              id="preview"
              defaultSize="30%"
              minSize="12%"
              collapsible
              collapsedSize="0%"
              onResize={onPreviewResize}
            >
              {previewCollapsed ? (
                <CollapsedSideLabel label="Preview" onClick={() => previewRef.current?.expand()} />
              ) : (
                <PreviewPanel />
              )}
            </Panel>
          </Group>
        </Panel>

        <Separator className="separator-v" />

        {/* ── Bottom code panel ── */}
        <Panel
          panelRef={codeRef}
          id="code"
          defaultSize="25%"
          minSize="10%"
          collapsible
          collapsedSize="0%"
          onResize={onCodeResize}
        >
          {codeCollapsed ? (
            <CollapsedBottomLabel label="Generated OpenSCAD" onClick={() => codeRef.current?.expand()} />
          ) : (
            <CodePanel />
          )}
        </Panel>
      </Group>
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  )
}
