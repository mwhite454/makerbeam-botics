/// <reference lib="webworker" />

// Web Worker that manages the OpenSCAD WASM instance.
// Stays resident between renders to avoid expensive re-initialisation.
// Uses the openscad-wasm npm package (createOpenSCAD / OpenSCADInstance API).

import { createOpenSCAD, type OpenSCADInstance } from 'openscad-wasm'

export type WorkerRequest =
  | { type: 'render'; id: string; code: string; format: 'stl' | 'png' }
  | { type: 'ping' }

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'result';  id: string; format: 'stl' | 'png'; data: ArrayBuffer }
  | { type: 'error';   id: string; message: string }
  | { type: 'pong' }

let instance: OpenSCADInstance | null = null
let initialising = false
const pendingQueue: WorkerRequest[] = []

async function initOpenSCAD() {
  if (instance || initialising) return
  initialising = true
  try {
    instance = await createOpenSCAD()
    const msg: WorkerResponse = { type: 'ready' }
    self.postMessage(msg)
  } catch (err) {
    console.error('[openscad-worker] Init failed:', err)
  } finally {
    initialising = false
  }
  // Drain pending requests
  while (pendingQueue.length > 0) {
    handleRequest(pendingQueue.shift()!)
  }
}

function handleRequest(req: WorkerRequest) {
  if (req.type === 'ping') {
    self.postMessage({ type: 'pong' } as WorkerResponse)
    return
  }
  if (req.type === 'render') {
    if (!instance) { pendingQueue.push(req); return }
    runRender(req.id, req.code, req.format)
  }
}

async function runRender(id: string, code: string, format: 'stl' | 'png') {
  if (!instance) return

  const errors: string[] = []

  try {
    if (format === 'stl') {
      // High-level renderToStl API
      const stlString = await instance.renderToStl(code)
      if (!stlString || stlString.trim() === '') {
        throw new Error('Render produced empty output. Check the SCAD code for errors.')
      }
      // Convert STL string to ArrayBuffer
      const encoder = new TextEncoder()
      const bytes = encoder.encode(stlString)
      const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
      const msg: WorkerResponse = { type: 'result', id, format, data: buffer }
      self.postMessage(msg, [buffer])

    } else {
      // PNG: use low-level callMain
      const raw = instance.getInstance()
      raw.printErr = (text) => errors.push(text)

      const inputPath  = '/input.scad'
      const outputPath = '/output.png'
      raw.FS.writeFile(inputPath, code)
      raw.callMain([inputPath, '-o', outputPath, '--render', '--imgsize=800,600'])

      let data: Uint8Array
      try {
        data = raw.FS.readFile(outputPath, { encoding: 'binary' }) as Uint8Array
      } catch {
        throw new Error(errors.length > 0 ? errors.join('\n') : 'PNG render failed — no output file')
      }

      try { raw.FS.unlink(inputPath)  } catch { /* ignore */ }
      try { raw.FS.unlink(outputPath) } catch { /* ignore */ }

      const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
      const msg: WorkerResponse = { type: 'result', id, format, data: buffer }
      self.postMessage(msg, [buffer])
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const fullMsg = errors.length > 0 ? `${message}\n${errors.join('\n')}` : message
    const msg: WorkerResponse = { type: 'error', id, message: fullMsg }
    self.postMessage(msg)
  }
}

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const req = event.data
  if (!instance && !initialising) {
    initOpenSCAD()
    pendingQueue.push(req)
  } else {
    handleRequest(req)
  }
})

// Kick off init when worker loads
initOpenSCAD()
