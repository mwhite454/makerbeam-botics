/// <reference lib="webworker" />

// Web Worker for OpenSCAD WASM rendering.
// Uses the low-level API directly to capture stderr (compile errors).

import { createOpenSCAD, type OpenSCADInstance } from 'openscad-wasm'
import type { OpenSCAD } from 'openscad-wasm'

export type WorkerRequest =
  | { type: 'render'; id: string; code: string; format: 'stl' | 'png' }
  | { type: 'ping' }

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'result'; id: string; format: 'stl' | 'png'; data: ArrayBuffer }
  | { type: 'error';  id: string; message: string; logs: string }
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
    // Post an informative message back
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
    if (!instance) { pendingQueue.push(req); return }
    runRender(req.id, req.code, req.format)
  }
}

function runRender(id: string, code: string, format: 'stl' | 'png') {
  if (!instance) return

  // Use low-level API to capture stdout/stderr
  const raw: OpenSCAD = instance.getInstance()
  const stdout: string[] = []
  const stderr: string[] = []

  // Capture output
  raw.print = (text: string) => stdout.push(text)
  raw.printErr = (text: string) => stderr.push(text)

  const inputPath = '/input.scad'
  const outputExt = format === 'stl' ? '.stl' : '.png'
  const outputPath = `/output${outputExt}`

  try {
    // Write the source file
    raw.FS.writeFile(inputPath, code)

    // Build args
    const args: string[] = [inputPath, '-o', outputPath]
    if (format === 'png') {
      args.push('--render', '--imgsize=800,600')
    }

    // Run OpenSCAD
    const exitCode = raw.callMain(args)

    // Assemble logs
    const allLogs = [...stdout, ...stderr].join('\n')

    // Check for errors
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
      cleanup(raw, inputPath, outputPath)
      return
    }

    // Try to read the output file
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
      cleanup(raw, inputPath, outputPath)
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
      cleanup(raw, inputPath, outputPath)
      return
    }

    cleanup(raw, inputPath, outputPath)

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
    cleanup(raw, inputPath, outputPath)
  }
}

function cleanup(raw: OpenSCAD, ...paths: string[]) {
  for (const p of paths) {
    try { raw.FS.unlink(p) } catch { /* ignore */ }
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

initOpenSCAD()
