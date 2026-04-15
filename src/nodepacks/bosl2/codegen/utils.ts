import type { CodegenContext } from '@/types/nodePack'

/**
 * Emit optional anchor, spin, orient parameters for 3D BOSL2 nodes.
 * Returns an array of parameter strings (no leading comma).
 */
export function anchorParams3d(ctx: CodegenContext, d: Record<string, unknown>): string[] {
  const parts: string[] = []
  const anchor = String(d.anchor ?? 'CENTER')
  if (anchor && anchor !== 'CENTER') parts.push(`anchor = ${anchor}`)
  const spin = ctx.expr(d.spin)
  if (spin !== '0') parts.push(`spin = ${spin}`)
  const orient = String(d.orient ?? 'UP')
  if (orient && orient !== 'UP') parts.push(`orient = ${orient}`)
  return parts
}

/**
 * Emit optional anchor, spin parameters for 2D BOSL2 nodes.
 * Returns an array of parameter strings (no leading comma).
 */
export function anchorParams2d(ctx: CodegenContext, d: Record<string, unknown>): string[] {
  const parts: string[] = []
  const anchor = String(d.anchor ?? 'CENTER')
  if (anchor && anchor !== 'CENTER') parts.push(`anchor = ${anchor}`)
  const spin = ctx.expr(d.spin)
  if (spin !== '0') parts.push(`spin = ${spin}`)
  return parts
}

/**
 * Legacy helper: returns `, anchor = ..., spin = ..., orient = ...` string
 * for backward compatibility with codegen handlers that concatenate strings.
 */
export function optAnchor(ctx: CodegenContext, d: Record<string, unknown>): string {
  const parts = anchorParams3d(ctx, d)
  return parts.length > 0 ? `, ${parts.join(', ')}` : ''
}

/**
 * Legacy helper: returns `, anchor = ..., spin = ...` string for 2D nodes.
 */
export function optAnchor2d(ctx: CodegenContext, d: Record<string, unknown>): string {
  const parts = anchorParams2d(ctx, d)
  return parts.length > 0 ? `, ${parts.join(', ')}` : ''
}
