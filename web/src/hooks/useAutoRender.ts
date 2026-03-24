import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { useOpenSCAD }    from '@/wasm/useOpenSCAD'

const DEBOUNCE_MS = 900

export function useAutoRender() {
  const generatedCode   = useEditorStore((s) => s.generatedCode)
  const autoRender      = useEditorStore((s) => s.autoRender)
  const previewMode     = useEditorStore((s) => s.previewMode)
  const setRenderStatus = useEditorStore((s) => s.setRenderStatus)
  const setRenderError  = useEditorStore((s) => s.setRenderError)
  const setRenderResultSTL = useEditorStore((s) => s.setRenderResultSTL)
  const setRenderResultPNG = useEditorStore((s) => s.setRenderResultPNG)

  const { render, wasmStatus } = useOpenSCAD()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doRender = useCallback(async (code: string, mode: 'stl' | 'png') => {
    if (!code.trim() || code.startsWith('// Add nodes')) return
    if (wasmStatus !== 'ready') return

    setRenderStatus('rendering')
    try {
      const data = await render(code, mode)
      if (mode === 'stl') {
        setRenderResultSTL(data)
      } else {
        setRenderResultPNG(new Uint8Array(data))
      }
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : String(err))
    }
  }, [render, wasmStatus, setRenderStatus, setRenderResultSTL, setRenderResultPNG, setRenderError])

  // Auto-render on code change
  useEffect(() => {
    if (!autoRender) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      doRender(generatedCode, previewMode)
    }, DEBOUNCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [generatedCode, autoRender, previewMode, doRender])

  // Return manual trigger
  return { doRender: () => doRender(generatedCode, previewMode) }
}
