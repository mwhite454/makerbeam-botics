// BOSL2 library loader for the OpenSCAD WASM worker.
//
// The openscad-wasm npm package does NOT bundle BOSL2. We vendor the library
// under `public/libraries/BOSL2/` (see scripts/download-bosl2.ts) and mount
// those files into each WASM instance's virtual filesystem so
// `include <BOSL2/std.scad>` resolves.
//
// A fresh WASM instance is created per render, but the fetched file buffers
// are cached at module scope so we only hit the network once per worker.

export interface Bosl2Manifest {
  version: string
  files: string[]
}

// Minimal FS surface we rely on — matches Emscripten's FS shape.
interface EmscriptenFS {
  mkdir: (path: string) => void
  writeFile: (path: string, data: Uint8Array | string) => void
}

let filesPromise: Promise<Map<string, Uint8Array>> | null = null

export function ensureBosl2Loaded(): Promise<Map<string, Uint8Array>> {
  if (!filesPromise) {
    filesPromise = loadBosl2Files().catch((err) => {
      // Reset on failure so the next render can retry.
      filesPromise = null
      throw err
    })
  }
  return filesPromise
}

async function loadBosl2Files(): Promise<Map<string, Uint8Array>> {
  const manifestRes = await fetch('/libraries/BOSL2/bosl2-manifest.json')
  if (!manifestRes.ok) {
    throw new Error(
      `BOSL2 manifest fetch failed (${manifestRes.status}). Did you run \`npm run vendor:bosl2\`?`
    )
  }
  const manifest = (await manifestRes.json()) as Bosl2Manifest

  const entries = await Promise.all(
    manifest.files.map(async (name) => {
      const res = await fetch(`/libraries/BOSL2/${name}`)
      if (!res.ok) {
        throw new Error(`BOSL2 file fetch failed: ${name} (${res.status})`)
      }
      const buf = new Uint8Array(await res.arrayBuffer())
      return [name, buf] as const
    })
  )
  return new Map(entries)
}

export async function mountBosl2(FS: EmscriptenFS): Promise<void> {
  const files = await ensureBosl2Loaded()
  try { FS.mkdir('/libraries') } catch { /* already exists */ }
  try { FS.mkdir('/libraries/BOSL2') } catch { /* already exists */ }
  for (const [name, buf] of files) {
    FS.writeFile(`/libraries/BOSL2/${name}`, buf)
  }
}

/** True when the given SCAD source references the BOSL2 library. */
export function sourceNeedsBosl2(code: string): boolean {
  return /\bBOSL2\//.test(code)
}
