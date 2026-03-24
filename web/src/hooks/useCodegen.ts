import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { generateCode }   from '@/codegen'

const DEBOUNCE_MS = 150

export function useCodegen() {
  const nodes           = useEditorStore((s) => s.nodes)
  const edges           = useEditorStore((s) => s.edges)
  const setGeneratedCode = useEditorStore((s) => s.setGeneratedCode)
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const code = generateCode(nodes, edges)
      setGeneratedCode(code)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, setGeneratedCode])
}
