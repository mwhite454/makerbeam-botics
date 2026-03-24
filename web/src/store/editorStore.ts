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
import { AllNodeData } from '@/types/nodes'

export type RenderStatus = 'idle' | 'rendering' | 'done' | 'error'
export type PreviewMode  = 'stl' | 'png'

interface EditorState {
  // React Flow state
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  updateNodeData: (id: string, data: Partial<AllNodeData>) => void
  addNode: (node: Node) => void

  // Code generation
  generatedCode: string
  setGeneratedCode: (code: string) => void

  // Render state
  renderResultSTL: ArrayBuffer | null
  renderResultPNG: Uint8Array | null
  renderStatus: RenderStatus
  renderError: string | null
  setRenderResultSTL: (buf: ArrayBuffer) => void
  setRenderResultPNG: (bytes: Uint8Array) => void
  setRenderStatus: (s: RenderStatus) => void
  setRenderError: (msg: string) => void

  // UI state
  codePanelOpen: boolean
  previewMode: PreviewMode
  autoRender: boolean
  toggleCodePanel: () => void
  setPreviewMode: (m: PreviewMode) => void
  setAutoRender: (v: boolean) => void
}

export const useEditorStore = create<EditorState>()(
  immer((set) => ({
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

    generatedCode: '',
    setGeneratedCode: (code) => set((state) => { state.generatedCode = code }),

    renderResultSTL: null,
    renderResultPNG: null,
    renderStatus: 'idle',
    renderError: null,

    setRenderResultSTL: (buf) =>
      set((state) => {
        state.renderResultSTL = buf
        state.renderStatus = 'done'
        state.renderError = null
      }),

    setRenderResultPNG: (bytes) =>
      set((state) => {
        state.renderResultPNG = bytes
        state.renderStatus = 'done'
        state.renderError = null
      }),

    setRenderStatus: (s) => set((state) => { state.renderStatus = s }),
    setRenderError: (msg) =>
      set((state) => {
        state.renderError = msg
        state.renderStatus = 'error'
      }),

    codePanelOpen: true,
    previewMode: 'stl',
    autoRender: true,

    toggleCodePanel: () => set((state) => { state.codePanelOpen = !state.codePanelOpen }),
    setPreviewMode: (m) => set((state) => { state.previewMode = m }),
    setAutoRender: (v) => set((state) => { state.autoRender = v }),
  }))
)
