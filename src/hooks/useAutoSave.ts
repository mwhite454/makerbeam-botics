import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { usePreferencesStore } from '@/store/preferencesStore'

const STORAGE_KEY = 'makerbeam-project'
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export function useAutoSave() {
  const nodes           = useEditorStore((s) => s.nodes)
  const edges           = useEditorStore((s) => s.edges)
  const tabs            = useEditorStore((s) => s.tabs)
  const activeTabId     = useEditorStore((s) => s.activeTabId)
  const autoSaveEnabled = usePreferencesStore((s) => s.autoSaveEnabled)
  const intervalMs      = usePreferencesStore((s) => s.autoSaveIntervalMs)
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!autoSaveEnabled || intervalMs === 'off') return

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
    }, intervalMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, tabs, activeTabId, autoSaveEnabled, intervalMs])
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
