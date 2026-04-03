import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type AutoSaveInterval = 'off' | 10_000 | 30_000 | 60_000 | 300_000

interface StoredViewport {
  x: number
  y: number
  zoom: number
}

interface PreferencesState {
  autoSaveEnabled: boolean
  autoSaveIntervalMs: AutoSaveInterval
  lastViewport: StoredViewport
  stripHaltsOnExport: boolean

  setAutoSaveEnabled: (v: boolean) => void
  setAutoSaveIntervalMs: (ms: AutoSaveInterval) => void
  setLastViewport: (vp: StoredViewport) => void
  setStripHaltsOnExport: (v: boolean) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      autoSaveEnabled: true,
      autoSaveIntervalMs: 30_000,
      lastViewport: { x: 0, y: 0, zoom: 1 },
      stripHaltsOnExport: false,

      setAutoSaveEnabled: (v) => set({ autoSaveEnabled: v }),
      setAutoSaveIntervalMs: (ms) => set({ autoSaveIntervalMs: ms }),
      setLastViewport: (vp) => set({ lastViewport: vp }),
      setStripHaltsOnExport: (v) => set({ stripHaltsOnExport: v }),
    }),
    {
      name: 'makerbeam-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
