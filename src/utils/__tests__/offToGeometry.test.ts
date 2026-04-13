/**
 * Integration-style tests for F-003 R3 — Color Persistence.
 *
 * The OFF viewer in `PreviewPanel.tsx` takes the output of `parseOFF` and
 * builds a `THREE.BufferGeometry` whose `color` attribute carries per-vertex
 * RGB values, paired with a `MeshStandardMaterial({ vertexColors: true })`.
 *
 * These tests reproduce that exact conversion logic in isolation — any
 * regression here means colors won't reach the GPU and the preview will show
 * the default gray material instead of user-applied colors.
 */

import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { parseOFF } from '../parseOFF'

function encodeOFF(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer as ArrayBuffer
}

/**
 * Mirrors the OFFViewer conversion in `PreviewPanel.tsx`:
 * RGBA -> RGB per-vertex color attribute on a BufferGeometry.
 */
function buildColoredGeometry(buffer: ArrayBuffer): THREE.BufferGeometry | null {
  const parsed = parseOFF(buffer)
  if (parsed.positions.length === 0) return null

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(parsed.positions, 3))
  geometry.setAttribute('normal',   new THREE.BufferAttribute(parsed.normals,   3))

  if (parsed.colors) {
    const numVerts = parsed.positions.length / 3
    const rgb = new Float32Array(numVerts * 3)
    for (let i = 0; i < numVerts; i++) {
      rgb[i * 3]     = parsed.colors[i * 4]
      rgb[i * 3 + 1] = parsed.colors[i * 4 + 1]
      rgb[i * 3 + 2] = parsed.colors[i * 4 + 2]
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(rgb, 3))
  }

  return geometry
}

describe('OFF → BufferGeometry color pipeline (F-003 R3)', () => {
  it('attaches a `color` attribute when the OFF has face colors', () => {
    const off = [
      'OFF',
      '3 1 0',
      '0 0 0',
      '1 0 0',
      '0 1 0',
      '3 0 1 2 0.9 0.1 0.3 1',
    ].join('\n')

    const geom = buildColoredGeometry(encodeOFF(off))!
    const colorAttr = geom.getAttribute('color') as THREE.BufferAttribute | undefined
    expect(colorAttr).toBeDefined()
    expect(colorAttr!.itemSize).toBe(3)
    expect(colorAttr!.count).toBe(3)

    // All 3 vertices carry the same face color.
    for (let i = 0; i < 3; i++) {
      expect(colorAttr!.getX(i)).toBeCloseTo(0.9)
      expect(colorAttr!.getY(i)).toBeCloseTo(0.1)
      expect(colorAttr!.getZ(i)).toBeCloseTo(0.3)
    }
  })

  it('omits the `color` attribute when the OFF has no color data', () => {
    const off = [
      'OFF',
      '3 1 0',
      '0 0 0',
      '1 0 0',
      '0 1 0',
      '3 0 1 2',
    ].join('\n')

    const geom = buildColoredGeometry(encodeOFF(off))!
    expect(geom.getAttribute('color')).toBeUndefined()
  })

  it('pairs with a `vertexColors: true` material without errors', () => {
    // Sanity: the material contract the viewer relies on accepts our geometry.
    const off = [
      'OFF',
      '3 1 0',
      '0 0 0',
      '1 0 0',
      '0 1 0',
      '3 0 1 2 0.2 0.7 0.9 1',
    ].join('\n')

    const geom = buildColoredGeometry(encodeOFF(off))!
    const material = new THREE.MeshStandardMaterial({ vertexColors: true })
    const mesh = new THREE.Mesh(geom, material)

    expect(mesh.geometry.getAttribute('color')).toBeDefined()
    expect((mesh.material as THREE.MeshStandardMaterial).vertexColors).toBe(true)
  })

  it('preserves per-face colors across two consecutive renders of a two-face mesh', () => {
    // Simulates re-render: feed the same scene twice, confirm both runs deliver
    // the same vertex colors (no state leakage between renders).
    const off = [
      'OFF',
      '4 2 0',
      '0 0 0',
      '1 0 0',
      '1 1 0',
      '0 1 0',
      '3 0 1 2 1 0 0 1', // red
      '3 0 2 3 0 0 1 1', // blue
    ].join('\n')

    const g1 = buildColoredGeometry(encodeOFF(off))!
    const g2 = buildColoredGeometry(encodeOFF(off))!

    const c1 = Array.from((g1.getAttribute('color') as THREE.BufferAttribute).array)
    const c2 = Array.from((g2.getAttribute('color') as THREE.BufferAttribute).array)
    expect(c2).toEqual(c1)

    // First triangle (verts 0..2) is red.
    for (let v = 0; v < 3; v++) {
      expect(c1[v * 3 + 0]).toBeCloseTo(1)
      expect(c1[v * 3 + 2]).toBeCloseTo(0)
    }
    // Second triangle (verts 3..5) is blue.
    for (let v = 3; v < 6; v++) {
      expect(c1[v * 3 + 0]).toBeCloseTo(0)
      expect(c1[v * 3 + 2]).toBeCloseTo(1)
    }
  })
})
