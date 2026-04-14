import { describe, it, expect } from 'vitest'
import type { Node } from '@xyflow/react'
import type { CodegenContext } from '@/types/nodePack'

import { shapes3dCodegen } from '../codegen/shapes3dCodegen'
import { shapes2dCodegen } from '../codegen/shapes2dCodegen'
import { transformsCodegen } from '../codegen/transformsCodegen'
import { distributorsCodegen } from '../codegen/distributorsCodegen'
import { roundingCodegen } from '../codegen/roundingCodegen'
import { mechanicalCodegen } from '../codegen/mechanicalCodegen'
import { attachmentsCodegen } from '../codegen/attachmentsCodegen'
import { bosl2Preamble } from '../preamble'

import { SHAPES3D_PALETTE } from '../palette/shapes3dPalette'
import { SHAPES2D_PALETTE } from '../palette/shapes2dPalette'
import { TRANSFORMS_PALETTE, DISTRIBUTORS_PALETTE } from '../palette/transformsPalette'
import { ROUNDING_PALETTE } from '../palette/roundingPalette'
import { MECHANICAL_PALETTE } from '../palette/mechanicalPalette'
import { ATTACHMENTS_PALETTE } from '../palette/attachmentsPalette'

// ─── Mock CodegenContext ──────────────────────────────────────────────────────

const mockCtx: CodegenContext = {
  pad: '  ',
  num: (v) => (typeof v === 'number' ? v : parseFloat(String(v)) || 0),
  expr: (v) => (typeof v === 'number' ? String(v) : String(v ?? '0').trim() || '0'),
  bool: (v) => (v ? 'true' : 'false'),
  escapeString: (v) =>
    String(v ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"'),
  sanitizeIdentifier: (raw, fallback = 'value') => {
    const s = String(raw ?? '').replace(/[^a-zA-Z0-9_]/g, '_')
    return s || fallback
  },
  resolveValueInput: (_index, fallback) => fallback,
  getAllChildren: () => '    // No children connected\n',
  getChild: () => '',
  hasChild: () => false,
  emitTransform: (header) => `  ${header} {\n    // No children connected\n  }\n`,
}

// ─── Helper: create a mock Node from palette defaults ─────────────────────────

function mockNode(type: string, data: Record<string, unknown>): Node {
  return {
    id: `test-${type}`,
    type,
    position: { x: 0, y: 0 },
    data,
  }
}

// ─── Collect all handlers and palette items ───────────────────────────────────

const allHandlers: Record<string, (node: Node, ctx: CodegenContext) => string> = {
  ...shapes3dCodegen,
  ...shapes2dCodegen,
  ...transformsCodegen,
  ...distributorsCodegen,
  ...roundingCodegen,
  ...mechanicalCodegen,
  ...attachmentsCodegen,
}

const allPaletteItems = [
  ...SHAPES3D_PALETTE,
  ...SHAPES2D_PALETTE,
  ...TRANSFORMS_PALETTE,
  ...DISTRIBUTORS_PALETTE,
  ...ROUNDING_PALETTE,
  ...MECHANICAL_PALETTE,
  ...ATTACHMENTS_PALETTE,
]

const paletteByType = Object.fromEntries(allPaletteItems.map((p) => [p.type, p]))

// ═══════════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('BOSL2 Codegen Handlers', () => {
  // ─── Smoke test: every handler produces non-empty output with defaults ──────

  describe('All handlers produce valid output with default data', () => {
    for (const [type, handler] of Object.entries(allHandlers)) {
      it(`${type} produces non-empty output`, () => {
        const palette = paletteByType[type]
        expect(palette).toBeDefined()
        const node = mockNode(type, { ...palette.defaultData })
        const result = handler(node, mockCtx)
        expect(result).toBeTruthy()
        expect(result.length).toBeGreaterThan(0)
        expect(result.trim()).not.toBe('')
      })
    }
  })

  // ─── Verify handler ↔ palette coverage ──────────────────────────────────────

  describe('Handler–palette coverage', () => {
    it('every palette item has a matching codegen handler', () => {
      for (const item of allPaletteItems) {
        expect(allHandlers[item.type]).toBeDefined()
      }
    })

    it('every codegen handler has a matching palette item', () => {
      for (const type of Object.keys(allHandlers)) {
        expect(paletteByType[type]).toBeDefined()
      }
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // Tier 1: 3D Shapes
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Tier 1 – 3D Shapes', () => {
    it('cuboid – default output', () => {
      const node = mockNode('bosl2_cuboid', { x: 10, y: 10, z: 10, rounding: 0, chamfer: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_cuboid(node, mockCtx)
      expect(result).toBe('  cuboid([10, 10, 10]);\n')
    })

    it('cuboid – with rounding and chamfer', () => {
      const node = mockNode('bosl2_cuboid', { x: 20, y: 15, z: 5, rounding: 2, chamfer: 1, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_cuboid(node, mockCtx)
      expect(result).toBe('  cuboid([20, 15, 5], rounding = 2, chamfer = 1);\n')
    })

    it('cuboid – with non-default anchor/spin/orient', () => {
      const node = mockNode('bosl2_cuboid', { x: 10, y: 10, z: 10, rounding: 0, chamfer: 0, anchor: 'BOT', spin: 45, orient: 'FWD' })
      const result = shapes3dCodegen.bosl2_cuboid(node, mockCtx)
      expect(result).toBe('  cuboid([10, 10, 10], anchor = BOT, spin = 45, orient = FWD);\n')
    })

    it('cyl – default output (equal r1/r2 uses r)', () => {
      const node = mockNode('bosl2_cyl', { h: 10, r: 5, r1: 5, r2: 5, chamfer: 0, rounding: 0, circum: false, fn: 32, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_cyl(node, mockCtx)
      expect(result).toBe('  cyl(h = 10, r = 5);\n')
    })

    it('cyl – different r1/r2 produces cone', () => {
      const node = mockNode('bosl2_cyl', { h: 20, r: 5, r1: 10, r2: 3, chamfer: 0, rounding: 0, circum: false, fn: 32, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_cyl(node, mockCtx)
      expect(result).toBe('  cyl(h = 20, r1 = 10, r2 = 3);\n')
    })

    it('cyl – with chamfer, rounding, circum, fn', () => {
      const node = mockNode('bosl2_cyl', { h: 10, r: 5, r1: 5, r2: 5, chamfer: 1, rounding: 2, circum: true, fn: 64, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_cyl(node, mockCtx)
      expect(result).toBe('  cyl(h = 10, r = 5, chamfer = 1, rounding = 2, circum = true, $fn = 64);\n')
    })

    it('spheroid – default', () => {
      const node = mockNode('bosl2_spheroid', { r: 10, style: 'aligned', circum: false, fn: 32, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_spheroid(node, mockCtx)
      expect(result).toBe('  spheroid(r = 10);\n')
    })

    it('spheroid – with style and circum', () => {
      const node = mockNode('bosl2_spheroid', { r: 15, style: 'icosa', circum: true, fn: 64, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_spheroid(node, mockCtx)
      expect(result).toBe('  spheroid(r = 15, style = "icosa", circum = true, $fn = 64);\n')
    })

    it('torus – default', () => {
      const node = mockNode('bosl2_torus', { r_maj: 20, r_min: 5, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_torus(node, mockCtx)
      expect(result).toBe('  torus(r_maj = 20, r_min = 5);\n')
    })

    it('tube – default', () => {
      const node = mockNode('bosl2_tube', { h: 20, or: 10, ir: 8, wall: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_tube(node, mockCtx)
      expect(result).toBe('  tube(h = 20, or = 10, ir = 8);\n')
    })

    it('tube – with wall', () => {
      const node = mockNode('bosl2_tube', { h: 20, or: 10, ir: 0, wall: 2, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_tube(node, mockCtx)
      expect(result).toBe('  tube(h = 20, or = 10, wall = 2);\n')
    })

    it('prismoid – default', () => {
      const node = mockNode('bosl2_prismoid', { size1_x: 20, size1_y: 20, size2_x: 10, size2_y: 10, h: 15, shift_x: 0, shift_y: 0, rounding: 0, chamfer: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_prismoid(node, mockCtx)
      expect(result).toBe('  prismoid([20, 20], [10, 10], h = 15);\n')
    })

    it('prismoid – with shift and rounding', () => {
      const node = mockNode('bosl2_prismoid', { size1_x: 20, size1_y: 20, size2_x: 10, size2_y: 10, h: 15, shift_x: 5, shift_y: 3, rounding: 2, chamfer: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_prismoid(node, mockCtx)
      expect(result).toBe('  prismoid([20, 20], [10, 10], h = 15, shift = [5, 3], rounding = 2);\n')
    })

    it('wedge – default', () => {
      const node = mockNode('bosl2_wedge', { x: 10, y: 10, z: 10, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_wedge(node, mockCtx)
      expect(result).toBe('  wedge([10, 10, 10]);\n')
    })

    it('pie_slice – default', () => {
      const node = mockNode('bosl2_pie_slice', { h: 10, r: 10, ang: 90, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_pie_slice(node, mockCtx)
      expect(result).toBe('  pie_slice(h = 10, r = 10, ang = 90);\n')
    })

    it('teardrop – default', () => {
      const node = mockNode('bosl2_teardrop', { h: 10, r: 5, ang: 45, cap_h: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_teardrop(node, mockCtx)
      expect(result).toBe('  teardrop(h = 10, r = 5);\n')
    })

    it('teardrop – with custom angle and cap', () => {
      const node = mockNode('bosl2_teardrop', { h: 10, r: 5, ang: 60, cap_h: 3, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_teardrop(node, mockCtx)
      expect(result).toBe('  teardrop(h = 10, r = 5, ang = 60, cap_h = 3);\n')
    })

    it('onion – default', () => {
      const node = mockNode('bosl2_onion', { r: 10, ang: 45, cap_h: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_onion(node, mockCtx)
      expect(result).toBe('  onion(r = 10);\n')
    })

    it('rect_tube – default', () => {
      const node = mockNode('bosl2_rect_tube', { h: 20, size_x: 20, size_y: 20, isize_x: 16, isize_y: 16, wall: 0, rounding: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_rect_tube(node, mockCtx)
      expect(result).toBe('  rect_tube(h = 20, size = [20, 20], isize = [16, 16]);\n')
    })

    it('octahedron – default', () => {
      const node = mockNode('bosl2_octahedron', { size: 20, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_octahedron(node, mockCtx)
      expect(result).toBe('  octahedron(size = 20);\n')
    })

    it('regular_prism – default', () => {
      const node = mockNode('bosl2_regular_prism', { n: 6, h: 10, r: 5, rounding: 0, chamfer: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_regular_prism(node, mockCtx)
      expect(result).toBe('  regular_prism(n = 6, h = 10, r = 5);\n')
    })

    it('text3d – default', () => {
      const node = mockNode('bosl2_text3d', { text: 'Hello', h: 2, size: 10, font: 'Liberation Sans', anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_text3d(node, mockCtx)
      expect(result).toBe('  text3d("Hello", h = 2, size = 10, font = "Liberation Sans");\n')
    })

    it('fillet – default', () => {
      const node = mockNode('bosl2_fillet', { h: 10, r: 3, ang: 90, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_fillet(node, mockCtx)
      expect(result).toBe('  fillet(h = 10, r = 3);\n')
    })

    it('fillet – with custom angle', () => {
      const node = mockNode('bosl2_fillet', { h: 10, r: 3, ang: 45, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = shapes3dCodegen.bosl2_fillet(node, mockCtx)
      expect(result).toBe('  fillet(h = 10, r = 3, ang = 45);\n')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // Tier 2: 2D Shapes
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Tier 2 – 2D Shapes', () => {
    it('rect – default', () => {
      const node = mockNode('bosl2_rect', { x: 20, y: 10, rounding: 0, chamfer: 0, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_rect(node, mockCtx)
      expect(result).toBe('  rect([20, 10]);\n')
    })

    it('rect – with rounding', () => {
      const node = mockNode('bosl2_rect', { x: 20, y: 10, rounding: 3, chamfer: 0, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_rect(node, mockCtx)
      expect(result).toBe('  rect([20, 10], rounding = 3);\n')
    })

    it('ellipse – default', () => {
      const node = mockNode('bosl2_ellipse', { rx: 10, ry: 5, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_ellipse(node, mockCtx)
      expect(result).toBe('  ellipse(r = [10, 5]);\n')
    })

    it('regular_ngon – default', () => {
      const node = mockNode('bosl2_regular_ngon', { n: 6, r: 10, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_regular_ngon(node, mockCtx)
      expect(result).toBe('  regular_ngon(n = 6, r = 10);\n')
    })

    it('pentagon – default', () => {
      const node = mockNode('bosl2_pentagon', { r: 10, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_pentagon(node, mockCtx)
      expect(result).toBe('  pentagon(r = 10);\n')
    })

    it('hexagon – default', () => {
      const node = mockNode('bosl2_hexagon', { r: 10, rounding: 0, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_hexagon(node, mockCtx)
      expect(result).toBe('  hexagon(r = 10);\n')
    })

    it('hexagon – with rounding', () => {
      const node = mockNode('bosl2_hexagon', { r: 10, rounding: 2, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_hexagon(node, mockCtx)
      expect(result).toBe('  hexagon(r = 10, rounding = 2);\n')
    })

    it('octagon – default', () => {
      const node = mockNode('bosl2_octagon', { r: 10, rounding: 0, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_octagon(node, mockCtx)
      expect(result).toBe('  octagon(r = 10);\n')
    })

    it('star – default', () => {
      const node = mockNode('bosl2_star', { n: 5, r: 10, ir: 5, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_star(node, mockCtx)
      expect(result).toBe('  star(n = 5, r = 10, ir = 5);\n')
    })

    it('trapezoid – default', () => {
      const node = mockNode('bosl2_trapezoid', { h: 10, w1: 20, w2: 10, rounding: 0, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_trapezoid(node, mockCtx)
      expect(result).toBe('  trapezoid(h = 10, w1 = 20, w2 = 10);\n')
    })

    it('right_triangle – default', () => {
      const node = mockNode('bosl2_right_triangle', { x: 10, y: 10, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_right_triangle(node, mockCtx)
      expect(result).toBe('  right_triangle([10, 10]);\n')
    })

    it('teardrop2d – default', () => {
      const node = mockNode('bosl2_teardrop2d', { r: 10, ang: 45, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_teardrop2d(node, mockCtx)
      expect(result).toBe('  teardrop2d(r = 10);\n')
    })

    it('teardrop2d – with custom angle', () => {
      const node = mockNode('bosl2_teardrop2d', { r: 10, ang: 60, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_teardrop2d(node, mockCtx)
      expect(result).toBe('  teardrop2d(r = 10, ang = 60);\n')
    })

    it('squircle – default', () => {
      const node = mockNode('bosl2_squircle', { x: 20, y: 20, squareness: 0.5, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_squircle(node, mockCtx)
      expect(result).toBe('  squircle([20, 20]);\n')
    })

    it('squircle – custom squareness', () => {
      const node = mockNode('bosl2_squircle', { x: 20, y: 20, squareness: 0.8, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_squircle(node, mockCtx)
      expect(result).toBe('  squircle([20, 20], squareness = 0.8);\n')
    })

    it('ring – default', () => {
      const node = mockNode('bosl2_ring', { n: 36, r1: 10, r2: 8, anchor: 'CENTER', spin: 0 })
      const result = shapes2dCodegen.bosl2_ring(node, mockCtx)
      expect(result).toBe('  ring(n = 36, r1 = 10, r2 = 8);\n')
    })

    it('2D shapes respect spin parameter', () => {
      const node = mockNode('bosl2_pentagon', { r: 10, anchor: 'CENTER', spin: 30 })
      const result = shapes2dCodegen.bosl2_pentagon(node, mockCtx)
      expect(result).toBe('  pentagon(r = 10, spin = 30);\n')
    })

    it('2D shapes respect non-default anchor', () => {
      const node = mockNode('bosl2_rect', { x: 20, y: 10, rounding: 0, chamfer: 0, anchor: 'LEFT', spin: 0 })
      const result = shapes2dCodegen.bosl2_rect(node, mockCtx)
      expect(result).toBe('  rect([20, 10], anchor = LEFT);\n')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // Tier 3: Transforms
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Tier 3 – Transforms', () => {
    it('move – exact output', () => {
      const node = mockNode('bosl2_move', { x: 10, y: 20, z: 30 })
      const result = transformsCodegen.bosl2_move(node, mockCtx)
      expect(result).toBe('  move([10, 20, 30]) {\n    // No children connected\n  }\n')
    })

    it('left – default', () => {
      const node = mockNode('bosl2_left', { d: 10 })
      const result = transformsCodegen.bosl2_left(node, mockCtx)
      expect(result).toContain('left(10)')
    })

    it('right – default', () => {
      const node = mockNode('bosl2_right', { d: 10 })
      const result = transformsCodegen.bosl2_right(node, mockCtx)
      expect(result).toContain('right(10)')
    })

    it('fwd – default', () => {
      const node = mockNode('bosl2_fwd', { d: 10 })
      const result = transformsCodegen.bosl2_fwd(node, mockCtx)
      expect(result).toContain('fwd(10)')
    })

    it('back – default', () => {
      const node = mockNode('bosl2_back', { d: 10 })
      const result = transformsCodegen.bosl2_back(node, mockCtx)
      expect(result).toContain('back(10)')
    })

    it('up – default', () => {
      const node = mockNode('bosl2_up', { d: 10 })
      const result = transformsCodegen.bosl2_up(node, mockCtx)
      expect(result).toContain('up(10)')
    })

    it('down – default', () => {
      const node = mockNode('bosl2_down', { d: 10 })
      const result = transformsCodegen.bosl2_down(node, mockCtx)
      expect(result).toContain('down(10)')
    })

    it('rot – default (no axis = simple angle)', () => {
      const node = mockNode('bosl2_rot', { a: 0, vx: 0, vy: 0, vz: 0 })
      const result = transformsCodegen.bosl2_rot(node, mockCtx)
      expect(result).toContain('rot(0)')
    })

    it('rot – with axis vector', () => {
      const node = mockNode('bosl2_rot', { a: 45, vx: 1, vy: 0, vz: 0 })
      const result = transformsCodegen.bosl2_rot(node, mockCtx)
      expect(result).toContain('rot(a = 45, v = [1, 0, 0])')
    })

    it('xrot – default', () => {
      const node = mockNode('bosl2_xrot', { a: 0 })
      const result = transformsCodegen.bosl2_xrot(node, mockCtx)
      expect(result).toContain('xrot(0)')
    })

    it('yrot – default', () => {
      const node = mockNode('bosl2_yrot', { a: 0 })
      const result = transformsCodegen.bosl2_yrot(node, mockCtx)
      expect(result).toContain('yrot(0)')
    })

    it('zrot – default', () => {
      const node = mockNode('bosl2_zrot', { a: 0 })
      const result = transformsCodegen.bosl2_zrot(node, mockCtx)
      expect(result).toContain('zrot(0)')
    })

    it('xscale – default', () => {
      const node = mockNode('bosl2_xscale', { factor: 1 })
      const result = transformsCodegen.bosl2_xscale(node, mockCtx)
      expect(result).toContain('xscale(1)')
    })

    it('yscale – default', () => {
      const node = mockNode('bosl2_yscale', { factor: 1 })
      const result = transformsCodegen.bosl2_yscale(node, mockCtx)
      expect(result).toContain('yscale(1)')
    })

    it('zscale – default', () => {
      const node = mockNode('bosl2_zscale', { factor: 1 })
      const result = transformsCodegen.bosl2_zscale(node, mockCtx)
      expect(result).toContain('zscale(1)')
    })

    it('xflip – default (no offset)', () => {
      const node = mockNode('bosl2_xflip', { offset: 0 })
      const result = transformsCodegen.bosl2_xflip(node, mockCtx)
      expect(result).toContain('xflip()')
    })

    it('xflip – with offset', () => {
      const node = mockNode('bosl2_xflip', { offset: 5 })
      const result = transformsCodegen.bosl2_xflip(node, mockCtx)
      expect(result).toContain('xflip(x = 5)')
    })

    it('yflip – default', () => {
      const node = mockNode('bosl2_yflip', { offset: 0 })
      const result = transformsCodegen.bosl2_yflip(node, mockCtx)
      expect(result).toContain('yflip()')
    })

    it('yflip – with offset', () => {
      const node = mockNode('bosl2_yflip', { offset: 5 })
      const result = transformsCodegen.bosl2_yflip(node, mockCtx)
      expect(result).toContain('yflip(y = 5)')
    })

    it('zflip – default', () => {
      const node = mockNode('bosl2_zflip', { offset: 0 })
      const result = transformsCodegen.bosl2_zflip(node, mockCtx)
      expect(result).toContain('zflip()')
    })

    it('zflip – with offset', () => {
      const node = mockNode('bosl2_zflip', { offset: 5 })
      const result = transformsCodegen.bosl2_zflip(node, mockCtx)
      expect(result).toContain('zflip(z = 5)')
    })

    it('skew – all zeros (empty params)', () => {
      const node = mockNode('bosl2_skew', { sxy: 0, sxz: 0, syx: 0, syz: 0, szx: 0, szy: 0 })
      const result = transformsCodegen.bosl2_skew(node, mockCtx)
      expect(result).toContain('skew()')
    })

    it('skew – with non-zero values', () => {
      const node = mockNode('bosl2_skew', { sxy: 0.5, sxz: 0, syx: 0, syz: 0.3, szx: 0, szy: 0 })
      const result = transformsCodegen.bosl2_skew(node, mockCtx)
      expect(result).toContain('skew(sxy = 0.5, syz = 0.3)')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // Tier 3: Distributors
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Tier 3 – Distributors', () => {
    it('xcopies – default (n=3 shown)', () => {
      const node = mockNode('bosl2_xcopies', { spacing: 10, n: 3 })
      const result = distributorsCodegen.bosl2_xcopies(node, mockCtx)
      expect(result).toContain('xcopies(spacing = 10, n = 3)')
    })

    it('xcopies – n=2 is default, omitted', () => {
      const node = mockNode('bosl2_xcopies', { spacing: 10, n: 2 })
      const result = distributorsCodegen.bosl2_xcopies(node, mockCtx)
      expect(result).toContain('xcopies(spacing = 10)')
      expect(result).not.toContain('n =')
    })

    it('ycopies – default', () => {
      const node = mockNode('bosl2_ycopies', { spacing: 10, n: 3 })
      const result = distributorsCodegen.bosl2_ycopies(node, mockCtx)
      expect(result).toContain('ycopies(spacing = 10, n = 3)')
    })

    it('zcopies – default', () => {
      const node = mockNode('bosl2_zcopies', { spacing: 10, n: 3 })
      const result = distributorsCodegen.bosl2_zcopies(node, mockCtx)
      expect(result).toContain('zcopies(spacing = 10, n = 3)')
    })

    it('grid_copies – default', () => {
      const node = mockNode('bosl2_grid_copies', { spacing_x: 10, spacing_y: 10, n_x: 3, n_y: 3, stagger: false })
      const result = distributorsCodegen.bosl2_grid_copies(node, mockCtx)
      expect(result).toContain('grid_copies(spacing = [10, 10], n = [3, 3])')
    })

    it('grid_copies – with stagger', () => {
      const node = mockNode('bosl2_grid_copies', { spacing_x: 10, spacing_y: 10, n_x: 3, n_y: 3, stagger: true })
      const result = distributorsCodegen.bosl2_grid_copies(node, mockCtx)
      expect(result).toContain('stagger = true')
    })

    it('rot_copies – default', () => {
      const node = mockNode('bosl2_rot_copies', { n: 6, sa: 0 })
      const result = distributorsCodegen.bosl2_rot_copies(node, mockCtx)
      expect(result).toContain('rot_copies(n = 6)')
    })

    it('rot_copies – with start angle', () => {
      const node = mockNode('bosl2_rot_copies', { n: 6, sa: 15 })
      const result = distributorsCodegen.bosl2_rot_copies(node, mockCtx)
      expect(result).toContain('rot_copies(n = 6, sa = 15)')
    })

    it('arc_copies – default', () => {
      const node = mockNode('bosl2_arc_copies', { n: 6, r: 20, sa: 0, ea: 360 })
      const result = distributorsCodegen.bosl2_arc_copies(node, mockCtx)
      expect(result).toContain('arc_copies(n = 6, r = 20)')
    })

    it('arc_copies – with custom angles', () => {
      const node = mockNode('bosl2_arc_copies', { n: 4, r: 30, sa: 10, ea: 180 })
      const result = distributorsCodegen.bosl2_arc_copies(node, mockCtx)
      expect(result).toContain('arc_copies(n = 4, r = 30, sa = 10, ea = 180)')
    })

    it('mirror_copy – default', () => {
      const node = mockNode('bosl2_mirror_copy', { vx: 1, vy: 0, vz: 0, offset: 0 })
      const result = distributorsCodegen.bosl2_mirror_copy(node, mockCtx)
      expect(result).toContain('mirror_copy([1, 0, 0])')
    })

    it('mirror_copy – with offset', () => {
      const node = mockNode('bosl2_mirror_copy', { vx: 1, vy: 0, vz: 0, offset: 5 })
      const result = distributorsCodegen.bosl2_mirror_copy(node, mockCtx)
      expect(result).toContain('mirror_copy([1, 0, 0], offset = 5)')
    })

    it('path_copies – default', () => {
      const node = mockNode('bosl2_path_copies', { path: '[]', n: 0, closed: false })
      const result = distributorsCodegen.bosl2_path_copies(node, mockCtx)
      expect(result).toContain('path_copies([])')
    })

    it('path_copies – with closed', () => {
      const node = mockNode('bosl2_path_copies', { path: '[[0,0],[10,0],[10,10]]', n: 3, closed: true })
      const result = distributorsCodegen.bosl2_path_copies(node, mockCtx)
      expect(result).toContain('n = 3')
      expect(result).toContain('closed = true')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // Tier 4: Rounding, Masks, Sweeps
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Tier 4 – Rounding, Masks, Sweeps', () => {
    it('offset_sweep – default', () => {
      const node = mockNode('bosl2_offset_sweep', { height: 10, top_r: 1, bot_r: 1, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = roundingCodegen.bosl2_offset_sweep(node, mockCtx)
      expect(result).toContain('offset_sweep(height = 10, top = os_circle(r = 1), bottom = os_circle(r = 1))')
    })

    it('offset_sweep – zero radii omitted', () => {
      const node = mockNode('bosl2_offset_sweep', { height: 10, top_r: 0, bot_r: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = roundingCodegen.bosl2_offset_sweep(node, mockCtx)
      expect(result).toContain('offset_sweep(height = 10)')
      expect(result).not.toContain('os_circle')
    })

    it('rounded_prism – default', () => {
      const node = mockNode('bosl2_rounded_prism', { height: 10, joint_top: 1, joint_bot: 1, joint_sides: 1, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = roundingCodegen.bosl2_rounded_prism(node, mockCtx)
      expect(result).toContain('rounded_prism(height = 10, joint_top = 1, joint_bot = 1, joint_sides = 1)')
    })

    it('skin – default', () => {
      const node = mockNode('bosl2_skin', { slices: 10, method: 'reindex', style: 'min_edge' })
      const result = roundingCodegen.bosl2_skin(node, mockCtx)
      expect(result).toContain('skin(slices = 10)')
    })

    it('skin – custom method and style', () => {
      const node = mockNode('bosl2_skin', { slices: 20, method: 'distance', style: 'convex' })
      const result = roundingCodegen.bosl2_skin(node, mockCtx)
      expect(result).toContain('skin(slices = 20, method = "distance", style = "convex")')
    })

    it('linear_sweep – default', () => {
      const node = mockNode('bosl2_linear_sweep', { height: 10, twist: 0, scale: 1, slices: 0, center: false, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = roundingCodegen.bosl2_linear_sweep(node, mockCtx)
      expect(result).toContain('linear_sweep(height = 10)')
    })

    it('linear_sweep – with twist, scale, center', () => {
      const node = mockNode('bosl2_linear_sweep', { height: 20, twist: 90, scale: 0.5, slices: 40, center: true, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = roundingCodegen.bosl2_linear_sweep(node, mockCtx)
      expect(result).toContain('twist = 90')
      expect(result).toContain('scale = 0.5')
      expect(result).toContain('slices = 40')
      expect(result).toContain('center = true')
    })

    it('rotate_sweep – default (360 omitted)', () => {
      const node = mockNode('bosl2_rotate_sweep', { angle: 360, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = roundingCodegen.bosl2_rotate_sweep(node, mockCtx)
      expect(result).toContain('rotate_sweep(')
      expect(result).not.toContain('angle =')
    })

    it('rotate_sweep – custom angle', () => {
      const node = mockNode('bosl2_rotate_sweep', { angle: 180, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = roundingCodegen.bosl2_rotate_sweep(node, mockCtx)
      expect(result).toContain('angle = 180')
    })

    it('path_sweep – default', () => {
      const node = mockNode('bosl2_path_sweep', { method: 'incremental', twist: 0, closed: false, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = roundingCodegen.bosl2_path_sweep(node, mockCtx)
      expect(result).toContain('path_sweep(')
    })

    it('path_sweep – with twist and closed', () => {
      const node = mockNode('bosl2_path_sweep', { method: 'natural', twist: 180, closed: true, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = roundingCodegen.bosl2_path_sweep(node, mockCtx)
      expect(result).toContain('method = "natural"')
      expect(result).toContain('twist = 180')
      expect(result).toContain('closed = true')
    })

    it('spiral_sweep – default', () => {
      const node = mockNode('bosl2_spiral_sweep', { h: 20, r: 10, turns: 3, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = roundingCodegen.bosl2_spiral_sweep(node, mockCtx)
      expect(result).toContain('spiral_sweep(h = 20, r = 10, turns = 3)')
    })

    it('edge_mask – default', () => {
      const node = mockNode('bosl2_edge_mask', { edges: 'ALL', except: '' })
      const result = roundingCodegen.bosl2_edge_mask(node, mockCtx)
      expect(result).toContain('edge_mask(ALL)')
    })

    it('edge_mask – with except', () => {
      const node = mockNode('bosl2_edge_mask', { edges: 'TOP', except: 'FRONT' })
      const result = roundingCodegen.bosl2_edge_mask(node, mockCtx)
      expect(result).toContain('edge_mask(TOP, except = FRONT)')
    })

    it('corner_mask – default', () => {
      const node = mockNode('bosl2_corner_mask', { corners: 'ALL', except: '' })
      const result = roundingCodegen.bosl2_corner_mask(node, mockCtx)
      expect(result).toContain('corner_mask(ALL)')
    })

    it('rounding_edge_mask – default', () => {
      const node = mockNode('bosl2_rounding_edge_mask', { h: 10, r: 2, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = roundingCodegen.bosl2_rounding_edge_mask(node, mockCtx)
      expect(result).toBe('  rounding_edge_mask(h = 10, r = 2);\n')
    })

    it('chamfer_edge_mask – default', () => {
      const node = mockNode('bosl2_chamfer_edge_mask', { h: 10, chamfer: 2, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = roundingCodegen.bosl2_chamfer_edge_mask(node, mockCtx)
      expect(result).toBe('  chamfer_edge_mask(h = 10, chamfer = 2);\n')
    })

    it('stroke – default', () => {
      const node = mockNode('bosl2_stroke', { width: 1, closed: false, endcaps: 'butt' })
      const result = roundingCodegen.bosl2_stroke(node, mockCtx)
      expect(result).toContain('stroke(width = 1)')
    })

    it('stroke – closed with round endcaps', () => {
      const node = mockNode('bosl2_stroke', { width: 2, closed: true, endcaps: 'round' })
      const result = roundingCodegen.bosl2_stroke(node, mockCtx)
      expect(result).toContain('closed = true')
      expect(result).toContain('endcaps = "round"')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // Tier 5: Mechanical Parts
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Tier 5 – Mechanical Parts', () => {
    it('spur_gear – exact default output', () => {
      const node = mockNode('bosl2_spur_gear', { mod: 2, teeth: 20, thickness: 5, pressure_angle: 20, helical: 0, shaft_diam: 5, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_spur_gear(node, mockCtx)
      expect(result).toBe('  spur_gear(mod = 2, teeth = 20, thickness = 5, shaft_diam = 5);\n')
    })

    it('spur_gear – with custom pressure angle and helical', () => {
      const node = mockNode('bosl2_spur_gear', { mod: 3, teeth: 16, thickness: 8, pressure_angle: 25, helical: 15, shaft_diam: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_spur_gear(node, mockCtx)
      expect(result).toContain('pressure_angle = 25')
      expect(result).toContain('helical = 15')
      expect(result).not.toContain('shaft_diam')
    })

    it('rack – default', () => {
      const node = mockNode('bosl2_rack', { mod: 2, teeth: 10, thickness: 5, pressure_angle: 20, helical: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_rack(node, mockCtx)
      expect(result).toBe('  rack(mod = 2, teeth = 10, thickness = 5);\n')
    })

    it('bevel_gear – default', () => {
      const node = mockNode('bosl2_bevel_gear', { mod: 2, teeth: 20, mate_teeth: 20, shaft_angle: 90, face_width: 10, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_bevel_gear(node, mockCtx)
      expect(result).toBe('  bevel_gear(mod = 2, teeth = 20, mate_teeth = 20);\n')
    })

    it('bevel_gear – custom shaft angle and face width', () => {
      const node = mockNode('bosl2_bevel_gear', { mod: 2, teeth: 20, mate_teeth: 15, shaft_angle: 60, face_width: 8, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_bevel_gear(node, mockCtx)
      expect(result).toContain('shaft_angle = 60')
      expect(result).toContain('face_width = 8')
    })

    it('worm – default', () => {
      const node = mockNode('bosl2_worm', { mod: 2, d: 20, l: 30, starts: 1, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_worm(node, mockCtx)
      expect(result).toBe('  worm(mod = 2, d = 20, l = 30);\n')
    })

    it('worm – multiple starts', () => {
      const node = mockNode('bosl2_worm', { mod: 2, d: 20, l: 30, starts: 3, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_worm(node, mockCtx)
      expect(result).toContain('starts = 3')
    })

    it('worm_gear – default', () => {
      const node = mockNode('bosl2_worm_gear', { mod: 2, teeth: 30, worm_diam: 20, worm_starts: 1, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_worm_gear(node, mockCtx)
      expect(result).toBe('  worm_gear(mod = 2, teeth = 30, worm_diam = 20);\n')
    })

    it('threaded_rod – default', () => {
      const node = mockNode('bosl2_threaded_rod', { d: 10, l: 30, pitch: 2, internal: false, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_threaded_rod(node, mockCtx)
      expect(result).toBe('  threaded_rod(d = 10, l = 30, pitch = 2);\n')
    })

    it('threaded_rod – internal', () => {
      const node = mockNode('bosl2_threaded_rod', { d: 10, l: 30, pitch: 2, internal: true, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_threaded_rod(node, mockCtx)
      expect(result).toContain('internal = true')
    })

    it('threaded_nut – default', () => {
      const node = mockNode('bosl2_threaded_nut', { nutwidth: 17, id: 10, h: 8, pitch: 2, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_threaded_nut(node, mockCtx)
      expect(result).toBe('  threaded_nut(nutwidth = 17, id = 10, h = 8, pitch = 2);\n')
    })

    it('screw – default', () => {
      const node = mockNode('bosl2_screw', { spec: 'M3', head: 'socket', drive: 'hex', length: 12, thread_len: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_screw(node, mockCtx)
      expect(result).toBe('  screw("M3", head = "socket", drive = "hex", length = 12);\n')
    })

    it('screw_hole – default', () => {
      const node = mockNode('bosl2_screw_hole', { spec: 'M3', head: 'socket', length: 12, oversize: 0, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_screw_hole(node, mockCtx)
      expect(result).toBe('  screw_hole("M3", head = "socket", length = 12);\n')
    })

    it('screw_hole – with oversize', () => {
      const node = mockNode('bosl2_screw_hole', { spec: 'M5', head: 'socket', length: 20, oversize: 0.2, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_screw_hole(node, mockCtx)
      expect(result).toContain('oversize = 0.2')
    })

    it('nut – default', () => {
      const node = mockNode('bosl2_nut', { spec: 'M3', shape: 'hex', thickness: 2.4, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_nut(node, mockCtx)
      expect(result).toBe('  nut("M3", thickness = 2.4);\n')
    })

    it('nut – square shape', () => {
      const node = mockNode('bosl2_nut', { spec: 'M3', shape: 'square', thickness: 2.4, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_nut(node, mockCtx)
      expect(result).toContain('shape = "square"')
    })

    it('dovetail – default', () => {
      const node = mockNode('bosl2_dovetail', { gender: 'male', width: 10, height: 5, slope: 6, slide: 20, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_dovetail(node, mockCtx)
      expect(result).toBe('  dovetail(gender = "male", width = 10, height = 5, slope = 6, slide = 20);\n')
    })

    it('snap_pin – default', () => {
      const node = mockNode('bosl2_snap_pin', { r: 1.5, l: 10, nub_depth: 0.4, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_snap_pin(node, mockCtx)
      expect(result).toBe('  snap_pin(r = 1.5, l = 10, nub_depth = 0.4);\n')
    })

    it('knuckle_hinge – default', () => {
      const node = mockNode('bosl2_knuckle_hinge', { length: 30, offset: 5, segs: 4, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_knuckle_hinge(node, mockCtx)
      expect(result).toBe('  knuckle_hinge(length = 30, offset = 5, segs = 4);\n')
    })

    it('bottle_neck – default', () => {
      const node = mockNode('bosl2_bottle_neck', { wall: 2, anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_bottle_neck(node, mockCtx)
      expect(result).toBe('  generic_bottle_neck(wall = 2);\n')
    })

    it('bottle_cap – default', () => {
      const node = mockNode('bosl2_bottle_cap', { wall: 2, texture: 'pointed', anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_bottle_cap(node, mockCtx)
      expect(result).toBe('  generic_bottle_cap(wall = 2, texture = "pointed");\n')
    })

    it('bottle_cap – no texture', () => {
      const node = mockNode('bosl2_bottle_cap', { wall: 2, texture: '', anchor: 'CENTER', spin: 0, orient: 'UP' })
      const result = mechanicalCodegen.bosl2_bottle_cap(node, mockCtx)
      expect(result).toBe('  generic_bottle_cap(wall = 2);\n')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // Tier 6: Attachments & Advanced
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Tier 6 – Attachments & Advanced', () => {
    it('diff – default', () => {
      const node = mockNode('bosl2_diff', { remove: 'remove', keep: '' })
      const result = attachmentsCodegen.bosl2_diff(node, mockCtx)
      expect(result).toContain('diff("remove")')
    })

    it('diff – with keep', () => {
      const node = mockNode('bosl2_diff', { remove: 'remove', keep: 'keep' })
      const result = attachmentsCodegen.bosl2_diff(node, mockCtx)
      expect(result).toContain('diff("remove", keep = "keep")')
    })

    it('intersect – default', () => {
      const node = mockNode('bosl2_intersect', { intersect: 'intersect', keep: '' })
      const result = attachmentsCodegen.bosl2_intersect(node, mockCtx)
      expect(result).toContain('intersect("intersect")')
    })

    it('intersect – with keep', () => {
      const node = mockNode('bosl2_intersect', { intersect: 'intersect', keep: 'keep' })
      const result = attachmentsCodegen.bosl2_intersect(node, mockCtx)
      expect(result).toContain('intersect("intersect", keep = "keep")')
    })

    it('position – default', () => {
      const node = mockNode('bosl2_position', { at: 'TOP' })
      const result = attachmentsCodegen.bosl2_position(node, mockCtx)
      expect(result).toContain('position(TOP)')
    })

    it('attach – default', () => {
      const node = mockNode('bosl2_attach', { parent: 'TOP', child: 'BOT', overlap: 0 })
      const result = attachmentsCodegen.bosl2_attach(node, mockCtx)
      expect(result).toContain('attach(TOP, BOT)')
    })

    it('attach – with overlap', () => {
      const node = mockNode('bosl2_attach', { parent: 'TOP', child: 'BOT', overlap: 0.5 })
      const result = attachmentsCodegen.bosl2_attach(node, mockCtx)
      expect(result).toContain('attach(TOP, BOT, overlap = 0.5)')
    })

    it('tag – default', () => {
      const node = mockNode('bosl2_tag', { tag: 'remove' })
      const result = attachmentsCodegen.bosl2_tag(node, mockCtx)
      expect(result).toContain('tag("remove")')
    })

    it('recolor – default', () => {
      const node = mockNode('bosl2_recolor', { c: 'red' })
      const result = attachmentsCodegen.bosl2_recolor(node, mockCtx)
      expect(result).toContain('recolor("red")')
    })

    it('half_of – default', () => {
      const node = mockNode('bosl2_half_of', { vx: 0, vy: 0, vz: 1, cpx: 0, cpy: 0, cpz: 0 })
      const result = attachmentsCodegen.bosl2_half_of(node, mockCtx)
      expect(result).toContain('half_of([0, 0, 1])')
      expect(result).not.toContain('cp =')
    })

    it('half_of – with center point', () => {
      const node = mockNode('bosl2_half_of', { vx: 0, vy: 0, vz: 1, cpx: 5, cpy: 0, cpz: 0 })
      const result = attachmentsCodegen.bosl2_half_of(node, mockCtx)
      expect(result).toContain('cp = [5, 0, 0]')
    })

    it('partition – default', () => {
      const node = mockNode('bosl2_partition', { x: 100, y: 100, z: 100, spread: 10, cutpath: 'jigsaw' })
      const result = attachmentsCodegen.bosl2_partition(node, mockCtx)
      expect(result).toContain('partition(size = [100, 100, 100], spread = 10, cutpath = "jigsaw")')
    })

    it('partition – no spread, no cutpath', () => {
      const node = mockNode('bosl2_partition', { x: 100, y: 100, z: 100, spread: 0, cutpath: '' })
      const result = attachmentsCodegen.bosl2_partition(node, mockCtx)
      expect(result).toContain('partition(size = [100, 100, 100])')
      expect(result).not.toContain('spread')
      expect(result).not.toContain('cutpath')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // Preamble
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Preamble', () => {
    it('returns null when no BOSL2 nodes present', () => {
      const nodes: Node[] = [
        { id: '1', type: 'cube', position: { x: 0, y: 0 }, data: {} },
        { id: '2', type: 'sphere', position: { x: 0, y: 0 }, data: {} },
      ]
      expect(bosl2Preamble(nodes)).toBeNull()
    })

    it('returns base include for any BOSL2 node', () => {
      const nodes: Node[] = [
        { id: '1', type: 'bosl2_cuboid', position: { x: 0, y: 0 }, data: {} },
      ]
      const result = bosl2Preamble(nodes)
      expect(result).toContain('include <BOSL2/std.scad>')
    })

    it('adds gears include for spur_gear', () => {
      const nodes: Node[] = [
        { id: '1', type: 'bosl2_spur_gear', position: { x: 0, y: 0 }, data: {} },
      ]
      const result = bosl2Preamble(nodes)
      expect(result).toContain('include <BOSL2/std.scad>')
      expect(result).toContain('include <BOSL2/gears.scad>')
    })

    it('adds threading include for threaded_rod', () => {
      const nodes: Node[] = [
        { id: '1', type: 'bosl2_threaded_rod', position: { x: 0, y: 0 }, data: {} },
      ]
      const result = bosl2Preamble(nodes)
      expect(result).toContain('include <BOSL2/threading.scad>')
    })

    it('adds screws include for screw node', () => {
      const nodes: Node[] = [
        { id: '1', type: 'bosl2_screw', position: { x: 0, y: 0 }, data: {} },
      ]
      const result = bosl2Preamble(nodes)
      expect(result).toContain('include <BOSL2/screws.scad>')
    })

    it('adds joiners include for dovetail', () => {
      const nodes: Node[] = [
        { id: '1', type: 'bosl2_dovetail', position: { x: 0, y: 0 }, data: {} },
      ]
      const result = bosl2Preamble(nodes)
      expect(result).toContain('include <BOSL2/joiners.scad>')
    })

    it('adds hinges include for knuckle_hinge', () => {
      const nodes: Node[] = [
        { id: '1', type: 'bosl2_knuckle_hinge', position: { x: 0, y: 0 }, data: {} },
      ]
      const result = bosl2Preamble(nodes)
      expect(result).toContain('include <BOSL2/hinges.scad>')
    })

    it('adds bottlecaps include for bottle_neck', () => {
      const nodes: Node[] = [
        { id: '1', type: 'bosl2_bottle_neck', position: { x: 0, y: 0 }, data: {} },
      ]
      const result = bosl2Preamble(nodes)
      expect(result).toContain('include <BOSL2/bottlecaps.scad>')
    })

    it('deduplicates extra includes', () => {
      const nodes: Node[] = [
        { id: '1', type: 'bosl2_spur_gear', position: { x: 0, y: 0 }, data: {} },
        { id: '2', type: 'bosl2_rack', position: { x: 0, y: 0 }, data: {} },
        { id: '3', type: 'bosl2_bevel_gear', position: { x: 0, y: 0 }, data: {} },
      ]
      const result = bosl2Preamble(nodes)!
      const gearsCount = (result.match(/include <BOSL2\/gears\.scad>/g) || []).length
      expect(gearsCount).toBe(1)
    })

    it('includes multiple different extra includes', () => {
      const nodes: Node[] = [
        { id: '1', type: 'bosl2_spur_gear', position: { x: 0, y: 0 }, data: {} },
        { id: '2', type: 'bosl2_screw', position: { x: 0, y: 0 }, data: {} },
        { id: '3', type: 'bosl2_dovetail', position: { x: 0, y: 0 }, data: {} },
      ]
      const result = bosl2Preamble(nodes)!
      expect(result).toContain('include <BOSL2/gears.scad>')
      expect(result).toContain('include <BOSL2/screws.scad>')
      expect(result).toContain('include <BOSL2/joiners.scad>')
    })

    it('returns null for empty node array', () => {
      expect(bosl2Preamble([])).toBeNull()
    })
  })
})
