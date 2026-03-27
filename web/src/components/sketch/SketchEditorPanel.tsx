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

import { useSketchStore } from '@/store/sketchStore'
import { sketchNodeTypes } from '@/nodes/sketch'
import { SKETCH_PALETTE_ITEMS } from '@/types/sketchNodes'
import { DeletableEdge } from '@/components/DeletableEdge'
import { SearchBar } from '@/components/SearchBar'

const edgeTypes = { default: DeletableEdge }

let sketchNodeIdCounter = 1

export function SketchEditorPanel() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useSketchStore()
  const updateNodeData = useSketchStore((s) => s.updateNodeData)
  const groupSelectedNodes = useSketchStore((s) => s.groupSelectedNodes)
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

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
      event.preventDefault()
      groupSelectedNodes()
    }
  }, [groupSelectedNodes])

  return (
    <div className="flex-1 relative bg-gray-950">
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
