import { useEffect, useRef, useCallback, useState } from 'react'
import type { WorkerRequest, WorkerResponse } from './openscadWorker.worker'

export type WasmStatus = 'loading' | 'ready' | 'unavailable'

interface PendingResolve {
  resolve: (data: ArrayBuffer) => void
  reject:  (err: Error) => void
}

// Singleton worker — shared across all hook instances
let sharedWorker: Worker | null = null
let sharedWorkerStatus: WasmStatus = 'loading'
const statusListeners = new Set<(s: WasmStatus) => void>()

function getOrCreateWorker(): Worker {
  if (!sharedWorker) {
    try {
      sharedWorker = new Worker(
        new URL('./openscadWorker.worker.ts', import.meta.url),
        { type: 'module' }
      )
    } catch (err) {
      console.error('[useOpenSCAD] Failed to create worker:', err)
      sharedWorkerStatus = 'unavailable'
      statusListeners.forEach((fn) => fn('unavailable'))
      throw err
    }
  }
  return sharedWorker
}

export function useOpenSCAD() {
  const [wasmStatus, setWasmStatus] = useState<WasmStatus>(sharedWorkerStatus)
  const pendingMap = useRef(new Map<string, PendingResolve>())
  const workerRef  = useRef<Worker | null>(null)

  useEffect(() => {
    let worker: Worker
    try {
      worker = getOrCreateWorker()
    } catch {
      setWasmStatus('unavailable')
      return
    }
    workerRef.current = worker

    // Register status listener
    const onStatus = (s: WasmStatus) => setWasmStatus(s)
    statusListeners.add(onStatus)

    // Sync current status immediately
    setWasmStatus(sharedWorkerStatus)

    const onMessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data
      if (msg.type === 'ready') {
        sharedWorkerStatus = 'ready'
        statusListeners.forEach((fn) => fn('ready'))
      } else if (msg.type === 'result') {
        const pending = pendingMap.current.get(msg.id)
        if (pending) {
          pendingMap.current.delete(msg.id)
          pending.resolve(msg.data)
        }
      } else if (msg.type === 'error') {
        const pending = pendingMap.current.get(msg.id)
        if (pending) {
          pendingMap.current.delete(msg.id)
          pending.reject(new Error(msg.message))
        }
      }
    }

    worker.addEventListener('message', onMessage)

    return () => {
      worker.removeEventListener('message', onMessage)
      statusListeners.delete(onStatus)
    }
  }, [])

  const render = useCallback(
    (code: string, format: 'stl' | 'png' = 'stl'): Promise<ArrayBuffer> => {
      return new Promise((resolve, reject) => {
        let worker: Worker
        try {
          worker = getOrCreateWorker()
        } catch {
          reject(new Error('OpenSCAD WASM worker unavailable'))
          return
        }

        const id = crypto.randomUUID()
        pendingMap.current.set(id, { resolve, reject })

        const req: WorkerRequest = { type: 'render', id, code, format }
        worker.postMessage(req)

        // Timeout after 120 seconds
        setTimeout(() => {
          if (pendingMap.current.has(id)) {
            pendingMap.current.delete(id)
            reject(new Error('Render timed out after 120s'))
          }
        }, 120_000)
      })
    },
    []
  )

  return { wasmStatus, render }
}
