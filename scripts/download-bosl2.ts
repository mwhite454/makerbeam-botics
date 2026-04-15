#!/usr/bin/env tsx
/**
 * Downloads a pinned BOSL2 release and vendors its `.scad` files into
 * `public/libraries/BOSL2/`, regenerating `bosl2-manifest.json`.
 *
 * Run with: `npm run vendor:bosl2`
 *
 * Bumping the version: change BOSL2_VERSION below, re-run the script, commit
 * the diff. No other changes required — the manifest is consumed by both the
 * browser loader (src/wasm/bosl2Loader.ts) and the Node render harness
 * (src/wasm/__tests__/renderHarness.ts).
 */

import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { Readable } from 'node:stream'
import { finished } from 'node:stream/promises'

// BOSL2 is pinned by commit SHA from master. BOSL2 does not publish lightweight
// tags that GitHub codeload exposes, so a SHA is the most reliable immutable
// reference. Bump by pointing at a newer commit from
// https://github.com/BelfrySCAD/BOSL2/commits/master and re-running this script.
const BOSL2_COMMIT = 'f3037cd0d8e83e4d82e3258198f80b3f6602683e'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '..')
const OUT_DIR = join(REPO_ROOT, 'public', 'libraries', 'BOSL2')

async function downloadTarball(url: string, dest: string) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok || !res.body) {
    throw new Error(`Download failed: ${res.status} ${res.statusText} ${url}`)
  }
  const file = createWriteStream(dest)
  // @ts-expect-error Node's fetch body is compatible with Readable.fromWeb
  await finished(Readable.fromWeb(res.body).pipe(file))
}

async function main() {
  const ref = BOSL2_COMMIT
  const url = `https://codeload.github.com/BelfrySCAD/BOSL2/tar.gz/${ref}`

  const workDir = join(tmpdir(), `bosl2-${ref.slice(0, 12)}-${Date.now()}`)
  mkdirSync(workDir, { recursive: true })
  const tarPath = join(workDir, 'bosl2.tar.gz')

  console.log(`[vendor:bosl2] Downloading ${url}`)
  await downloadTarball(url, tarPath)

  console.log(`[vendor:bosl2] Extracting to ${workDir}`)
  execSync(`tar -xzf "${tarPath}" -C "${workDir}"`, { stdio: 'inherit' })

  // GitHub codeload tarballs extract to `<repo>-<tagWithoutV>/`
  const extractedRoot = readdirSync(workDir).find((name) => name.startsWith('BOSL2-'))
  if (!extractedRoot) throw new Error(`Could not find extracted BOSL2 dir in ${workDir}`)
  const srcDir = join(workDir, extractedRoot)

  // Clean output dir and recreate
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })

  // Copy only top-level *.scad plus LICENSE — nothing else.
  const entries = readdirSync(srcDir, { withFileTypes: true })
  const scadFiles: string[] = []
  for (const e of entries) {
    if (!e.isFile()) continue
    if (e.name.endsWith('.scad')) {
      writeFileSync(join(OUT_DIR, e.name), readFileSync(join(srcDir, e.name)))
      scadFiles.push(e.name)
    } else if (e.name === 'LICENSE') {
      writeFileSync(join(OUT_DIR, 'LICENSE'), readFileSync(join(srcDir, 'LICENSE')))
    }
  }

  scadFiles.sort()

  const manifest = { version: ref, files: scadFiles }
  writeFileSync(join(OUT_DIR, 'bosl2-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  writeFileSync(join(OUT_DIR, 'VERSION'), ref + '\n')

  rmSync(workDir, { recursive: true, force: true })

  console.log(`[vendor:bosl2] Vendored ${scadFiles.length} .scad files at ${ref}`)
  console.log(`[vendor:bosl2] Output: ${OUT_DIR}`)
}

main().catch((err) => {
  console.error('[vendor:bosl2] Failed:', err)
  process.exit(1)
})
