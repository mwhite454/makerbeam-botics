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

// ─── Tab/Module support ───────────────────────────────────────────────────────

export interface EditorTab {
  id: string
  label: string
  isModule: boolean        // If true, generates a module definition
  moduleName: string       // OpenSCAD module name (for module tabs)
  nodes: Node[]
  edges: Edge[]
}

function createTab(id: string, label: string, isModule = false): EditorTab {
  return {
    id,
    label,
    isModule,
    moduleName: isModule ? label.toLowerCase().replace(/[^a-z0-9_]/g, '_') : '',
    nodes: [],
    edges: [],
  }
}

interface EditorState {
  // ── Tab system ──────────────────────────────────────────────────────────────
  tabs: EditorTab[]
  activeTabId: string
  addTab: (label: string, isModule: boolean) => void
  removeTab: (id: string) => void
  renameTab: (id: string, label: string) => void
  setActiveTab: (id: string) => void

  // ── React Flow state (delegates to active tab) ─────────────────────────────
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  updateNodeData: (id: string, data: Partial<AllNodeData>) => void
  addNode: (node: Node) => void

  // ── Code generation ─────────────────────────────────────────────────────────
  generatedCode: string
  setGeneratedCode: (code: string) => void

  // ── Render state ────────────────────────────────────────────────────────────
  renderResultSTL: ArrayBuffer | null
  renderResultPNG: Uint8Array | null
  renderStatus: RenderStatus
  renderError: string | null
  renderLogs: string | null
  setRenderResultSTL: (buf: ArrayBuffer) => void
  setRenderResultPNG: (bytes: Uint8Array) => void
  setRenderStatus: (s: RenderStatus) => void
  setRenderError: (msg: string, logs?: string) => void

  // ── UI state ────────────────────────────────────────────────────────────────
  codePanelOpen: boolean
  previewMode: PreviewMode
  autoRender: boolean
  autoColorPreview: boolean
  toggleCodePanel: () => void
  setCodePanelOpen: (open: boolean) => void
  setPreviewMode: (m: PreviewMode) => void
  setAutoRender: (v: boolean) => void
  setAutoColorPreview: (v: boolean) => void

  // ── Save/load ───────────────────────────────────────────────────────────────
  exportProject: () => string
  importProject: (json: string) => void
}

const DEFAULT_TAB = createTab('main', 'Main')

export const useEditorStore = create<EditorState>()(
  immer((set, get) => {
    // Helper: get the active tab from draft state
    function getActiveTab(state: { tabs: EditorTab[]; activeTabId: string }) {
      return state.tabs.find((t) => t.id === state.activeTabId)!
    }

    return {
      // ── Tab system ────────────────────────────────────────────────────────────
      tabs: [DEFAULT_TAB],
      activeTabId: 'main',

      addTab: (label, isModule) =>
        set((state) => {
          const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
          state.tabs.push(createTab(id, label, isModule))
          state.activeTabId = id
          state.nodes = []
          state.edges = []
        }),

      removeTab: (id) =>
        set((state) => {
          if (state.tabs.length <= 1) return  // can't remove last tab
          if (id === 'main') return            // can't remove main tab
          const idx = state.tabs.findIndex((t) => t.id === id)
          if (idx === -1) return
          state.tabs.splice(idx, 1)
          if (state.activeTabId === id) {
            state.activeTabId = state.tabs[0].id
            const tab = getActiveTab(state)
            state.nodes = tab.nodes
            state.edges = tab.edges
          }
        }),

      renameTab: (id, label) =>
        set((state) => {
          const tab = state.tabs.find((t) => t.id === id)
          if (tab) {
            tab.label = label
            if (tab.isModule) {
              tab.moduleName = label.toLowerCase().replace(/[^a-z0-9_]/g, '_')
            }
          }
        }),

      setActiveTab: (id) =>
        set((state) => {
          // Save current tab's state
          const current = getActiveTab(state)
          if (current) {
            current.nodes = state.nodes as Node[]
            current.edges = state.edges as Edge[]
          }
          // Switch to new tab
          state.activeTabId = id
          const next = state.tabs.find((t) => t.id === id)
          if (next) {
            state.nodes = next.nodes
            state.edges = next.edges
          }
        }),

      // ── React Flow (active tab) ──────────────────────────────────────────────
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

      // ── Render state ────────────────────────────────────────────────────────
      renderResultSTL: null,
      renderResultPNG: null,
      renderStatus: 'idle',
      renderError: null,
      renderLogs: null,

      setRenderResultSTL: (buf) =>
        set((state) => {
          state.renderResultSTL = buf
          state.renderStatus = 'done'
          state.renderError = null
          state.renderLogs = null
        }),

      setRenderResultPNG: (bytes) =>
        set((state) => {
          state.renderResultPNG = bytes
          state.renderStatus = 'done'
          state.renderError = null
          state.renderLogs = null
        }),

      setRenderStatus: (s) => set((state) => { state.renderStatus = s }),

      setRenderError: (msg, logs) =>
        set((state) => {
          state.renderError = msg
          state.renderLogs = logs ?? null
          state.renderStatus = 'error'
        }),

      // ── UI state ────────────────────────────────────────────────────────────
      codePanelOpen: true,
      previewMode: 'png',
      autoRender: true,
      autoColorPreview: true,

      toggleCodePanel: () => set((state) => { state.codePanelOpen = !state.codePanelOpen }),
      setCodePanelOpen: (open) => set((state) => { state.codePanelOpen = open }),
      setPreviewMode: (m) => set((state) => { state.previewMode = m }),
      setAutoRender: (v) => set((state) => { state.autoRender = v }),
      setAutoColorPreview: (v) => set((state) => { state.autoColorPreview = v }),

      // ── Save / load ─────────────────────────────────────────────────────────
      exportProject: () => {
        const state = get()
        // Save current tab's nodes first
        const tabs = state.tabs.map((tab) => {
          if (tab.id === state.activeTabId) {
            return { ...tab, nodes: state.nodes, edges: state.edges }
          }
          return tab
        })
        return JSON.stringify({ version: 1, tabs, activeTabId: state.activeTabId }, null, 2)
      },

      importProject: (json) =>
        set((state) => {
          try {
            const data = JSON.parse(json)
            if (data.version !== 1 || !Array.isArray(data.tabs)) {
              throw new Error('Invalid project format')
            }
            state.tabs = data.tabs
            state.activeTabId = data.activeTabId || data.tabs[0].id
            const active = state.tabs.find((t) => t.id === state.activeTabId)
            if (active) {
              state.nodes = active.nodes
              state.edges = active.edges
            }
          } catch (err) {
            console.error('[importProject] Failed to parse:', err)
          }
        }),
    }
  })
)
