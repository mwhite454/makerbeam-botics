import type { Node } from '@xyflow/react'
import type { CodegenContext } from '@/types/nodePack'

// ─── Tier 6: Attachments & Advanced codegen handlers ────────────────────────

export const attachmentsCodegen: Record<string, (node: Node, ctx: CodegenContext) => string> = {
  bosl2_diff: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const remove = ctx.escapeString(d.remove ?? 'remove')
    const keep = ctx.escapeString(d.keep ?? '')
    let params = `"${remove}"`
    if (keep) params += `, keep = "${keep}"`
    return ctx.emitTransform(`diff(${params})`)
  },

  bosl2_intersect: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const intersect = ctx.escapeString(d.intersect ?? 'intersect')
    const keep = ctx.escapeString(d.keep ?? '')
    let params = `"${intersect}"`
    if (keep) params += `, keep = "${keep}"`
    return ctx.emitTransform(`intersect(${params})`)
  },

  bosl2_position: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const at = String(d.at ?? 'TOP')
    return ctx.emitTransform(`position(${at})`)
  },

  bosl2_attach: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const parent = String(d.parent ?? 'TOP')
    const child = String(d.child ?? 'BOT')
    let params = `${parent}, ${child}`
    const ov = ctx.resolveValueInput(1, ctx.expr(d.overlap)); if (ov !== '0') params += `, overlap = ${ov}`
    return ctx.emitTransform(`attach(${params})`)
  },

  bosl2_tag: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const tag = ctx.escapeString(d.tag ?? 'remove')
    return ctx.emitTransform(`tag("${tag}")`)
  },

  bosl2_recolor: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const c = ctx.escapeString(d.c ?? 'red')
    return ctx.emitTransform(`recolor("${c}")`)
  },

  bosl2_half_of: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const v = `[${ctx.resolveValueInput(1, ctx.expr(d.vx))}, ${ctx.resolveValueInput(2, ctx.expr(d.vy))}, ${ctx.resolveValueInput(3, ctx.expr(d.vz))}]`
    const cp = `[${ctx.resolveValueInput(4, ctx.expr(d.cpx))}, ${ctx.resolveValueInput(5, ctx.expr(d.cpy))}, ${ctx.resolveValueInput(6, ctx.expr(d.cpz))}]`
    let params = `${v}`
    if (cp !== '[0, 0, 0]') params += `, cp = ${cp}`
    return ctx.emitTransform(`half_of(${params})`)
  },

  bosl2_partition: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const size = `[${ctx.resolveValueInput(1, ctx.expr(d.x))}, ${ctx.resolveValueInput(2, ctx.expr(d.y))}, ${ctx.resolveValueInput(3, ctx.expr(d.z))}]`
    let params = `size = ${size}`
    const sp = ctx.resolveValueInput(4, ctx.expr(d.spread)); if (sp !== '0') params += `, spread = ${sp}`
    const cp = String(d.cutpath ?? ''); if (cp) params += `, cutpath = "${ctx.escapeString(cp)}"`
    return ctx.emitTransform(`partition(${params})`)
  },
}
