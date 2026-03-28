import { useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type ReactFlowInstance,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useEditorStore } from '@/store/editorStore'
import hitTest from '@/utils/hitTest'
import { useSketchStore } from '@/store/sketchStore'
import { sketchNodeTypes } from '@/nodes/sketch'
import { SKETCH_PALETTE_ITEMS } from '@/types/sketchNodes'
import { DeletableEdge } from '@/components/DeletableEdge'
import { SearchBar } from '@/components/SearchBar'
import { AnchorOverlay } from '@/components/sketch/AnchorOverlay'

const edgeTypes = { default: DeletableEdge }

let sketchNodeIdCounter = 1

export function SketchEditorPanel() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useEditorStore()
  const updateNodeData = useEditorStore((s) => s.updateNodeData)
  const groupSelectedNodes = useEditorStore((s) => s.groupSelectedNodes)
  const rfInstance = useRef<ReactFlowInstance | null>(null)

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const nodeType = event.dataTransfer.getData('application/reactflow-nodetype')
      if (!nodeType || !rfInstance.current) return

      const paletteItem = SKETCH_PALETTE_ITEMS.find((p) => p.type === nodeType)
      if (!paletteItem) return

      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `${nodeType}-${sketchNodeIdCounter++}`,
        type: nodeType,
        position,
        data: { ...paletteItem.defaultData },
      }

      addNode(newNode)
    },
    [addNode]
  )

  const addAnchorMode = useSketchStore((s) => s.addAnchorMode)
  const toggleAddAnchorMode = useSketchStore((s) => s.toggleAddAnchorMode)
  const updateSketchNode = useEditorStore((s) => s.updateNodeData)
  const nodesState = useEditorStore((s) => s.nodes)
  const dragRef = useRef<{ nodeId: string; anchorIndex: number } | null>(null)

  const onPaneClick = useCallback((event: any) => {
    if (!rfInstance.current) return
    const nodes = useEditorStore.getState().nodes
    const sel = nodes.find((n) => n.selected && n.type === 'sketch_path')
    if (!sel) return
    const flowPos = rfInstance.current.screenToFlowPosition({ x: event.clientX, y: event.clientY })
    try {
      const data = sel.data as Record<string, unknown>
      const anchors = JSON.parse(String(data.anchorsJson || '[]')) as Array<{ pos: [number, number] }>
      if (addAnchorMode) {
        if (anchors.length >= 2) {
          const pts = anchors.map((a) => a.pos)
          const segIdx = hitTest.nearestSegmentIndex(pts as any, flowPos.x, flowPos.y)
          const insertAt = segIdx >= 0 ? segIdx + 1 : anchors.length
          ;(anchors as any).splice(insertAt, 0, { id: `a${Date.now()}`, pos: [flowPos.x, flowPos.y] })
        } else {
          ;(anchors as any).push({ id: `a${Date.now()}`, pos: [flowPos.x, flowPos.y] })
        }
        updateSketchNode(sel.id, { anchorsJson: JSON.stringify(anchors) })
        return
      }

      // Not in add mode: check for anchor hit to start drag
      if (anchors.length > 0) {
        const pts = anchors.map((a) => a.pos)
        const idx = hitTest.nearestAnchorIndex(pts as any, flowPos.x, flowPos.y, 6)
        if (idx >= 0) {
          dragRef.current = { nodeId: sel.id, anchorIndex: idx }
          const onMove = (ev: MouseEvent) => {
            const fp = rfInstance.current!.screenToFlowPosition({ x: ev.clientX, y: ev.clientY })
            const st = useEditorStore.getState()
            const node = st.nodes.find((n) => n.id === sel.id)
            if (!node) return
            try {
              const a = JSON.parse(String(node.data.anchorsJson || '[]')) as Array<{ pos: [number, number] }>
              a[idx].pos = [fp.x, fp.y]
              useEditorStore.setState((s) => { const n = s.nodes.find((x) => x.id === sel.id); if (n) Object.assign(n.data, { anchorsJson: JSON.stringify(a) }) })
            } catch {}
          }
          const onUp = () => {
            dragRef.current = null
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
          }
          window.addEventListener('mousemove', onMove)
          window.addEventListener('mouseup', onUp)
        }
      }
    } catch (err) {
      console.error('[onPaneClick] failed to handle click', err)
    }
  }, [addAnchorMode, updateSketchNode])

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
      event.preventDefault()
      groupSelectedNodes()
    }
  }, [groupSelectedNodes])

  return (
    <div className="flex-1 relative bg-gray-950" style={{ cursor: addAnchorMode ? 'crosshair' : undefined }}>
      <SearchBar
        nodes={nodes}
        updateNodeData={updateNodeData as (id: string, data: Record<string, unknown>) => void}
        rfInstance={rfInstance}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={sketchNodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => { rfInstance.current = instance }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onKeyDown={onKeyDown}
        onPaneClick={(e) => onPaneClick(e as unknown as MouseEvent)}
        fitView
        deleteKeyCode={['Delete', 'Backspace']}
        edgesFocusable
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        className="bg-gray-950"
        defaultEdgeOptions={{
          type: 'default',
          selectable: true,
          focusable: true,
          style: { stroke: '#f472b6', strokeWidth: 2 },
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <AnchorOverlay />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#374151"
        />
        <Controls
          className="!bg-gray-900 !border-gray-700 [&_button]:!bg-gray-800 [&_button]:!border-gray-700 [&_button]:!text-gray-300 [&_button:hover]:!bg-gray-700"
        />
        <MiniMap
          className="!bg-gray-900 !border-gray-700"
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              sketch_rectangle: '#db2777',
              sketch_circle:    '#db2777',
              sketch_ngon:      '#db2777',
              sketch_line:      '#db2777',
              sketch_arc:       '#db2777',
              sketch_ellipse:   '#db2777',
              sketch_union:     '#dc2626',
              sketch_difference:'#dc2626',
              sketch_intersect: '#dc2626',
              sketch_translate: '#f97316',
              sketch_rotate:    '#f97316',
              sketch_scale:     '#f97316',
              sketch_mirror:    '#f97316',
              sketch_offset:    '#0d9488',
            }
            return colors[node.type ?? ''] ?? '#6b7280'
          }}
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>

      {/* Empty state hint */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="text-center text-gray-600">
            <div className="text-4xl mb-3">✏️</div>
            <p className="text-sm font-medium text-gray-500">Drag sketch nodes from the palette</p>
            <p className="text-xs text-gray-600 mt-1">Connect nodes to build 2D Maker.js geometry</p>
          </div>
        </div>
      )}
    </div>
  )
}
