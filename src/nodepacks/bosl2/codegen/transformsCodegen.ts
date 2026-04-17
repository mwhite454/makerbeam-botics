import type { Node } from '@xyflow/react'
import type { CodegenContext } from '@/types/nodePack'

// ─── Tier 3: Transforms codegen handlers ─────────────────────────────────────

export const transformsCodegen: Record<string, (node: Node, ctx: CodegenContext) => string> = {
  bosl2_move: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const x = ctx.resolveValueInput(1, ctx.expr(d.x))
    const y = ctx.resolveValueInput(2, ctx.expr(d.y))
    const z = ctx.resolveValueInput(3, ctx.expr(d.z))
    return ctx.emitTransform(`move([${x}, ${y}, ${z}])`)
  },

  bosl2_left: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`left(${ctx.resolveValueInput(1, ctx.expr(d.d))})`)
  },
  bosl2_right: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`right(${ctx.resolveValueInput(1, ctx.expr(d.d))})`)
  },
  bosl2_fwd: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`fwd(${ctx.resolveValueInput(1, ctx.expr(d.d))})`)
  },
  bosl2_back: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`back(${ctx.resolveValueInput(1, ctx.expr(d.d))})`)
  },
  bosl2_up: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`up(${ctx.resolveValueInput(1, ctx.expr(d.d))})`)
  },
  bosl2_down: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`down(${ctx.resolveValueInput(1, ctx.expr(d.d))})`)
  },

  bosl2_rot: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const a = ctx.resolveValueInput(1, ctx.expr(d.a))
    const vx = ctx.resolveValueInput(2, ctx.expr(d.vx))
    const vy = ctx.resolveValueInput(3, ctx.expr(d.vy))
    const vz = ctx.resolveValueInput(4, ctx.expr(d.vz))
    if (vx !== '0' || vy !== '0' || vz !== '0') {
      return ctx.emitTransform(`rot(a = ${a}, v = [${vx}, ${vy}, ${vz}])`)
    }
    return ctx.emitTransform(`rot(${a})`)
  },

  bosl2_xrot: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`xrot(${ctx.resolveValueInput(1, ctx.expr(d.a))})`)
  },
  bosl2_yrot: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`yrot(${ctx.resolveValueInput(1, ctx.expr(d.a))})`)
  },
  bosl2_zrot: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`zrot(${ctx.resolveValueInput(1, ctx.expr(d.a))})`)
  },

  bosl2_xscale: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`xscale(${ctx.resolveValueInput(1, ctx.expr(d.factor))})`)
  },
  bosl2_yscale: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`yscale(${ctx.resolveValueInput(1, ctx.expr(d.factor))})`)
  },
  bosl2_zscale: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    return ctx.emitTransform(`zscale(${ctx.resolveValueInput(1, ctx.expr(d.factor))})`)
  },

  bosl2_xflip: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const off = ctx.resolveValueInput(1, ctx.expr(d.offset))
    return ctx.emitTransform(off !== '0' ? `xflip(x = ${off})` : `xflip()`)
  },
  bosl2_yflip: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const off = ctx.resolveValueInput(1, ctx.expr(d.offset))
    return ctx.emitTransform(off !== '0' ? `yflip(y = ${off})` : `yflip()`)
  },
  bosl2_zflip: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const off = ctx.resolveValueInput(1, ctx.expr(d.offset))
    return ctx.emitTransform(off !== '0' ? `zflip(z = ${off})` : `zflip()`)
  },

  bosl2_skew: (node, ctx) => {
    const d = node.data as Record<string, unknown>
    const parts: string[] = []
    const add = (name: string, val: unknown, idx: number) => {
      const v = ctx.resolveValueInput(idx, ctx.expr(val)); if (v !== '0') parts.push(`${name} = ${v}`)
    }
    add('sxy', d.sxy, 1); add('sxz', d.sxz, 2)
    add('syx', d.syx, 3); add('syz', d.syz, 4)
    add('szx', d.szx, 5); add('szy', d.szy, 6)
    return ctx.emitTransform(`skew(${parts.join(', ')})`)
  },
}
