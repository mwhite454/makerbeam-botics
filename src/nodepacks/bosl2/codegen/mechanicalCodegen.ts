import type { Node } from '@xyflow/react'
import type { CodegenContext } from '@/types/nodePack'
import { optAnchor } from './utils'

// ─── Tier 5: Mechanical Parts codegen handlers ──────────────────────────────

export const mechanicalCodegen: Record<string, (node: Node, ctx: CodegenContext) => string> = {
  bosl2_spur_gear: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `mod = ${ctx.expr(d.mod)}, teeth = ${ctx.expr(d.teeth)}, thickness = ${ctx.expr(d.thickness)}`
    const pa = ctx.expr(d.pressure_angle); if (pa !== '20') params += `, pressure_angle = ${pa}`
    const hel = ctx.expr(d.helical); if (hel !== '0') params += `, helical = ${hel}`
    const sd = ctx.expr(d.shaft_diam); if (sd !== '0') params += `, shaft_diam = ${sd}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}spur_gear(${params});\n`
  },

  bosl2_rack: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `mod = ${ctx.expr(d.mod)}, teeth = ${ctx.expr(d.teeth)}, thickness = ${ctx.expr(d.thickness)}`
    const h = ctx.expr(d.height); if (h !== '0') params += `, height = ${h}`
    const pa = ctx.expr(d.pressure_angle); if (pa !== '20') params += `, pressure_angle = ${pa}`
    const hel = ctx.expr(d.helical); if (hel !== '0') params += `, helical = ${hel}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}rack(${params});\n`
  },

  bosl2_bevel_gear: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `mod = ${ctx.expr(d.mod)}, teeth = ${ctx.expr(d.teeth)}, mate_teeth = ${ctx.expr(d.mate_teeth)}`
    const sa = ctx.expr(d.shaft_angle); if (sa !== '90') params += `, shaft_angle = ${sa}`
    const fw = ctx.expr(d.face_width); if (fw !== '10') params += `, face_width = ${fw}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}bevel_gear(${params});\n`
  },

  bosl2_worm: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `mod = ${ctx.expr(d.mod)}, d = ${ctx.expr(d.d)}, l = ${ctx.expr(d.l)}`
    const st = ctx.expr(d.starts); if (st !== '1') params += `, starts = ${st}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}worm(${params});\n`
  },

  bosl2_worm_gear: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `mod = ${ctx.expr(d.mod)}, teeth = ${ctx.expr(d.teeth)}, worm_diam = ${ctx.expr(d.worm_diam)}`
    const ws = ctx.expr(d.worm_starts); if (ws !== '1') params += `, worm_starts = ${ws}`
    const th = ctx.expr(d.thickness); if (th !== '0') params += `, thickness = ${th}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}worm_gear(${params});\n`
  },

  bosl2_threaded_rod: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `d = ${ctx.expr(d.d)}, l = ${ctx.expr(d.l)}, pitch = ${ctx.expr(d.pitch)}`
    if (d.internal) params += `, internal = true`
    params += optAnchor(ctx, d)
    return `${ctx.pad}threaded_rod(${params});\n`
  },

  bosl2_threaded_nut: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `nutwidth = ${ctx.expr(d.nutwidth)}, id = ${ctx.expr(d.id)}, h = ${ctx.expr(d.h)}, pitch = ${ctx.expr(d.pitch)}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}threaded_nut(${params});\n`
  },

  bosl2_screw: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const spec = ctx.escapeString(d.spec)
    let params = `"${spec}"`
    const head = String(d.head ?? ''); if (head) params += `, head = "${ctx.escapeString(head)}"`
    const drive = String(d.drive ?? ''); if (drive) params += `, drive = "${ctx.escapeString(drive)}"`
    params += `, length = ${ctx.expr(d.length)}`
    const tl = ctx.expr(d.thread_len); if (tl !== '0') params += `, thread_len = ${tl}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}screw(${params});\n`
  },

  bosl2_screw_hole: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const spec = ctx.escapeString(d.spec)
    let params = `"${spec}"`
    const head = String(d.head ?? ''); if (head) params += `, head = "${ctx.escapeString(head)}"`
    params += `, length = ${ctx.expr(d.length)}`
    const os = ctx.expr(d.oversize); if (os !== '0') params += `, oversize = ${os}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}screw_hole(${params});\n`
  },

  bosl2_nut: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const spec = ctx.escapeString(d.spec)
    let params = `"${spec}"`
    const shape = String(d.shape ?? 'hex'); if (shape !== 'hex') params += `, shape = "${shape}"`
    params += `, thickness = ${ctx.expr(d.thickness)}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}nut(${params});\n`
  },

  bosl2_dovetail: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const gender = String(d.gender ?? 'male')
    let params = `gender = "${gender}", width = ${ctx.expr(d.width)}, height = ${ctx.expr(d.height)}`
    params += `, slope = ${ctx.expr(d.slope)}, slide = ${ctx.expr(d.slide)}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}dovetail(${params});\n`
  },

  bosl2_snap_pin: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `r = ${ctx.expr(d.r)}, l = ${ctx.expr(d.l)}`
    const nd = ctx.expr(d.nub_depth); if (nd !== '0') params += `, nub_depth = ${nd}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}snap_pin(${params});\n`
  },

  bosl2_knuckle_hinge: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `length = ${ctx.expr(d.length)}, offset = ${ctx.expr(d.offset)}, segs = ${ctx.expr(d.segs)}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}knuckle_hinge(${params});\n`
  },

  bosl2_bottle_neck: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `wall = ${ctx.expr(d.wall)}`
    const nd = ctx.expr(d.neck_d); if (nd !== '0') params += `, neck_d = ${nd}`
    const tp = ctx.expr(d.thread_pitch); if (tp !== '0') params += `, thread_pitch = ${tp}`
    params += optAnchor(ctx, d)
    return `${ctx.pad}generic_bottle_neck(${params});\n`
  },

  bosl2_bottle_cap: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    let params = `wall = ${ctx.expr(d.wall)}`
    const cd = ctx.expr(d.cap_d); if (cd !== '0') params += `, cap_d = ${cd}`
    const tp = ctx.expr(d.thread_pitch); if (tp !== '0') params += `, thread_pitch = ${tp}`
    const tex = String(d.texture ?? ''); if (tex) params += `, texture = "${ctx.escapeString(tex)}"`
    params += optAnchor(ctx, d)
    return `${ctx.pad}generic_bottle_cap(${params});\n`
  },
}
