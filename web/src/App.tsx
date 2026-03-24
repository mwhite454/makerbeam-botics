import { ReactFlowProvider } from '@xyflow/react'
import { Toolbar }     from './components/toolbar/Toolbar'
import { NodePalette } from './components/toolbar/NodePalette'
import { EditorPanel } from './components/panels/EditorPanel'
import { PreviewPanel } from './components/panels/PreviewPanel'
import { CodePanel }   from './components/panels/CodePanel'
import { useCodegen }  from './hooks/useCodegen'
import { useAutoRender } from './hooks/useAutoRender'

function AppInner() {
  useCodegen()
  const { doRender } = useAutoRender()

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Top toolbar */}
      <Toolbar onRender={doRender} />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left palette */}
        <NodePalette />

        {/* Canvas */}
        <EditorPanel />

        {/* Right preview */}
        <PreviewPanel />
      </div>

      {/* Bottom code panel */}
      <CodePanel />
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
