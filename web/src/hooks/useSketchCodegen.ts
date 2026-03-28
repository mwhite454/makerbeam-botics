import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { generateSketchCode, buildSketchModel, generateSketchSvg } from '@/codegen/sketchCodegen'

const DEBOUNCE_MS = 150

export function useSketchCodegen() {
  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)
  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const globalParameters = useEditorStore((s) => s.globalParameters)
  const setSketchGeneratedCode = useEditorStore((s) => s.setSketchGeneratedCode)
  const setSketchPreviewSvg = useEditorStore((s) => s.setSketchPreviewSvg)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Only run when the active tab is a sketch tab
  const activeTab = tabs.find((t) => t.id === activeTabId)
  const isSketchTab = activeTab?.tabType === 'sketch'

  useEffect(() => {
    if (!isSketchTab) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      // Generate displayable code
      const code = generateSketchCode(nodes, edges, globalParameters)
      setSketchGeneratedCode(code)

      // Build model and generate SVG for preview
      try {
        const model = buildSketchModel(nodes, edges, globalParameters)
        if (model) {
          const svg = generateSketchSvg(model)
          setSketchPreviewSvg(svg)
        } else {
          setSketchPreviewSvg('')
        }
      } catch (err) {
        console.error('[useSketchCodegen] Failed to build model:', err)
        setSketchPreviewSvg('')
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, globalParameters, isSketchTab, setSketchGeneratedCode, setSketchPreviewSvg])
}
