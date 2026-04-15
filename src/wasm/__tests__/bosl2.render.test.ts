// Integration tests that actually execute OpenSCAD WASM with the vendored
// BOSL2 library mounted. These guard against the class of runtime failures
// that text-snapshot codegen tests cannot catch — specifically missing
// library files, unknown modules, or broken preamble wiring.
//
// Run with: npm run test:render
//
// Each test creates a fresh WASM instance (openscad-wasm's callMain can only
// be invoked once per instance), so these are slow (several seconds each).
// They live in a separate Vitest project from the unit tests.

import { describe, it, expect } from 'vitest'
import { renderScad } from './renderHarness'

const BAD_PATTERNS = [/Can't open include file/i, /Ignoring unknown module/i, /Ignoring unknown function/i]

function assertClean(result: { exit: number; stdout: string[]; stderr: string[]; output: Uint8Array }) {
  const err = result.stderr.join('\n')
  for (const pat of BAD_PATTERNS) {
    expect(err, `stderr matched ${pat}:\n${err}`).not.toMatch(pat)
  }
  expect(result.exit).toBe(0)
  expect(result.output.length).toBeGreaterThan(100)
}

describe('BOSL2 WASM render smoke tests', () => {
  it('renders std cuboid', async () => {
    const r = await renderScad(`include <BOSL2/std.scad>\ncuboid([10, 20, 5]);\n`)
    assertClean(r)
  })

  it('renders std cyl', async () => {
    const r = await renderScad(`include <BOSL2/std.scad>\ncyl(h = 10, r = 5);\n`)
    assertClean(r)
  })

  it('renders gears spur_gear', async () => {
    const r = await renderScad(
      `include <BOSL2/std.scad>\ninclude <BOSL2/gears.scad>\nspur_gear(mod = 2, teeth = 16, thickness = 5);\n`
    )
    assertClean(r)
  })

  it('renders threading threaded_rod', async () => {
    const r = await renderScad(
      `include <BOSL2/std.scad>\ninclude <BOSL2/threading.scad>\nthreaded_rod(d = 10, l = 20, pitch = 1.5);\n`
    )
    assertClean(r)
  })

  it('renders screws screw', async () => {
    const r = await renderScad(
      `include <BOSL2/std.scad>\ninclude <BOSL2/screws.scad>\nscrew("M6", length = 20);\n`
    )
    assertClean(r)
  })

  it('renders joiners dovetail', async () => {
    const r = await renderScad(
      `include <BOSL2/std.scad>\ninclude <BOSL2/joiners.scad>\ndovetail("male", w = 10, h = 5, slide = 15);\n`
    )
    assertClean(r)
  })

  it('renders hinges knuckle_hinge', async () => {
    const r = await renderScad(
      `include <BOSL2/std.scad>\ninclude <BOSL2/hinges.scad>\nknuckle_hinge(length = 20, segs = 3, offset = 3, arm_height = 4, arm_angle = 45);\n`
    )
    assertClean(r)
  })

  it('renders bottlecaps bottle_cap', async () => {
    const r = await renderScad(
      `include <BOSL2/std.scad>\ninclude <BOSL2/bottlecaps.scad>\npco1881_cap(wall = 2);\n`
    )
    assertClean(r)
  })
})
