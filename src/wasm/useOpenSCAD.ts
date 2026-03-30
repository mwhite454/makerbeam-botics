import { useEffect, useRef, useCallback, useState } from 'react'
import type { RenderFormat, WorkerRequest, WorkerResponse } from './openscadWorker.worker'

export type WasmStatus = 'loading' | 'ready' | 'unavailable'

export interface RenderError {
  message: string
  logs: string
}

interface PendingResolve {
  resolve: (data: ArrayBuffer) => void
  reject:  (err: RenderError) => void
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

    const onStatus = (s: WasmStatus) => setWasmStatus(s)
    statusListeners.add(onStatus)
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
        // Handle init errors
        if (msg.id === '__init__') {
          sharedWorkerStatus = 'unavailable'
          statusListeners.forEach((fn) => fn('unavailable'))
          return
        }
        const pending = pendingMap.current.get(msg.id)
        if (pending) {
          pendingMap.current.delete(msg.id)
          pending.reject({ message: msg.message, logs: msg.logs })
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
    (code: string, format: RenderFormat = 'stl', files?: Array<{ name: string; data: ArrayBuffer }>): Promise<ArrayBuffer> => {
      return new Promise((resolve, reject) => {
        let worker: Worker
        try {
          worker = getOrCreateWorker()
        } catch {
          reject({ message: 'OpenSCAD WASM worker unavailable', logs: '' })
          return
        }

        const id = crypto.randomUUID()
        pendingMap.current.set(id, { resolve, reject })

        const req: WorkerRequest = { type: 'render', id, code, format, files }
        const transferables = (files ?? []).map((f) => f.data)
        worker.postMessage(req, transferables)

        // Timeout after 120 seconds
        setTimeout(() => {
          if (pendingMap.current.has(id)) {
            pendingMap.current.delete(id)
            reject({ message: 'Render timed out after 120s', logs: '' })
          }
        }, 120_000)
      })
    },
    []
  )

  return { wasmStatus, render }
}
