import { useEffect, useRef } from 'react'
import { useSketchStore } from '@/store/sketchStore'
import { useEditorStore } from '@/store/editorStore'
import { generateSketchCode, buildSketchModel, generateSketchSvg } from '@/codegen/sketchCodegen'

const DEBOUNCE_MS = 150

export function useSketchCodegen() {
  const nodes = useSketchStore((s) => s.nodes)
  const edges = useSketchStore((s) => s.edges)
  const globalParameters = useEditorStore((s) => s.globalParameters)
  const setGeneratedCode = useSketchStore((s) => s.setGeneratedCode)
  const setPreviewSvg = useSketchStore((s) => s.setPreviewSvg)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      // Generate displayable code
      const code = generateSketchCode(nodes, edges, globalParameters)
      setGeneratedCode(code)

      // Build model and generate SVG for preview
      try {
        const model = buildSketchModel(nodes, edges, globalParameters)
        if (model) {
          const svg = generateSketchSvg(model)
          setPreviewSvg(svg)
        } else {
          setPreviewSvg('')
        }
      } catch (err) {
        console.error('[useSketchCodegen] Failed to build model:', err)
        setPreviewSvg('')
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, globalParameters, setGeneratedCode, setPreviewSvg])
}
