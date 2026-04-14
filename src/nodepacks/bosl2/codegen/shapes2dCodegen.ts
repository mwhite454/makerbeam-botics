import type { Node } from '@xyflow/react'
import type { CodegenContext } from '@/types/nodePack'

// ─── Tier 2: 2D Shape codegen handlers ───────────────────────────────────────

function optAnchor2d(ctx: CodegenContext, d: Record<string, unknown>): string {
  let extra = ''
  const anchor = String(d.anchor ?? 'CENTER')
  if (anchor && anchor !== 'CENTER') extra += `, anchor = ${anchor}`
  const spin = ctx.expr(d.spin)
  if (spin !== '0') extra += `, spin = ${spin}`
  return extra
}

export const shapes2dCodegen: Record<string, (node: Node, ctx: CodegenContext) => string> = {
  bosl2_rect: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `[${ctx.expr(d.x)}, ${ctx.expr(d.y)}]`
    const r = ctx.expr(d.rounding); if (r !== '0') params += `, rounding = ${r}`
    const c = ctx.expr(d.chamfer); if (c !== '0') params += `, chamfer = ${c}`
    params += optAnchor2d(ctx, d)
    return `${ctx.pad}rect(${params});\n`
  },

  bosl2_ellipse: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `r = [${ctx.expr(d.rx)}, ${ctx.expr(d.ry)}]`
    params += optAnchor2d(ctx, d)
    return `${ctx.pad}ellipse(${params});\n`
  },

  bosl2_regular_ngon: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `n = ${ctx.expr(d.n)}, r = ${ctx.expr(d.r)}`
    params += optAnchor2d(ctx, d)
    return `${ctx.pad}regular_ngon(${params});\n`
  },

  bosl2_pentagon: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `r = ${ctx.expr(d.r)}`
    params += optAnchor2d(ctx, d)
    return `${ctx.pad}pentagon(${params});\n`
  },

  bosl2_hexagon: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `r = ${ctx.expr(d.r)}`
    const r = ctx.expr(d.rounding); if (r !== '0') params += `, rounding = ${r}`
    params += optAnchor2d(ctx, d)
    return `${ctx.pad}hexagon(${params});\n`
  },

  bosl2_octagon: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `r = ${ctx.expr(d.r)}`
    const r = ctx.expr(d.rounding); if (r !== '0') params += `, rounding = ${r}`
    params += optAnchor2d(ctx, d)
    return `${ctx.pad}octagon(${params});\n`
  },

  bosl2_star: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `n = ${ctx.expr(d.n)}, r = ${ctx.expr(d.r)}, ir = ${ctx.expr(d.ir)}`
    params += optAnchor2d(ctx, d)
    return `${ctx.pad}star(${params});\n`
  },

  bosl2_trapezoid: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `h = ${ctx.expr(d.h)}, w1 = ${ctx.expr(d.w1)}, w2 = ${ctx.expr(d.w2)}`
    const r = ctx.expr(d.rounding); if (r !== '0') params += `, rounding = ${r}`
    params += optAnchor2d(ctx, d)
    return `${ctx.pad}trapezoid(${params});\n`
  },

  bosl2_right_triangle: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `[${ctx.expr(d.x)}, ${ctx.expr(d.y)}]`
    params += optAnchor2d(ctx, d)
    return `${ctx.pad}right_triangle(${params});\n`
  },

  bosl2_teardrop2d: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `r = ${ctx.expr(d.r)}`
    const ang = ctx.expr(d.ang); if (ang !== '45') params += `, ang = ${ang}`
    params += optAnchor2d(ctx, d)
    return `${ctx.pad}teardrop2d(${params});\n`
  },

  bosl2_squircle: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `[${ctx.expr(d.x)}, ${ctx.expr(d.y)}]`
    const sq = ctx.expr(d.squareness); if (sq !== '0.5') params += `, squareness = ${sq}`
    params += optAnchor2d(ctx, d)
    return `${ctx.pad}squircle(${params});\n`
  },

  bosl2_ring: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `n = ${ctx.expr(d.n)}, r1 = ${ctx.expr(d.r1)}, r2 = ${ctx.expr(d.r2)}`
    params += optAnchor2d(ctx, d)
    return `${ctx.pad}ring(${params});\n`
  },
}
