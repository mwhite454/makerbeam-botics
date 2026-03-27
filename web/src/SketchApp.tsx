import { useEffect, useState, useCallback } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Group, Panel, Separator, usePanelRef } from 'react-resizable-panels'
import { SketchToolbar }      from '@/components/sketch/SketchToolbar'
import { SketchNodePalette }  from '@/components/sketch/SketchNodePalette'
import { SketchEditorPanel }  from '@/components/sketch/SketchEditorPanel'
import { SketchPreviewPanel } from '@/components/sketch/SketchPreviewPanel'
import { SketchCodePanel }    from '@/components/sketch/SketchCodePanel'
import { SketchTabBar }       from '@/components/sketch/SketchTabBar'
import { ParametersPanel }    from '@/components/panels/ParametersPanel'
import { useSketchCodegen }   from '@/hooks/useSketchCodegen'
import { useSketchStore }     from '@/store/sketchStore'

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

function SketchAppInner() {
  useSketchCodegen()

  const paletteRef = usePanelRef()
  const previewRef = usePanelRef()
  const codeRef    = usePanelRef()

  const [paletteCollapsed, setPaletteCollapsed] = useState(false)
  const [previewCollapsed, setPreviewCollapsed] = useState(false)
  const [codeCollapsed, setCodeCollapsed]       = useState(false)
  const [showParametersPanel, setShowParametersPanel] = useState(false)

  const codePanelOpen  = useSketchStore((s) => s.codePanelOpen)
  const setCodePanelOpen = useSketchStore((s) => s.setCodePanelOpen)

  useEffect(() => {
    const panel = codeRef.current
    if (!panel) return
    if (codePanelOpen && panel.isCollapsed()) {
      panel.expand()
    } else if (!codePanelOpen && !panel.isCollapsed()) {
      panel.collapse()
    }
  }, [codePanelOpen])

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
      <SketchToolbar />

      <Group orientation="vertical" className="flex-1">
        <Panel defaultSize="75%" minSize="30%">
          <Group orientation="horizontal" className="h-full">
            {/* Left palette */}
            <Panel
              panelRef={paletteRef}
              id="sketch-palette"
              defaultSize="12%"
              minSize="8%"
              collapsible
              collapsedSize="0%"
              onResize={onPaletteResize}
            >
              {paletteCollapsed ? (
                <CollapsedSideLabel label="Nodes" onClick={() => paletteRef.current?.expand()} />
              ) : (
                <SketchNodePalette />
              )}
            </Panel>

            <Separator className="separator-h" />

            {/* Center: canvas / shared parameters */}
            <Panel id="sketch-editor" defaultSize="58%" minSize="20%">
              <div className="flex flex-col h-full overflow-hidden">
                {showParametersPanel ? <ParametersPanel /> : <SketchEditorPanel />}
                <SketchTabBar
                  showParameters={showParametersPanel}
                  onToggleParameters={setShowParametersPanel}
                />
              </div>
            </Panel>

            <Separator className="separator-h" />

            {/* Right preview */}
            <Panel
              panelRef={previewRef}
              id="sketch-preview"
              defaultSize="30%"
              minSize="12%"
              collapsible
              collapsedSize="0%"
              onResize={onPreviewResize}
            >
              {previewCollapsed ? (
                <CollapsedSideLabel label="Preview" onClick={() => previewRef.current?.expand()} />
              ) : (
                <SketchPreviewPanel />
              )}
            </Panel>
          </Group>
        </Panel>

        <Separator className="separator-v" />

        {/* Bottom code panel */}
        <Panel
          panelRef={codeRef}
          id="sketch-code"
          defaultSize="25%"
          minSize="10%"
          collapsible
          collapsedSize="0%"
          onResize={onCodeResize}
        >
          {codeCollapsed ? (
            <CollapsedBottomLabel label="Generated Maker.js" onClick={() => codeRef.current?.expand()} />
          ) : (
            <SketchCodePanel />
          )}
        </Panel>
      </Group>
    </div>
  )
}

export default function SketchApp() {
  return (
    <ReactFlowProvider>
      <SketchAppInner />
    </ReactFlowProvider>
  )
}
