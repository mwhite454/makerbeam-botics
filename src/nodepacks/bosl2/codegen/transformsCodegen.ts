import type { Node } from '@xyflow/react'
import type { CodegenContext } from '@/types/nodePack'

// ─── Tier 3: Transforms codegen handlers ─────────────────────────────────────

export const transformsCodegen: Record<string, (node: Node, ctx: CodegenContext) => string> = {
  bosl2_move: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`move([${ctx.expr(d.x)}, ${ctx.expr(d.y)}, ${ctx.expr(d.z)}])`)
  },

  bosl2_left: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`left(${ctx.expr(d.d)})`)
  },
  bosl2_right: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`right(${ctx.expr(d.d)})`)
  },
  bosl2_fwd: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`fwd(${ctx.expr(d.d)})`)
  },
  bosl2_back: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`back(${ctx.expr(d.d)})`)
  },
  bosl2_up: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`up(${ctx.expr(d.d)})`)
  },
  bosl2_down: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`down(${ctx.expr(d.d)})`)
  },

  bosl2_rot: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const a = ctx.expr(d.a)
    const vx = ctx.expr(d.vx); const vy = ctx.expr(d.vy); const vz = ctx.expr(d.vz)
    if (vx !== '0' || vy !== '0' || vz !== '0') {
      return ctx.emitTransform(`rot(a = ${a}, v = [${vx}, ${vy}, ${vz}])`)
    }
    return ctx.emitTransform(`rot(${a})`)
  },

  bosl2_xrot: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`xrot(${ctx.expr(d.a)})`)
  },
  bosl2_yrot: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`yrot(${ctx.expr(d.a)})`)
  },
  bosl2_zrot: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`zrot(${ctx.expr(d.a)})`)
  },

  bosl2_xscale: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`xscale(${ctx.expr(d.factor)})`)
  },
  bosl2_yscale: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`yscale(${ctx.expr(d.factor)})`)
  },
  bosl2_zscale: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`zscale(${ctx.expr(d.factor)})`)
  },

  bosl2_xflip: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const off = ctx.expr(d.offset)
    return ctx.emitTransform(off !== '0' ? `xflip(x = ${off})` : `xflip()`)
  },
  bosl2_yflip: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const off = ctx.expr(d.offset)
    return ctx.emitTransform(off !== '0' ? `yflip(y = ${off})` : `yflip()`)
  },
  bosl2_zflip: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const off = ctx.expr(d.offset)
    return ctx.emitTransform(off !== '0' ? `zflip(z = ${off})` : `zflip()`)
  },

  bosl2_skew: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const parts: string[] = []
    const add = (name: string, val: unknown) => {
      const v = ctx.expr(val); if (v !== '0') parts.push(`${name} = ${v}`)
    }
    add('sxy', d.sxy); add('sxz', d.sxz)
    add('syx', d.syx); add('syz', d.syz)
    add('szx', d.szx); add('szy', d.szy)
    return ctx.emitTransform(`skew(${parts.join(', ')})`)
  },
}
