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

interface SketchEditorState {
  // ── React Flow state ────────────────────────────────────────────────────────
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  updateNodeData: (id: string, data: Partial<AllSketchNodeData>) => void
  addNode: (node: Node) => void

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
        } catch (err) {
          console.error('[sketchStore.importProject] Failed to parse:', err)
        }
      }),
  }))
)
