import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { useOpenSCAD, type RenderError } from '@/wasm/useOpenSCAD'

const DEBOUNCE_MS = 900

export function useAutoRender() {
  const generatedCode   = useEditorStore((s) => s.generatedCode)
  const autoRender      = useEditorStore((s) => s.autoRender)
  const autoColorPreview = useEditorStore((s) => s.autoColorPreview)
  const previewMode     = useEditorStore((s) => s.previewMode)
  const setPreviewMode  = useEditorStore((s) => s.setPreviewMode)
  const setRenderStatus = useEditorStore((s) => s.setRenderStatus)
  const setRenderError  = useEditorStore((s) => s.setRenderError)
  const setRenderResultSTL = useEditorStore((s) => s.setRenderResultSTL)
  const setRenderResultPNG = useEditorStore((s) => s.setRenderResultPNG)

  const { render, wasmStatus } = useOpenSCAD()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pngUnavailableRef = useRef(false)
  const hasColorHints = /\bcolor\s*\(/.test(generatedCode)

  useEffect(() => {
    if (!autoColorPreview) return
    if (pngUnavailableRef.current) return
    if (previewMode === 'stl' && hasColorHints) {
      setPreviewMode('png')
    }
  }, [autoColorPreview, previewMode, hasColorHints, setPreviewMode])

  const doRender = useCallback(async (code: string, mode: 'stl' | 'png') => {
    if (!code.trim() || code.startsWith('// Add nodes')) return
    if (wasmStatus !== 'ready') return

    const effectiveMode: 'stl' | 'png' = mode === 'png' && pngUnavailableRef.current ? 'stl' : mode

    setRenderStatus('rendering')
    try {
      const data = await render(code, effectiveMode)
      if (effectiveMode === 'stl') {
        setRenderResultSTL(data)
      } else {
        setRenderResultPNG(new Uint8Array(data))
      }
    } catch (err) {
      // err is a RenderError { message, logs } from the worker
      const renderErr = err as RenderError

      const combined = `${renderErr.message || ''}\n${renderErr.logs || ''}`.toLowerCase()
      const isPngEnvironmentIssue = effectiveMode === 'png' && (
        combined.includes('could not initialize localization') ||
        combined.includes('exited with code 1')
      )

      if (isPngEnvironmentIssue) {
        try {
          pngUnavailableRef.current = true
          const stlData = await render(code, 'stl')
          setPreviewMode('stl')
          setRenderResultSTL(stlData)
          return
        } catch (stlErr) {
          const stlRenderErr = stlErr as RenderError
          setRenderError(
            `PNG preview unavailable in this environment. STL fallback also failed: ${stlRenderErr.message || String(stlErr)}`,
            stlRenderErr.logs || ''
          )
          return
        }
      }

      setRenderError(renderErr.message || String(err), renderErr.logs || '')
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

  return { doRender: () => doRender(generatedCode, previewMode) }
}
