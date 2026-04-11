import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'
import {
  generateCode,
  generateModuleCode,
  generateLoopBodyCode,
  generateLoopPreviewCode,
  generateModulePreviewCode,
  hasRenderableGeometry,
} from '@/codegen'

const DEBOUNCE_MS = 150

/** Node types that accept geometry on their in-0 handle (i.e. are "editor" loops). */
const GEOMETRY_INPUT_LOOP_TYPES = new Set([
  'for_loop',
  'geo_editor_loop',
])

export function useCodegen() {
  const nodes            = useEditorStore((s) => s.nodes)
  const edges            = useEditorStore((s) => s.edges)
  const tabs             = useEditorStore((s) => s.tabs)
  const activeTabId      = useEditorStore((s) => s.activeTabId)
  const globalParameters = useEditorStore((s) => s.globalParameters)
  const importedFiles    = useEditorStore((s) => s.importedFiles)
  const setGeneratedCode = useEditorStore((s) => s.setGeneratedCode)

  // F-002 preview state
  const loopPreviewMode  = useEditorStore((s) => s.loopPreviewMode)
  const loopPreviewValue = useEditorStore((s) => s.loopPreviewValue)
  const loopPreviewRange = useEditorStore((s) => s.loopPreviewRange)
  const modulePreviewArgs = useEditorStore((s) => s.modulePreviewArgs)
  const setPreviewHasGeometry = useEditorStore((s) => s.setPreviewHasGeometry)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const t0 = performance.now()
      const activeTab = tabs.find((t) => t.id === activeTabId)

      // ── F-002: Loop body tab preview ─────────────────────────────────────────
      if (activeTab?.tabType === 'loop') {
        if (!activeTab.parentTabId || !activeTab.parentNodeId) {
          // Legacy tab without parent refs — fall back to bare module definition
          // (old behaviour, no regression)
          let fallback = ''
          for (const tab of tabs) {
            const isActiveTab = tab.id === activeTabId
            const tabNodes = isActiveTab ? nodes : tab.nodes
            const tabEdges = isActiveTab ? edges : tab.edges
            if (tab.tabType === 'module') {
              const mc = generateModuleCode(tab.moduleName, tabNodes, tabEdges)
              if (mc.trim()) fallback += mc + '\n'
            } else if (tab.tabType === 'loop') {
              const lc = generateLoopBodyCode(tab.moduleName, tabNodes, tabEdges)
              if (lc.trim()) fallback += lc + '\n'
            }
          }
          setGeneratedCode(fallback)
          setPreviewHasGeometry(hasRenderableGeometry(fallback))
          return
        }

        // Find parent tab and node to determine geometry-input flag
        const parentTab = tabs.find((t) => t.id === activeTab.parentTabId)
        const parentTabNodes = parentTab?.id === activeTabId ? nodes : parentTab?.nodes ?? []
        const parentNode = parentTabNodes.find((n) => n.id === activeTab.parentNodeId)
        const hasGeometryInput = GEOMETRY_INPUT_LOOP_TYPES.has(parentNode?.type ?? '')

        // Use active tab's live nodes/edges (state.nodes/edges is the active tab)
        const previewCode = generateLoopPreviewCode({
          bodyTabModuleName: activeTab.moduleName,
          bodyTabNodes: nodes,
          bodyTabEdges: edges,
          parentTab: parentTab
            ? { ...parentTab, nodes: parentTabNodes, edges: parentTab.edges }
            : undefined,
          parentNodeId: activeTab.parentNodeId,
          hasGeometryInput,
          previewMode: loopPreviewMode,
          previewValue: loopPreviewValue,
          previewRange: loopPreviewRange,
          globalParameters,
          tabs,
          importedFiles,
        })

        setGeneratedCode(previewCode)
        setPreviewHasGeometry(hasRenderableGeometry(previewCode))
        console.log(
          `[Botics] loop-preview codegen: ${(performance.now() - t0).toFixed(1)}ms, ${previewCode.length} chars`,
        )
        return
      }

      // ── F-002: Module tab preview ─────────────────────────────────────────────
      if (activeTab?.tabType === 'module') {
        const previewCode = generateModulePreviewCode({
          moduleName: activeTab.moduleName,
          moduleTabNodes: nodes,
          moduleTabEdges: edges,
          argOverrides: modulePreviewArgs,
          globalParameters,
          tabs,
        })

        setGeneratedCode(previewCode)
        setPreviewHasGeometry(hasRenderableGeometry(previewCode))
        console.log(
          `[Botics] module-preview codegen: ${(performance.now() - t0).toFixed(1)}ms, ${previewCode.length} chars`,
        )
        return
      }

      // ── Standard codegen (main / sketch / other tabs) ─────────────────────────
      let fullCode = ''

      for (const tab of tabs) {
        const isActiveTab = tab.id === activeTabId
        const tabNodes = isActiveTab ? nodes : tab.nodes
        const tabEdges = isActiveTab ? edges : tab.edges

        if (tab.tabType === 'module') {
          const moduleCode = generateModuleCode(tab.moduleName, tabNodes, tabEdges)
          if (moduleCode.trim()) fullCode += moduleCode + '\n'
        } else if (tab.tabType === 'loop') {
          const loopCode = generateLoopBodyCode(tab.moduleName, tabNodes, tabEdges)
          if (loopCode.trim()) fullCode += loopCode + '\n'
        }
      }

      if (activeTab?.tabType === 'sketch') {
        // Sketch tabs don't emit OpenSCAD — handled by useSketchCodegen
      } else {
        // Main or regular tabs
        fullCode += generateCode(nodes, edges, globalParameters, tabs, importedFiles)
      }

      setGeneratedCode(fullCode)
      setPreviewHasGeometry(true) // main tab always treated as geometry-bearing
      console.log(
        `[Botics] codegen: ${(performance.now() - t0).toFixed(1)}ms, ${fullCode.length} chars`,
      )
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [
    nodes,
    edges,
    tabs,
    activeTabId,
    globalParameters,
    importedFiles,
    setGeneratedCode,
    loopPreviewMode,
    loopPreviewValue,
    loopPreviewRange,
    modulePreviewArgs,
    setPreviewHasGeometry,
  ])
}
