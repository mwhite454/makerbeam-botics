import type { Node } from "@xyflow/react";
import type { CodegenContext } from "@/types/nodePack";

// ─── Tier 3: Distributors codegen handlers ───────────────────────────────────

export const distributorsCodegen: Record<
  string,
  (node: Node, ctx: CodegenContext) => string
> = {
  bosl2_xcopies: (node, ctx) => {
    const d = node.data as Record<string, unknown>;
    let params = `spacing = ${ctx.resolveValueInput(1, ctx.expr(d.spacing))}`;
    const n = ctx.resolveValueInput(2, ctx.expr(d.n));
    if (n !== "2") params += `, n = ${n}`;
    return ctx.emitTransform(`xcopies(${params})`);
  },

  bosl2_ycopies: (node, ctx) => {
    const d = node.data as Record<string, unknown>;
    let params = `spacing = ${ctx.resolveValueInput(1, ctx.expr(d.spacing))}`;
    const n = ctx.resolveValueInput(2, ctx.expr(d.n));
    if (n !== "2") params += `, n = ${n}`;
    return ctx.emitTransform(`ycopies(${params})`);
  },

  bosl2_zcopies: (node, ctx) => {
    const d = node.data as Record<string, unknown>;
    let params = `spacing = ${ctx.resolveValueInput(1, ctx.expr(d.spacing))}`;
    const n = ctx.resolveValueInput(2, ctx.expr(d.n));
    if (n !== "2") params += `, n = ${n}`;
    return ctx.emitTransform(`zcopies(${params})`);
  },

  bosl2_grid_copies: (node, ctx) => {
    const d = node.data as Record<string, unknown>;
    const spacing = `[${ctx.resolveValueInput(1, ctx.expr(d.spacing_x))}, ${ctx.resolveValueInput(2, ctx.expr(d.spacing_y))}]`;
    const n = `[${ctx.resolveValueInput(3, ctx.expr(d.n_x))}, ${ctx.resolveValueInput(4, ctx.expr(d.n_y))}]`;
    let params = `spacing = ${spacing}, n = ${n}`;
    if (d.stagger) params += `, stagger = true`;
    return ctx.emitTransform(`grid_copies(${params})`);
  },

  bosl2_rot_copies: (node, ctx) => {
    const d = node.data as Record<string, unknown>;
    let params = `n = ${ctx.resolveValueInput(1, ctx.expr(d.n))}`;
    const sa = ctx.resolveValueInput(2, ctx.expr(d.sa));
    if (sa !== "0") params += `, sa = ${sa}`;
    return ctx.emitTransform(`rot_copies(${params})`);
  },

  bosl2_arc_copies: (node, ctx) => {
    const d = node.data as Record<string, unknown>;
    let params = `n = ${ctx.resolveValueInput(1, ctx.expr(d.n))}, r = ${ctx.resolveValueInput(2, ctx.expr(d.r))}`;
    const sa = ctx.resolveValueInput(3, ctx.expr(d.sa));
    if (sa !== "0") params += `, sa = ${sa}`;
    const ea = ctx.resolveValueInput(4, ctx.expr(d.ea));
    if (ea !== "360") params += `, ea = ${ea}`;
    return ctx.emitTransform(`arc_copies(${params})`);
  },

  bosl2_mirror_copy: (node, ctx) => {
    const d = node.data as Record<string, unknown>;
    const v = `[${ctx.resolveValueInput(1, ctx.expr(d.vx))}, ${ctx.resolveValueInput(2, ctx.expr(d.vy))}, ${ctx.resolveValueInput(3, ctx.expr(d.vz))}]`;
    let params = `${v}`;
    const off = ctx.resolveValueInput(4, ctx.expr(d.offset));
    if (off !== "0") params += `, offset = ${off}`;
    return ctx.emitTransform(`mirror_copy(${params})`);
  },

  bosl2_path_copies: (node, ctx) => {
    const d = node.data as Record<string, unknown>;
    const path = String(d.path ?? "[]");
    let params = `${path}`;
    const n = ctx.resolveValueInput(1, ctx.expr(d.n));
    if (n !== "0") params += `, n = ${n}`;
    if (d.closed) params += `, closed = true`;
    return ctx.emitTransform(`path_copies(${params})`);
  },
};
