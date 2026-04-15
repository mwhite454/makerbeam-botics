import type { Node } from '@xyflow/react'
import type { CodegenContext } from '@/types/nodePack'
import { optAnchor } from './utils'

// ─── Tier 1: 3D Shape codegen handlers ───────────────────────────────────────

export const shapes3dCodegen: Record<string, (node: Node, ctx: CodegenContext) => string> = {
  bosl2_cuboid: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const size = `[${ctx.expr(d.x)}, ${ctx.expr(d.y)}, ${ctx.expr(d.z)}]`
    let params = size
    const r = ctx.expr(d.rounding); if (r !== '0') params += `, rounding = ${r}`
    const c = ctx.expr(d.chamfer); if (c !== '0') params += `, chamfer = ${c}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}cuboid(${params});\n`
  },

  bosl2_cyl: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `h = ${ctx.expr(d.h)}`
    const r1 = ctx.expr(d.r1); const r2 = ctx.expr(d.r2)
    const r = ctx.expr(d.r)
    if (r1 !== r2) {
      params += `, r1 = ${r1}, r2 = ${r2}`
    } else {
      params += `, r = ${r}`
    }
    const ch = ctx.expr(d.chamfer); if (ch !== '0') params += `, chamfer = ${ch}`
    const ro = ctx.expr(d.rounding); if (ro !== '0') params += `, rounding = ${ro}`
    if (d.circum) params += `, circum = true`
    const fn = ctx.expr(d.fn); if (fn !== '0' && fn !== '32') params += `, $fn = ${fn}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}cyl(${params});\n`
  },

  bosl2_spheroid: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `r = ${ctx.expr(d.r)}`
    const style = String(d.style ?? 'aligned')
    if (style !== 'aligned') params += `, style = "${style}"`
    if (d.circum) params += `, circum = true`
    const fn = ctx.expr(d.fn); if (fn !== '0' && fn !== '32') params += `, $fn = ${fn}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}spheroid(${params});\n`
  },

  bosl2_torus: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `r_maj = ${ctx.expr(d.r_maj)}, r_min = ${ctx.expr(d.r_min)}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}torus(${params});\n`
  },

  bosl2_tube: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `h = ${ctx.expr(d.h)}, or = ${ctx.expr(d.or)}`
    const ir = ctx.expr(d.ir); const wall = ctx.expr(d.wall)
    if (ir !== '0') params += `, ir = ${ir}`
    if (wall !== '0') params += `, wall = ${wall}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}tube(${params});\n`
  },

  bosl2_prismoid: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const s1 = `[${ctx.expr(d.size1_x)}, ${ctx.expr(d.size1_y)}]`
    const s2 = `[${ctx.expr(d.size2_x)}, ${ctx.expr(d.size2_y)}]`
    let params = `${s1}, ${s2}, h = ${ctx.expr(d.h)}`
    const sx = ctx.expr(d.shift_x); const sy = ctx.expr(d.shift_y)
    if (sx !== '0' || sy !== '0') params += `, shift = [${sx}, ${sy}]`
    const r = ctx.expr(d.rounding); if (r !== '0') params += `, rounding = ${r}`
    const c = ctx.expr(d.chamfer); if (c !== '0') params += `, chamfer = ${c}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}prismoid(${params});\n`
  },

  bosl2_wedge: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `[${ctx.expr(d.x)}, ${ctx.expr(d.y)}, ${ctx.expr(d.z)}]`
    params += optAnchor(ctx, d)
    return `${ctx.pad}wedge(${params});\n`
  },

  bosl2_pie_slice: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `h = ${ctx.expr(d.h)}, r = ${ctx.expr(d.r)}, ang = ${ctx.expr(d.ang)}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}pie_slice(${params});\n`
  },

  bosl2_teardrop: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `h = ${ctx.expr(d.h)}, r = ${ctx.expr(d.r)}`
    const ang = ctx.expr(d.ang); if (ang !== '45') params += `, ang = ${ang}`
    const cap = ctx.expr(d.cap_h); if (cap !== '0') params += `, cap_h = ${cap}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}teardrop(${params});\n`
  },

  bosl2_onion: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `r = ${ctx.expr(d.r)}`
    const ang = ctx.expr(d.ang); if (ang !== '45') params += `, ang = ${ang}`
    const cap = ctx.expr(d.cap_h); if (cap !== '0') params += `, cap_h = ${cap}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}onion(${params});\n`
  },

  bosl2_rect_tube: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const size = `[${ctx.expr(d.size_x)}, ${ctx.expr(d.size_y)}]`
    const isize = `[${ctx.expr(d.isize_x)}, ${ctx.expr(d.isize_y)}]`
    let params = `h = ${ctx.expr(d.h)}, size = ${size}, isize = ${isize}`
    const wall = ctx.expr(d.wall); if (wall !== '0') params += `, wall = ${wall}`
    const r = ctx.expr(d.rounding); if (r !== '0') params += `, rounding = ${r}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}rect_tube(${params});\n`
  },

  bosl2_octahedron: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `size = ${ctx.expr(d.size)}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}octahedron(${params});\n`
  },

  bosl2_regular_prism: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `n = ${ctx.expr(d.n)}, h = ${ctx.expr(d.h)}, r = ${ctx.expr(d.r)}`
    const ro = ctx.expr(d.rounding); if (ro !== '0') params += `, rounding = ${ro}`
    const ch = ctx.expr(d.chamfer); if (ch !== '0') params += `, chamfer = ${ch}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}regular_prism(${params});\n`
  },

  bosl2_text3d: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const text = ctx.escapeString(d.text)
    let params = `"${text}", h = ${ctx.expr(d.h)}, size = ${ctx.expr(d.size)}`
    const font = String(d.font ?? '')
    if (font) params += `, font = "${ctx.escapeString(font)}"`
    params += optAnchor(ctx, d)
    return `${ctx.pad}text3d(${params});\n`
  },
}
