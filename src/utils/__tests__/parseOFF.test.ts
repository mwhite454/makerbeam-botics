/**
 * Tests for F-003 R3 — Color Persistence.
 *
 * These tests verify that the OFF-parsing pipeline that feeds the 3D preview
 * correctly extracts and preserves color data produced by OpenSCAD's `color()`
 * module. Without these guarantees, re-renders strip user-applied colors.
 */

import { describe, it, expect } from 'vitest'
import { parseOFF } from '../parseOFF'

/** Encode a text OFF document into an ArrayBuffer (what WASM returns). */
function encodeOFF(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer as ArrayBuffer
}

describe('parseOFF — color persistence (F-003 R3)', () => {
  it('extracts RGB face colors and expands them to every triangle vertex', () => {
    // Two-triangle square with red and green faces.
    const off = [
      'OFF',
      '4 2 0',
      '0 0 0',
      '1 0 0',
      '1 1 0',
      '0 1 0',
      '3 0 1 2 1.0 0.0 0.0', // red triangle
      '3 0 2 3 0.0 1.0 0.0', // green triangle
    ].join('\n')

    const result = parseOFF(encodeOFF(off))

    expect(result.colors).not.toBeNull()
    expect(result.positions.length).toBe(6 * 3) // 2 triangles * 3 verts * xyz
    expect(result.colors!.length).toBe(6 * 4)   // 2 triangles * 3 verts * rgba

    // First triangle's three vertices must each carry the red color.
    for (let v = 0; v < 3; v++) {
      expect(result.colors![v * 4 + 0]).toBeCloseTo(1.0) // R
      expect(result.colors![v * 4 + 1]).toBeCloseTo(0.0) // G
      expect(result.colors![v * 4 + 2]).toBeCloseTo(0.0) // B
      expect(result.colors![v * 4 + 3]).toBeCloseTo(1.0) // A (default)
    }
    // Second triangle's three vertices must each carry the green color.
    for (let v = 3; v < 6; v++) {
      expect(result.colors![v * 4 + 0]).toBeCloseTo(0.0)
      expect(result.colors![v * 4 + 1]).toBeCloseTo(1.0)
      expect(result.colors![v * 4 + 2]).toBeCloseTo(0.0)
      expect(result.colors![v * 4 + 3]).toBeCloseTo(1.0)
    }
  })

  it('preserves an explicit alpha channel on RGBA faces', () => {
    const off = [
      'OFF',
      '3 1 0',
      '0 0 0',
      '1 0 0',
      '0 1 0',
      '3 0 1 2 0.2 0.4 0.6 0.5', // semi-transparent
    ].join('\n')

    const result = parseOFF(encodeOFF(off))

    expect(result.colors).not.toBeNull()
    for (let v = 0; v < 3; v++) {
      expect(result.colors![v * 4 + 0]).toBeCloseTo(0.2)
      expect(result.colors![v * 4 + 1]).toBeCloseTo(0.4)
      expect(result.colors![v * 4 + 2]).toBeCloseTo(0.6)
      expect(result.colors![v * 4 + 3]).toBeCloseTo(0.5)
    }
  })

  it('normalizes 0–255 integer colors into the 0–1 float range', () => {
    // Some OFF exporters write byte-range RGB — the parser must detect and
    // rescale so Three.js materials display the correct color.
    const off = [
      'OFF',
      '3 1 0',
      '0 0 0',
      '1 0 0',
      '0 1 0',
      '3 0 1 2 255 128 0 1', // orange, bytes
    ].join('\n')

    const result = parseOFF(encodeOFF(off))

    expect(result.colors).not.toBeNull()
    expect(result.colors![0]).toBeCloseTo(1.0, 2)     // 255/255
    expect(result.colors![1]).toBeCloseTo(0.502, 2)   // 128/255
    expect(result.colors![2]).toBeCloseTo(0.0, 2)
    // Alpha is *not* rescaled — it's already in 0–1 range in every format we emit.
    expect(result.colors![3]).toBeCloseTo(1.0)
  })

  it('tolerates different face vertex counts (quads fan-triangulated with color)', () => {
    // A single quad with a blue color — must expand into 2 triangles, each
    // carrying the quad's color on every vertex.
    const off = [
      'OFF',
      '4 1 0',
      '0 0 0',
      '1 0 0',
      '1 1 0',
      '0 1 0',
      '4 0 1 2 3 0.0 0.0 1.0 1.0',
    ].join('\n')

    const result = parseOFF(encodeOFF(off))

    // Fan-triangulation: quad -> 2 triangles -> 6 vertices.
    expect(result.positions.length).toBe(6 * 3)
    expect(result.colors).not.toBeNull()
    expect(result.colors!.length).toBe(6 * 4)

    for (let v = 0; v < 6; v++) {
      expect(result.colors![v * 4 + 0]).toBeCloseTo(0.0)
      expect(result.colors![v * 4 + 1]).toBeCloseTo(0.0)
      expect(result.colors![v * 4 + 2]).toBeCloseTo(1.0)
    }
  })

  it('returns colors=null when no face has color data (vertex colors disabled)', () => {
    // Without colors the viewer must fall back to its default material.
    const off = [
      'OFF',
      '3 1 0',
      '0 0 0',
      '1 0 0',
      '0 1 0',
      '3 0 1 2', // no trailing RGB
    ].join('\n')

    const result = parseOFF(encodeOFF(off))

    expect(result.colors).toBeNull()
    expect(result.positions.length).toBe(3 * 3)
  })

  it('produces identical color output across repeated parses of the same OFF (re-render stability)', () => {
    // F-003 R3 acceptance criterion: "Colors are not reset to default material
    // on geometry update." Each re-render feeds a fresh ArrayBuffer to the
    // viewer. We simulate that by parsing the same OFF twice and confirming
    // the color arrays are byte-identical — proving the pipeline is stateless
    // and deterministic, so repeated renders yield the same colored result.
    const off = [
      'OFF',
      '3 1 0',
      '0 0 0',
      '1 0 0',
      '0 1 0',
      '3 0 1 2 0.8 0.2 0.4 1',
    ].join('\n')

    const first  = parseOFF(encodeOFF(off))
    const second = parseOFF(encodeOFF(off))

    expect(first.colors).not.toBeNull()
    expect(second.colors).not.toBeNull()
    expect(Array.from(second.colors!)).toEqual(Array.from(first.colors!))
  })

  it('survives sequential renders with different colors (change-over-render stability)', () => {
    // Simulates the user editing a color() value and triggering a re-render:
    // the new OFF arrives with a different color and the parser must reflect
    // that — not cache or reuse state from the previous parse.
    const makeOFF = (r: number, g: number, b: number) => [
      'OFF',
      '3 1 0',
      '0 0 0',
      '1 0 0',
      '0 1 0',
      `3 0 1 2 ${r} ${g} ${b} 1`,
    ].join('\n')

    const red   = parseOFF(encodeOFF(makeOFF(1, 0, 0)))
    const green = parseOFF(encodeOFF(makeOFF(0, 1, 0)))
    const blue  = parseOFF(encodeOFF(makeOFF(0, 0, 1)))

    expect(red.colors![0]).toBeCloseTo(1.0)
    expect(red.colors![1]).toBeCloseTo(0.0)

    expect(green.colors![0]).toBeCloseTo(0.0)
    expect(green.colors![1]).toBeCloseTo(1.0)

    expect(blue.colors![2]).toBeCloseTo(1.0)
  })

  it('handles the header+counts-on-separate-lines variant (matches OpenSCAD output)', () => {
    // OpenSCAD writes `OFF\n<numVerts> <numFaces> <numEdges>\n...`. The parser
    // must not require counts to sit on the header line.
    const off = [
      'OFF',
      '',
      '# generated by OpenSCAD',
      '3 1 0',
      '0 0 0',
      '1 0 0',
      '0 1 0',
      '3 0 1 2 0.5 0.5 0.5',
    ].join('\n')

    const result = parseOFF(encodeOFF(off))
    expect(result.colors).not.toBeNull()
    expect(result.colors![0]).toBeCloseTo(0.5)
  })
})
