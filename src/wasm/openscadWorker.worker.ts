/// <reference lib="webworker" />

// Web Worker for OpenSCAD WASM rendering.
// Creates a fresh WASM instance per render because OpenSCAD's callMain
// can only be called once per instance (C++ global state isn't reset).

import { createOpenSCAD } from 'openscad-wasm'
import type { OpenSCAD } from 'openscad-wasm'
import { mountBosl2, sourceNeedsBosl2 } from './bosl2Loader'

export type RenderFormat = 'stl' | 'png' | 'off'

export type WorkerRequest =
  | { type: 'render'; id: string; code: string; format: RenderFormat; files?: Array<{ name: string; data: ArrayBuffer }> }
  | { type: 'ping' }

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'result'; id: string; format: RenderFormat; data: ArrayBuffer }
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
    runRender(req.id, req.code, req.format, req.files)
  }
}

async function runRender(id: string, code: string, format: RenderFormat, files?: Array<{ name: string; data: ArrayBuffer }>) {
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
  const extMap: Record<RenderFormat, string> = { stl: '.stl', png: '.png', off: '.off' }
  const outputPath = `/output${extMap[format]}`

  try {
    raw.FS.writeFile(inputPath, code)

    // Mount any imported files (STL, heightmaps, etc.) into the WASM FS
    for (const file of files ?? []) {
      raw.FS.writeFile(`/${file.name}`, new Uint8Array(file.data))
    }

    // Mount BOSL2 library files if the source includes any BOSL2 headers.
    // openscad-wasm doesn't bundle BOSL2, so we vendor it under
    // public/libraries/BOSL2/ and write it into the WASM FS at /libraries/BOSL2/.
    if (sourceNeedsBosl2(code)) {
      try {
        await mountBosl2(raw.FS)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        const msg: WorkerResponse = {
          type: 'error',
          id,
          message: `Failed to load BOSL2 library: ${message}`,
          logs: '',
        }
        self.postMessage(msg)
        return
      }
    }

    const args: string[] = [inputPath, '-o', outputPath]
    if (format === 'off') {
      args.push('--export-format=off')
    } else if (format === 'png') {
      args.push('--render', '--imgsize=800,600')
    }

    const exitCode = raw.callMain(args)

    const allLogs = [...stdout, ...stderr].join('\n')

    // Treat missing includes and unknown modules/functions as errors — OpenSCAD
    // emits these as WARNING-level messages and then produces an empty output,
    // so without this check the failure looks like a silent empty render.
    const hasError = stderr.some((line) =>
      /\berror\b|\bfatal\b|Can't open include file|Ignoring unknown (module|function)/i.test(line)
    )

    if (exitCode !== 0 || hasError) {
      const errorLines = stderr.filter((line) =>
        /\berror\b|\bwarning\b|\bfatal\b|\bline\s+\d+\b/i.test(line)
      )
      const summary = errorLines.length > 0
        ? errorLines.join('\n')
        : stderr.length > 0
          ? stderr.slice(-8).join('\n')
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

    // Debug: log OFF output header + sample face data
    if (format === 'off') {
      const fullText = new TextDecoder().decode(data)
      const preview = fullText.slice(0, 200)
      // Find and log a few face lines (after vertices)
      const allLines = fullText.split('\n')
      const headerMatch = allLines[0]?.match(/^(C?N?OFF)\s*(\d+)\s+(\d+)/)
      const numVerts = headerMatch ? parseInt(headerMatch[2]) : 0
      const faceStart = numVerts + (headerMatch ? 1 : 2) // header line + vertex lines
      const sampleFaces = allLines.slice(faceStart, faceStart + 3).join(' | ')
      console.log(`[openscad-worker] OFF output (${data.length} bytes): header="${preview.split('\n')[0]}", sample faces: [${sampleFaces}]`)
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
