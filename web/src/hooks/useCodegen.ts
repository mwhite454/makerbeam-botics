import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { generateCode, generateModuleCode } from '@/codegen'

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
      let fullCode = ''

      // First, emit all module tab definitions
      for (const tab of tabs) {
        if (tab.isModule && tab.id !== activeTabId) {
          // Use the tab's stored nodes/edges
          const moduleCode = generateModuleCode(tab.moduleName, tab.nodes, tab.edges)
          if (moduleCode.trim()) {
            fullCode += moduleCode + '\n'
          }
        } else if (tab.isModule && tab.id === activeTabId) {
          // Active module tab — use current nodes/edges from store
          const moduleCode = generateModuleCode(tab.moduleName, nodes, edges)
          if (moduleCode.trim()) {
            fullCode += moduleCode + '\n'
          }
        }
      }

      // Then emit the active tab's top-level code (or the main tab)
      const activeTab = tabs.find((t) => t.id === activeTabId)
      if (activeTab && !activeTab.isModule) {
        fullCode += generateCode(nodes, edges, globalParameters)
      } else if (activeTab && activeTab.isModule) {
        // Add a preview call so OpenSCAD renders the module's geometry
        fullCode += `${activeTab.moduleName}();\n`
      }

      setGeneratedCode(fullCode)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, tabs, activeTabId, globalParameters, setGeneratedCode])
}
