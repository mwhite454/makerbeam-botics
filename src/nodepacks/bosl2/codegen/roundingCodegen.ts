import type { Node } from '@xyflow/react'
import type { CodegenContext } from '@/types/nodePack'
import { anchorParams3d, optAnchor } from './utils'

// ─── Tier 4: Rounding, Masks, Sweeps codegen handlers ───────────────────────

export const roundingCodegen: Record<string, (node: Node, ctx: CodegenContext) => string> = {
  bosl2_offset_sweep: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `height = ${ctx.expr(d.height)}`
    const top = ctx.expr(d.top_r); if (top !== '0') params += `, top = os_circle(r = ${top})`
    const bot = ctx.expr(d.bot_r); if (bot !== '0') params += `, bottom = os_circle(r = ${bot})`
    params += optAnchor(ctx, d)
    return ctx.emitTransform(`offset_sweep(${params})`)
  },

  bosl2_rounded_prism: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `height = ${ctx.expr(d.height)}`
    const jt = ctx.expr(d.joint_top); if (jt !== '0') params += `, joint_top = ${jt}`
    const jb = ctx.expr(d.joint_bot); if (jb !== '0') params += `, joint_bot = ${jb}`
    const js = ctx.expr(d.joint_sides); if (js !== '0') params += `, joint_sides = ${js}`
    params += optAnchor(ctx, d)
    return ctx.emitTransform(`rounded_prism(${params})`)
  },

  bosl2_skin: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const shapes = String(d.shapes ?? '[]')
    const parts: string[] = [shapes]
    const sl = ctx.expr(d.slices); if (sl !== '0' && sl !== '10') parts.push(`slices = ${sl}`)
    const method = String(d.method ?? 'reindex')
    if (method !== 'reindex') parts.push(`method = "${method}"`)
    const style = String(d.style ?? 'min_edge')
    if (style !== 'min_edge') parts.push(`style = "${style}"`)
    return `${ctx.pad}skin(${parts.join(', ')});\n`
  },

  bosl2_linear_sweep: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `height = ${ctx.expr(d.height)}`
    const tw = ctx.expr(d.twist); if (tw !== '0') params += `, twist = ${tw}`
    const sc = ctx.expr(d.scale); if (sc !== '1') params += `, scale = ${sc}`
    const sl = ctx.expr(d.slices); if (sl !== '0') params += `, slices = ${sl}`
    if (d.center) params += `, center = true`
    params += optAnchor(ctx, d)
    return ctx.emitTransform(`linear_sweep(${params})`)
  },

  bosl2_rotate_sweep: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const parts: string[] = []
    const ang = ctx.expr(d.angle); if (ang !== '360') parts.push(`angle = ${ang}`)
    parts.push(...anchorParams3d(ctx, d))
    return ctx.emitTransform(`rotate_sweep(${parts.join(', ')})`)
  },

  bosl2_path_sweep: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const parts: string[] = []
    const method = String(d.method ?? 'incremental')
    if (method !== 'incremental') parts.push(`method = "${method}"`)
    const tw = ctx.expr(d.twist); if (tw !== '0') parts.push(`twist = ${tw}`)
    if (d.closed) parts.push(`closed = true`)
    parts.push(...anchorParams3d(ctx, d))
    return ctx.emitTransform(`path_sweep(${parts.join(', ')})`)
  },

  bosl2_spiral_sweep: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `h = ${ctx.expr(d.h)}, r = ${ctx.expr(d.r)}, turns = ${ctx.expr(d.turns)}`
    params += optAnchor(ctx, d)
    return ctx.emitTransform(`spiral_sweep(${params})`)
  },

  bosl2_edge_mask: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = ``
    const edges = String(d.edges ?? ''); if (edges) params += `${edges}`
    const except = String(d.except ?? ''); if (except) { if (params) params += ', '; params += `except = ${except}` }
    return ctx.emitTransform(`edge_mask(${params})`)
  },

  bosl2_corner_mask: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = ``
    const corners = String(d.corners ?? ''); if (corners) params += `${corners}`
    const except = String(d.except ?? ''); if (except) { if (params) params += ', '; params += `except = ${except}` }
    return ctx.emitTransform(`corner_mask(${params})`)
  },

  bosl2_rounding_edge_mask: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `h = ${ctx.expr(d.h)}, r = ${ctx.expr(d.r)}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}rounding_edge_mask(${params});\n`
  },

  bosl2_chamfer_edge_mask: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `h = ${ctx.expr(d.h)}, chamfer = ${ctx.expr(d.chamfer)}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}chamfer_edge_mask(${params});\n`
  },

  bosl2_stroke: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `width = ${ctx.expr(d.width)}`
    if (d.closed) params += `, closed = true`
    const ec = String(d.endcaps ?? '')
    if (ec && ec !== 'butt') params += `, endcaps = "${ec}"`
    return ctx.emitTransform(`stroke(${params})`)
  },

  bosl2_fillet: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `h = ${ctx.expr(d.h)}, r = ${ctx.expr(d.r)}`
    const ang = ctx.expr(d.ang); if (ang !== '90') params += `, ang = ${ang}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}fillet(${params});\n`
  },
}
