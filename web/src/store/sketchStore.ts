import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react'
import type { AllSketchNodeData } from '@/types/sketchNodes'
import { useEditorStore } from '@/store/editorStore'

interface SketchEditorState {
  // ── React Flow state ────────────────────────────────────────────────────────
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  updateNodeData: (id: string, data: Partial<AllSketchNodeData>) => void
  addNode: (node: Node) => void

  // ── Node Wrangler (grouping) ───────────────────────────────────────────────
  groupSelectedNodes: () => void
  ungroupNodes: (groupId: string) => void

  // ── Code generation ─────────────────────────────────────────────────────────
  generatedCode: string
  setGeneratedCode: (code: string) => void

  // ── Preview SVG ─────────────────────────────────────────────────────────────
  previewSvg: string
  setPreviewSvg: (svg: string) => void

  // ── UI state ────────────────────────────────────────────────────────────────
  codePanelOpen: boolean
  toggleCodePanel: () => void
  setCodePanelOpen: (open: boolean) => void

  // ── Save/load ───────────────────────────────────────────────────────────────
  exportProject: () => string
  importProject: (json: string) => void
}

export const useSketchStore = create<SketchEditorState>()(
  immer((set, get) => ({
    // ── React Flow state ────────────────────────────────────────────────────
    nodes: [],
    edges: [],

    onNodesChange: (changes) =>
      set((state) => {
        state.nodes = applyNodeChanges(changes, state.nodes) as Node[]
      }),

    onEdgesChange: (changes) =>
      set((state) => {
        state.edges = applyEdgeChanges(changes, state.edges) as Edge[]
      }),

    onConnect: (connection) =>
      set((state) => {
        state.edges = addEdge(connection, state.edges) as Edge[]
      }),

    updateNodeData: (id, data) =>
      set((state) => {
        const node = state.nodes.find((n) => n.id === id)
        if (node) Object.assign(node.data, data)
      }),

    addNode: (node) =>
      set((state) => {
        state.nodes.push(node)
      }),

    // ── Node Wrangler (grouping) ──────────────────────────────────────────
    groupSelectedNodes: () =>
      set((state) => {
        const selected = state.nodes.filter((n) => n.selected && n.type !== 'group_node')
        if (selected.length < 2) return

        const PADDING = 40
        const NODE_WIDTH = 220
        const NODE_HEIGHT = 150

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const n of selected) {
          minX = Math.min(minX, n.position.x)
          minY = Math.min(minY, n.position.y)
          maxX = Math.max(maxX, n.position.x + NODE_WIDTH)
          maxY = Math.max(maxY, n.position.y + NODE_HEIGHT)
        }

        const groupX = minX - PADDING
        const groupY = minY - PADDING
        const groupW = maxX - minX + 2 * PADDING
        const groupH = maxY - minY + 2 * PADDING

        const groupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const groupNode: Node = {
          id: groupId,
          type: 'group_node',
          position: { x: groupX, y: groupY },
          style: { width: groupW, height: groupH, zIndex: -1 },
          data: { label: '', notes: '', color: '#3b82f6', width: groupW, height: groupH },
        }

        state.nodes.unshift(groupNode as Node)

        for (const n of selected) {
          n.parentId = groupId
          n.position = { x: n.position.x - groupX, y: n.position.y - groupY }
          n.selected = false
        }
      }),

    ungroupNodes: (groupId) =>
      set((state) => {
        const groupNode = state.nodes.find((n) => n.id === groupId)
        if (!groupNode) return

        const groupPos = groupNode.position
        for (const n of state.nodes) {
          if (n.parentId === groupId) {
            n.parentId = undefined
            n.position = { x: n.position.x + groupPos.x, y: n.position.y + groupPos.y }
          }
        }
        state.nodes = state.nodes.filter((n) => n.id !== groupId) as Node[]
      }),

    // ── Code generation ─────────────────────────────────────────────────────
    generatedCode: '',
    setGeneratedCode: (code) => set((state) => { state.generatedCode = code }),

    // ── Preview SVG ─────────────────────────────────────────────────────────
    previewSvg: '',
    setPreviewSvg: (svg) => set((state) => { state.previewSvg = svg }),

    // ── UI state ────────────────────────────────────────────────────────────
    codePanelOpen: true,
    toggleCodePanel: () => set((state) => { state.codePanelOpen = !state.codePanelOpen }),
    setCodePanelOpen: (open) => set((state) => { state.codePanelOpen = open }),

    // ── Save / load ─────────────────────────────────────────────────────────
    exportProject: () => {
      const state = get()
      return JSON.stringify({
        version: 1,
        mode: 'sketch',
        nodes: state.nodes,
        edges: state.edges,
        globalParameters: useEditorStore.getState().globalParameters,
      }, null, 2)
    },

    importProject: (json) =>
      set((state) => {
        try {
          const data = JSON.parse(json)
          if (data.version !== 1 || data.mode !== 'sketch') {
            throw new Error('Invalid sketch project format')
          }
          state.nodes = data.nodes ?? []
          state.edges = data.edges ?? []
          if (Array.isArray(data.globalParameters)) {
            useEditorStore.setState({ globalParameters: data.globalParameters })
          }
        } catch (err) {
          console.error('[sketchStore.importProject] Failed to parse:', err)
        }
      }),
  }))
)
