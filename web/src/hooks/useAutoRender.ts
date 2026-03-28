import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { useOpenSCAD, type RenderError } from '@/wasm/useOpenSCAD'

const DEBOUNCE_MS = 900

export function useAutoRender() {
  const generatedCode   = useEditorStore((s) => s.generatedCode)
  const autoRender      = useEditorStore((s) => s.autoRender)
  const previewMode     = useEditorStore((s) => s.previewMode)
  const setPreviewMode  = useEditorStore((s) => s.setPreviewMode)
  const setRenderStatus = useEditorStore((s) => s.setRenderStatus)
  const setRenderError  = useEditorStore((s) => s.setRenderError)
  const setRenderResultSTL = useEditorStore((s) => s.setRenderResultSTL)
  const setRenderResultPNG = useEditorStore((s) => s.setRenderResultPNG)
  const setRenderResultOFF = useEditorStore((s) => s.setRenderResultOFF)

  const { render, wasmStatus } = useOpenSCAD()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pngUnavailableRef = useRef(false)
  const renderSeqRef = useRef(0)

  const doRender = useCallback(async (code: string, mode: typeof previewMode) => {
    if (!code.trim() || code.includes('// Add nodes')) return
    if (wasmStatus !== 'ready') return

    // PNG fallback to STL if environment doesn't support it
    let effectiveMode = mode
    if (mode === 'png' && pngUnavailableRef.current) effectiveMode = 'stl'

    const requestSeq = ++renderSeqRef.current
    const isStale = () => requestSeq !== renderSeqRef.current

    setRenderStatus('rendering')
    const renderStart = performance.now()
    try {
      const data = await render(code, effectiveMode)
      if (isStale()) return
      console.log(`[Botics] wasm render: ${(performance.now() - renderStart).toFixed(0)}ms, format=${effectiveMode}`)
      if (effectiveMode === 'stl') {
        setRenderResultSTL(data)
      } else if (effectiveMode === 'png') {
        setRenderResultPNG(new Uint8Array(data))
      } else {
        setRenderResultOFF(data)
      }
    } catch (err) {
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
          if (isStale()) return
          setPreviewMode('stl')
          setRenderResultSTL(stlData)
          return
        } catch (stlErr) {
          if (isStale()) return
          const stlRenderErr = stlErr as RenderError
          setRenderError(
            `PNG preview unavailable in this environment. STL fallback also failed: ${stlRenderErr.message || String(stlErr)}`,
            stlRenderErr.logs || ''
          )
          return
        }
      }

      // If OFF format failed, fall back to STL
      if (effectiveMode === 'off') {
        try {
          const stlData = await render(code, 'stl')
          if (isStale()) return
          setPreviewMode('stl')
          setRenderResultSTL(stlData)
          return
        } catch {
          // Fall through to generic error
        }
      }

      if (isStale()) return
      setRenderError(renderErr.message || String(err), renderErr.logs || '')
    }
  }, [render, wasmStatus, setRenderStatus, setRenderResultSTL, setRenderResultPNG, setRenderResultOFF, setRenderError, setPreviewMode])

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
