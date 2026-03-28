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
import type { AllSketchNodeData } from '@/types/sketchNodes'

export type RenderStatus = 'idle' | 'rendering' | 'done' | 'error'
export type PreviewMode  = 'off' | 'stl' | 'png'

// ─── Global Parameters ────────────────────────────────────────────────────────

export type GlobalParamType = 'number' | 'string' | 'boolean' | 'vector2' | 'vector3' | 'expression'

export interface GlobalParameter {
  id: string
  name: string
  dataType: GlobalParamType
  value: string
}

// ─── Tab/Module/Sketch support ────────────────────────────────────────────────

export type TabType = 'main' | 'module' | 'tab' | 'sketch' | 'loop'

export interface EditorTab {
  id: string
  label: string
  tabType: TabType
  isModule: boolean        // true for 'module' and 'loop' tabs
  moduleName: string       // OpenSCAD module name (for module/loop tabs)
  sketchName: string       // Sketch identifier (for sketch tabs)
  nodes: Node[]
  edges: Edge[]
}

function createTab(id: string, label: string, tabType: TabType = 'main'): EditorTab {
  const sanitized = label.toLowerCase().replace(/[^a-z0-9_]/g, '_')
  return {
    id,
    label,
    tabType,
    isModule: tabType === 'module' || tabType === 'loop',
    moduleName: (tabType === 'module' || tabType === 'loop') ? sanitized : '',
    sketchName: tabType === 'sketch' ? sanitized : '',
    nodes: [],
    edges: [],
  }
}

interface EditorState {
  // ── Tab system ──────────────────────────────────────────────────────────────
  tabs: EditorTab[]
  activeTabId: string
  addTab: (label: string, tabType: TabType) => string
  removeTab: (id: string) => void
  renameTab: (id: string, label: string) => void
  setActiveTab: (id: string) => void
  getActiveTab: () => EditorTab | undefined

  // ── React Flow state (delegates to active tab) ─────────────────────────────
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  updateNodeData: (id: string, data: Partial<AllNodeData> | Partial<AllSketchNodeData>) => void
  updateNodeDataInTab: (tabId: string, nodeId: string, data: Record<string, unknown>) => void
  propagateForLoopVarName: (forLoopNodeId: string, newVarName: string) => void
  addNode: (node: Node) => void

  // ── Node Wrangler (grouping) ───────────────────────────────────────────────
  groupSelectedNodes: () => void
  ungroupNodes: (groupId: string) => void

  // ── Code generation ─────────────────────────────────────────────────────────
  generatedCode: string
  setGeneratedCode: (code: string) => void

  // ── Render state ────────────────────────────────────────────────────────────
  renderResultSTL: ArrayBuffer | null
  renderResultPNG: Uint8Array | null
  renderResultOFF: ArrayBuffer | null
  renderStatus: RenderStatus
  renderError: string | null
  renderLogs: string | null
  setRenderResultSTL: (buf: ArrayBuffer) => void
  setRenderResultPNG: (bytes: Uint8Array) => void
  setRenderResultOFF: (buf: ArrayBuffer) => void
  setRenderStatus: (s: RenderStatus) => void
  setRenderError: (msg: string, logs?: string) => void

  // ── Global Parameters ────────────────────────────────────────────────────────
  globalParameters: GlobalParameter[]
  addGlobalParameter: () => void
  updateGlobalParameter: (id: string, patch: Partial<Omit<GlobalParameter, 'id'>>) => void
  removeGlobalParameter: (id: string) => void

  // ── UI state ────────────────────────────────────────────────────────────────
  codePanelOpen: boolean
  showParametersPanel: boolean
  previewMode: PreviewMode
  autoRender: boolean
  toggleCodePanel: () => void
  setCodePanelOpen: (open: boolean) => void
  setShowParametersPanel: (v: boolean) => void
  setPreviewMode: (m: PreviewMode) => void
  setAutoRender: (v: boolean) => void

  // ── Sketch state (for active sketch tab) ──────────────────────────────────
  sketchPreviewSvg: string
  setSketchPreviewSvg: (svg: string) => void
  sketchGeneratedCode: string
  setSketchGeneratedCode: (code: string) => void

  // ── Project identity ────────────────────────────────────────────────────────
  projectName: string
  setProjectName: (name: string) => void
  resetProject: () => void

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

      addTab: (label, tabType) => {
        const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        set((state) => {
          // Save current tab's nodes/edges before switching
          const current = getActiveTab(state)
          if (current) {
            current.nodes = state.nodes as Node[]
            current.edges = state.edges as Edge[]
          }
          state.tabs.push(createTab(id, label, tabType))
          state.activeTabId = id
          state.nodes = []
          state.edges = []
        })
        return id
      },

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
            const newSanitized = label.toLowerCase().replace(/[^a-z0-9_]/g, '_')
            tab.label = label

            if (tab.tabType === 'module' || tab.tabType === 'loop') {
              const oldModuleName = tab.moduleName
              tab.moduleName = newSanitized

              // Propagate rename to all module_call nodes across all tabs
              if (oldModuleName && oldModuleName !== newSanitized) {
                for (const t of state.tabs) {
                  for (const node of t.nodes) {
                    if (node.type === 'module_call' && (node.data as Record<string, unknown>).moduleName === oldModuleName) {
                      ;(node.data as Record<string, unknown>).moduleName = newSanitized
                    }
                  }
                }
                for (const node of state.nodes) {
                  if (node.type === 'module_call' && (node.data as Record<string, unknown>).moduleName === oldModuleName) {
                    ;(node.data as Record<string, unknown>).moduleName = newSanitized
                  }
                }
              }
            } else if (tab.tabType === 'sketch') {
              const oldSketchName = tab.sketchName
              tab.sketchName = newSanitized

              // Propagate rename to all sketch_profile nodes across all tabs
              if (oldSketchName && oldSketchName !== newSanitized) {
                for (const t of state.tabs) {
                  for (const node of t.nodes) {
                    if (node.type === 'sketch_profile' && (node.data as Record<string, unknown>).sketchName === oldSketchName) {
                      ;(node.data as Record<string, unknown>).sketchName = newSanitized
                    }
                  }
                }
                for (const node of state.nodes) {
                  if (node.type === 'sketch_profile' && (node.data as Record<string, unknown>).sketchName === oldSketchName) {
                    ;(node.data as Record<string, unknown>).sketchName = newSanitized
                  }
                }
              }
            }
          }
        }),

      getActiveTab: () => {
        const state = get()
        return state.tabs.find((t) => t.id === state.activeTabId)
      },

      setActiveTab: (id) =>
        set((state) => {
          // Save current tab's state
          const current = getActiveTab(state)
          if (current) {
            const snapshot = state.nodes.map(n => `${n.type}=${JSON.stringify(n.data)}`).join(' | ')
            console.log(`[Botics] tab-save "${current.label}": ${snapshot}`)
            current.nodes = state.nodes as Node[]
            current.edges = state.edges as Edge[]
          }
          // Switch to new tab
          state.activeTabId = id
          const next = state.tabs.find((t) => t.id === id)
          if (next) {
            state.nodes = next.nodes
            state.edges = next.edges
            const snapshot = next.nodes.map(n => `${n.type}=${JSON.stringify(n.data)}`).join(' | ')
            console.log(`[Botics] tab-load "${next.label}": ${snapshot}`)
          }
        }),

      // ── React Flow (active tab) ──────────────────────────────────────────────
      nodes: [],
      edges: [],

      onNodesChange: (changes) =>
        set((state) => {
          // Collect ForLoop nodes being removed so we can clean up their body tabs
          const removedBodyTabIds = changes
            .filter((c) => c.type === 'remove')
            .map((c) => state.nodes.find((n) => n.id === (c as { id: string }).id))
            .filter((n) => n?.type === 'for_loop')
            .map((n) => (n?.data as Record<string, unknown>)?.bodyTabId as string | undefined)
            .filter(Boolean) as string[]

          state.nodes = applyNodeChanges(changes, state.nodes) as Node[]

          // Remove orphaned loop body tabs
          for (const tabId of removedBodyTabIds) {
            const idx = state.tabs.findIndex((t) => t.id === tabId)
            if (idx === -1) continue
            state.tabs.splice(idx, 1)
            if (state.activeTabId === tabId) {
              state.activeTabId = state.tabs[0]?.id ?? 'main'
              const tab = state.tabs.find((t) => t.id === state.activeTabId)
              if (tab) { state.nodes = tab.nodes; state.edges = tab.edges }
            }
          }
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

      updateNodeDataInTab: (tabId, nodeId, data) =>
        set((state) => {
          const tab = state.tabs.find((t) => t.id === tabId)
          if (!tab) return
          const node = tab.nodes.find((n) => n.id === nodeId)
          if (node) Object.assign(node.data, data)
        }),

      propagateForLoopVarName: (forLoopNodeId, newVarName) =>
        set((state) => {
          // Update the for_loop node itself (it is on the active tab)
          const forLoopNode = state.nodes.find((n) => n.id === forLoopNodeId)
          if (forLoopNode) {
            ;(forLoopNode.data as Record<string, unknown>).varName = newVarName
            const bodyTabId = (forLoopNode.data as Record<string, unknown>).bodyTabId as string | undefined
            if (bodyTabId) {
              const bodyTab = state.tabs.find((t) => t.id === bodyTabId)
              if (bodyTab) {
                for (const n of bodyTab.nodes) {
                  if (n.type === 'loop_var') {
                    ;(n.data as Record<string, unknown>).varName = newVarName
                  }
                }
              }
              // Also update state.nodes in case the body tab is currently active
              if (state.activeTabId === bodyTabId) {
                for (const n of state.nodes) {
                  if (n.type === 'loop_var') {
                    ;(n.data as Record<string, unknown>).varName = newVarName
                  }
                }
              }
            }
          }
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

          // Insert group at beginning (renders behind)
          state.nodes.unshift(groupNode as Node)

          // Re-parent selected nodes
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
          // Reparent children back to absolute positions
          for (const n of state.nodes) {
            if (n.parentId === groupId) {
              n.parentId = undefined
              n.position = { x: n.position.x + groupPos.x, y: n.position.y + groupPos.y }
            }
          }
          // Remove the group node
          state.nodes = state.nodes.filter((n) => n.id !== groupId) as Node[]
        }),

      // ── Code generation ─────────────────────────────────────────────────────
      generatedCode: '',
      setGeneratedCode: (code) => set((state) => { state.generatedCode = code }),

      // ── Render state ────────────────────────────────────────────────────────
      renderResultSTL: null,
      renderResultPNG: null,
      renderResultOFF: null,
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

      setRenderResultOFF: (buf) =>
        set((state) => {
          state.renderResultOFF = buf
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
      showParametersPanel: false,
      previewMode: 'off',
      autoRender: true,

      toggleCodePanel: () => set((state) => { state.codePanelOpen = !state.codePanelOpen }),
      setCodePanelOpen: (open) => set((state) => { state.codePanelOpen = open }),
      setShowParametersPanel: (v) => set((state) => { state.showParametersPanel = v }),
      setPreviewMode: (m) => set((state) => { state.previewMode = m }),
      setAutoRender: (v) => set((state) => { state.autoRender = v }),

      // ── Sketch state ────────────────────────────────────────────────────────
      sketchPreviewSvg: '',
      setSketchPreviewSvg: (svg) => set((state) => { state.sketchPreviewSvg = svg }),
      sketchGeneratedCode: '',
      setSketchGeneratedCode: (code) => set((state) => { state.sketchGeneratedCode = code }),

      // ── Global Parameters ────────────────────────────────────────────────────
      globalParameters: [],

      addGlobalParameter: () =>
        set((state) => {
          state.globalParameters.push({
            id: `gp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: `PARAM_${state.globalParameters.length + 1}`,
            dataType: 'number',
            value: '0',
          })
        }),

      updateGlobalParameter: (id, patch) =>
        set((state) => {
          const p = state.globalParameters.find((p) => p.id === id)
          if (p) Object.assign(p, patch)
        }),

      removeGlobalParameter: (id) =>
        set((state) => {
          const idx = state.globalParameters.findIndex((p) => p.id === id)
          if (idx !== -1) state.globalParameters.splice(idx, 1)
        }),

      // ── Project identity ────────────────────────────────────────────────────
      projectName: '',

      setProjectName: (name) =>
        set((state) => { state.projectName = name }),

      resetProject: () =>
        set((state) => {
          const freshTab = createTab('main', 'Main')
          state.tabs = [freshTab]
          state.activeTabId = 'main'
          state.nodes = []
          state.edges = []
          state.globalParameters = []
          state.projectName = ''
        }),

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
        return JSON.stringify(
          { version: 1, projectName: state.projectName, tabs, activeTabId: state.activeTabId, globalParameters: state.globalParameters },
          null,
          2
        )
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
            state.globalParameters = Array.isArray(data.globalParameters) ? data.globalParameters : []
            state.projectName = typeof data.projectName === 'string' ? data.projectName : ''
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
