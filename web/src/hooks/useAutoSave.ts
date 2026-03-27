import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'

const STORAGE_KEY = 'makerbeam-project'
const DEBOUNCE_MS = 1000
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export function useAutoSave() {
  const nodes       = useEditorStore((s) => s.nodes)
  const edges       = useEditorStore((s) => s.edges)
  const tabs        = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        const json = useEditorStore.getState().exportProject()
        if (json.length > MAX_SIZE_BYTES) {
          console.warn('[autoSave] Project too large for localStorage, skipping save')
          return
        }
        localStorage.setItem(STORAGE_KEY, json)
      } catch (err) {
        console.warn('[autoSave] Failed to save:', err)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, tabs, activeTabId])
}

export function loadSavedProject(): boolean {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (json) {
      useEditorStore.getState().importProject(json)
      return true
    }
  } catch (err) {
    console.warn('[autoSave] Failed to load saved project:', err)
  }
  return false
}

export function clearSavedProject() {
  localStorage.removeItem(STORAGE_KEY)
}
