/// <reference lib="webworker" />

// Web Worker for OpenSCAD WASM rendering.
// Creates a fresh WASM instance per render because OpenSCAD's callMain
// can only be called once per instance (C++ global state isn't reset).

import { createOpenSCAD } from 'openscad-wasm'
import type { OpenSCAD } from 'openscad-wasm'

export type WorkerRequest =
  | { type: 'render'; id: string; code: string; format: 'stl' | 'png' }
  | { type: 'ping' }

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'result'; id: string; format: 'stl' | 'png'; data: ArrayBuffer }
  | { type: 'error';  id: string; message: string; logs: string }
  | { type: 'pong' }

let wasmReady = false
let initialising = false
const pendingQueue: WorkerRequest[] = []

async function initOpenSCAD() {
  if (wasmReady || initialising) return
  initialising = true
  try {
    // Create a throwaway instance to verify WASM loads correctly
    await createOpenSCAD()
    wasmReady = true
    const msg: WorkerResponse = { type: 'ready' }
    self.postMessage(msg)
  } catch (err) {
    console.error('[openscad-worker] Init failed:', err)
    const msg: WorkerResponse = {
      type: 'error',
      id: '__init__',
      message: `OpenSCAD WASM failed to initialize: ${err instanceof Error ? err.message : String(err)}`,
      logs: '',
    }
    self.postMessage(msg)
  } finally {
    initialising = false
  }
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
    if (!wasmReady) { pendingQueue.push(req); return }
    runRender(req.id, req.code, req.format)
  }
}

async function runRender(id: string, code: string, format: 'stl' | 'png') {
  const stdout: string[] = []
  const stderr: string[] = []

  let raw: OpenSCAD
  try {
    const inst = await createOpenSCAD({
      print: (text: string) => stdout.push(text),
      printErr: (text: string) => stderr.push(text),
    })
    raw = inst.getInstance()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const msg: WorkerResponse = {
      type: 'error',
      id,
      message: `Failed to create OpenSCAD instance: ${message}`,
      logs: '',
    }
    self.postMessage(msg)
    return
  }

  const inputPath = '/input.scad'
  const outputExt = format === 'stl' ? '.stl' : '.png'
  const outputPath = `/output${outputExt}`

  try {
    raw.FS.writeFile(inputPath, code)

    const args: string[] = [inputPath, '-o', outputPath]
    if (format === 'png') {
      args.push('--render', '--imgsize=800,600')
    }

    const exitCode = raw.callMain(args)

    const allLogs = [...stdout, ...stderr].join('\n')

    const hasError = stderr.some(line =>
      line.includes('ERROR:') || line.includes('FATAL:')
    )

    if (exitCode !== 0 || hasError) {
      const errorLines = stderr.filter(l =>
        l.includes('ERROR:') || l.includes('WARNING:') || l.includes('FATAL:') || l.includes('line ')
      )
      const summary = errorLines.length > 0
        ? errorLines.join('\n')
        : `OpenSCAD exited with code ${exitCode}`

      const msg: WorkerResponse = { type: 'error', id, message: summary, logs: allLogs }
      self.postMessage(msg)
      return
    }

    let data: Uint8Array
    try {
      data = raw.FS.readFile(outputPath, { encoding: 'binary' }) as Uint8Array
    } catch {
      const msg: WorkerResponse = {
        type: 'error',
        id,
        message: 'Render completed but produced no output file.',
        logs: allLogs,
      }
      self.postMessage(msg)
      return
    }

    if (data.length === 0) {
      const msg: WorkerResponse = {
        type: 'error',
        id,
        message: 'Render produced an empty file. The geometry may be invalid (e.g. 2D shape without extrusion for STL).',
        logs: allLogs,
      }
      self.postMessage(msg)
      return
    }

    const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
    const msg: WorkerResponse = { type: 'result', id, format, data: buffer }
    self.postMessage(msg, [buffer])

  } catch (err) {
    const allLogs = [...stdout, ...stderr].join('\n')
    const message = err instanceof Error ? err.message : String(err)
    const msg: WorkerResponse = {
      type: 'error',
      id,
      message: `Render crashed: ${message}`,
      logs: allLogs,
    }
    self.postMessage(msg)
  }
}

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const req = event.data
  if (!wasmReady && !initialising) {
    initOpenSCAD()
    pendingQueue.push(req)
  } else {
    handleRequest(req)
  }
})

initOpenSCAD()
