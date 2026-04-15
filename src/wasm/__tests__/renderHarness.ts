// Node-side OpenSCAD render harness for Vitest integration tests.
//
// openscad-wasm is an Emscripten build, so it runs in Node as well as the
// browser. This helper mirrors what src/wasm/openscadWorker.worker.ts does at
// runtime: create a WASM instance, mount BOSL2 into /libraries/BOSL2/, write
// the input SCAD, and call the entry point.
//
// These tests validate the full chain (codegen → BOSL2 resolution → WASM
// render) that the text-snapshot unit tests in nodepacks/bosl2/__tests__
// cannot exercise.

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// openscad-wasm exports an Emscripten module. Types are loose.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OpenSCADFactory = (opts?: any) => Promise<any>

const BOSL2_DIR = join(process.cwd(), 'public', 'libraries', 'BOSL2')

export interface RenderResult {
  exit: number
  stdout: string[]
  stderr: string[]
  output: Uint8Array
}

let createOpenSCADCached: OpenSCADFactory | null = null
async function getFactory(): Promise<OpenSCADFactory> {
  if (!createOpenSCADCached) {
    const mod = await import('openscad-wasm')
    createOpenSCADCached = mod.createOpenSCAD as OpenSCADFactory
  }
  return createOpenSCADCached
}

let cachedBosl2: Array<[string, Uint8Array]> | null = null
function loadBosl2FromDisk(): Array<[string, Uint8Array]> {
  if (cachedBosl2) return cachedBosl2
  const files = readdirSync(BOSL2_DIR).filter((f) => f.endsWith('.scad'))
  cachedBosl2 = files.map((f) => [f, new Uint8Array(readFileSync(join(BOSL2_DIR, f)))])
  return cachedBosl2
}

export async function renderScad(
  code: string,
  format: 'stl' | 'off' = 'stl'
): Promise<RenderResult> {
  const stdout: string[] = []
  const stderr: string[] = []

  const createOpenSCAD = await getFactory()
  const inst = await createOpenSCAD({
    print: (s: string) => stdout.push(s),
    printErr: (s: string) => stderr.push(s),
  })
  const raw = inst.getInstance()

  try { raw.FS.mkdir('/libraries') } catch { /* ok */ }
  try { raw.FS.mkdir('/libraries/BOSL2') } catch { /* ok */ }
  for (const [name, buf] of loadBosl2FromDisk()) {
    raw.FS.writeFile(`/libraries/BOSL2/${name}`, buf)
  }

  raw.FS.writeFile('/in.scad', code)
  const outPath = `/out.${format}`
  const args = ['/in.scad', '-o', outPath]
  if (format === 'off') args.push('--export-format=off')

  const exit = raw.callMain(args)

  let output: Uint8Array = new Uint8Array()
  try {
    const data = raw.FS.readFile(outPath, { encoding: 'binary' })
    output = new Uint8Array(data)
  } catch { /* missing output file — leave empty */ }

  return { exit, stdout, stderr, output }
}
