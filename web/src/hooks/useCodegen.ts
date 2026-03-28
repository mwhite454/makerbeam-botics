import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { generateCode, generateModuleCode, generateLoopBodyCode } from '@/codegen'

const DEBOUNCE_MS = 150

export function useCodegen() {
  const nodes           = useEditorStore((s) => s.nodes)
  const edges           = useEditorStore((s) => s.edges)
  const tabs            = useEditorStore((s) => s.tabs)
  const activeTabId     = useEditorStore((s) => s.activeTabId)
  const globalParameters = useEditorStore((s) => s.globalParameters)
  const setGeneratedCode = useEditorStore((s) => s.setGeneratedCode)
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const t0 = performance.now()
      let fullCode = ''

      // First, emit all module and loop body tab definitions (skip sketch tabs)
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

      // Then emit the active tab's top-level code
      const activeTab = tabs.find((t) => t.id === activeTabId)
      if (activeTab && activeTab.tabType === 'sketch') {
        // Sketch tabs don't emit OpenSCAD — handled by useSketchCodegen
      } else if (activeTab && activeTab.tabType === 'module') {
        // Add a preview call so OpenSCAD renders the module's geometry
        fullCode += `${activeTab.moduleName}();\n`
      } else if (activeTab && activeTab.tabType === 'loop') {
        // Loop body tabs don't emit a standalone call — for_loop nodes handle invocation
      } else {
        // Main or regular tabs
        fullCode += generateCode(nodes, edges, globalParameters, tabs)
      }

      setGeneratedCode(fullCode)
      console.log(`[Botics] codegen: ${(performance.now() - t0).toFixed(1)}ms, ${fullCode.length} chars`)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, tabs, activeTabId, globalParameters, setGeneratedCode])
}
