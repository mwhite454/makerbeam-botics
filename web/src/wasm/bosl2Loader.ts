// Loads BOSL2 v2.0.730 from the static asset at /bosl2.zip.
// Files are cached in worker memory after the first fetch; subsequent renders
// reuse the cache without a network round-trip.

import { unzip } from 'fflate'

// 'std.scad' → Uint8Array (no leading 'BOSL2/' — that prefix is added on mount)
let cachedFiles: Map<string, Uint8Array> | null = null
let loadPromise: Promise<Map<string, Uint8Array>> | null = null

export async function loadBOSL2(): Promise<Map<string, Uint8Array>> {
  if (cachedFiles) return cachedFiles
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const resp = await fetch('/bosl2.zip')
    if (!resp.ok) throw new Error(`BOSL2 fetch failed: HTTP ${resp.status}`)
    const buf = new Uint8Array(await resp.arrayBuffer())

    return new Promise<Map<string, Uint8Array>>((resolve, reject) => {
      unzip(buf, (err, files) => {
        if (err) { reject(err); return }

        const out = new Map<string, Uint8Array>()
        for (const [zipPath, data] of Object.entries(files)) {
          // GitHub zipball wraps files in a top-level dir, e.g.
          // 'BelfrySCAD-BOSL2-fb625bf/std.scad' → strip to 'std.scad'
          const stripped = zipPath.replace(/^[^/]+\//, '')
          if (stripped.endsWith('.scad') && stripped !== '') {
            out.set(stripped, data)
          }
        }

        cachedFiles = out
        resolve(out)
      })
    })
  })()

  return loadPromise
}

// Writes all cached BOSL2 files into the WASM virtual filesystem under /BOSL2/.
// Call this immediately before raw.callMain() on each render that uses BOSL2.
export function mountBOSL2InFS(fs: {
  mkdir(path: string): void
  writeFile(path: string, data: Uint8Array): void
}) {
  if (!cachedFiles) throw new Error('BOSL2 not loaded — call loadBOSL2() first')

  try { fs.mkdir('/BOSL2') } catch { /* already exists is fine */ }

  for (const [name, data] of cachedFiles) {
    fs.writeFile('/BOSL2/' + name, data)
  }
}
