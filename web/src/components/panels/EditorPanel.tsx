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

import { useEditorStore }    from '@/store/editorStore'
import { nodeTypes }         from '@/nodes'
import { PALETTE_ITEMS }     from '@/types/nodes'
import { DeletableEdge }     from '@/components/DeletableEdge'

const edgeTypes = { default: DeletableEdge }

let nodeIdCounter = 1

export function EditorPanel() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useEditorStore()
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

      const paletteItem = PALETTE_ITEMS.find((p) => p.type === nodeType)
      if (!paletteItem) return

      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `${nodeType}-${nodeIdCounter++}`,
        type: nodeType,
        position,
        data: { ...paletteItem.defaultData },
      }

      addNode(newNode)
    },
    [addNode]
  )

  // Keyboard handler for node/edge deletion
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // Don't delete if an input is focused
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return
      }
      // ReactFlow handles this via onNodesChange/onEdgesChange with remove changes
    }
  }, [])

  return (
    <div className="flex-1 relative bg-gray-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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
          style: { stroke: '#60a5fa', strokeWidth: 2 },
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
              sphere: '#2563eb', cube: '#2563eb', cylinder: '#2563eb', polyhedron: '#2563eb',
              circle: '#0891b2', square: '#0891b2', polygon: '#0891b2', scadtext: '#0891b2',
              translate: '#f97316', rotate: '#f97316', scale: '#f97316', mirror: '#f97316',
              resize: '#f97316', multmatrix: '#f97316', offset: '#f97316',
              union: '#dc2626', difference: '#dc2626', intersection: '#dc2626',
              linear_extrude: '#9333ea', rotate_extrude: '#9333ea',
              hull: '#16a34a', minkowski: '#16a34a', color: '#16a34a', projection: '#16a34a',
              makerbeam: '#eab308',
              for_loop: '#f97316', if_cond: '#f97316', render_node: '#16a34a',
              import_stl: '#6b7280', surface_node: '#6b7280',
              echo_node: '#6b7280', var_node: '#6b7280',
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
            <div className="text-4xl mb-3">⬡</div>
            <p className="text-sm font-medium text-gray-500">Drag nodes from the palette</p>
            <p className="text-xs text-gray-600 mt-1">Connect nodes to build OpenSCAD geometry</p>
            <p className="text-xs text-gray-600 mt-1">Select nodes and press Delete to remove them</p>
          </div>
        </div>
      )}
    </div>
  )
}
