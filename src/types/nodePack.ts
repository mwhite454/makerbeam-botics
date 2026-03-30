import type { Node, NodeTypes } from '@xyflow/react'
import type { PaletteItem } from './nodes'

// ─── Codegen context passed to pack node handlers ─────────────────────────────
// Mirrors the helpers available inside emitNode() in codegen/index.ts.
// Pack handlers receive this so they can format output exactly like built-in nodes.

export interface CodegenContext {
  pad: string
  num: (v: unknown) => number
  expr: (v: unknown) => string
  bool: (v: unknown) => string
  escapeString: (v: unknown) => string
  sanitizeIdentifier: (raw: unknown, fallback?: string) => string
  resolveValueInput: (index: number, fallback: string) => string
  getAllChildren: () => string
  getChild: (index: number) => string
  hasChild: (index: number) => boolean
  emitTransform: (header: string) => string
}

// ─── Node pack definition ─────────────────────────────────────────────────────
// A self-contained bundle of everything needed to support a set of nodes from
// a third-party or custom library (BOSL2, NopSCADlib, MakerBeam, etc.).
//
// To register a new pack, add it to web/src/nodepacks/index.ts.
// Core built-in nodes (cube, sphere, etc.) are NOT packs — they live directly
// in web/src/nodes/ and web/src/types/nodes.ts.

export interface NodePackDefinition {
  // Unique identifier, used as key in registries (e.g. 'makerbeam', 'bosl2')
  id: string

  // The palette category string for all nodes in this pack.
  // Can be a new category name or an existing NodeCategory value.
  category: string

  // Display label shown in the NodePalette sidebar header
  categoryLabel: string

  // Tailwind background class for node badges (e.g. 'bg-yellow-500')
  categoryColor: string

  // Tailwind text class for node badge labels (e.g. 'text-gray-900')
  categoryTextColor: string

  // Maps node type string → React component, merged into the global nodeTypes registry
  nodeTypes: NodeTypes

  // Palette entries for this pack's nodes, displayed in the NodePalette sidebar
  paletteItems: PaletteItem[]

  // Maps node type string → code emitter function.
  // Return a full OpenSCAD statement string (with indentation from ctx.pad).
  codegenHandlers: Record<string, (node: Node, ctx: CodegenContext) => string>

  // Optional OpenSCAD preamble emitter. Called once per code generation pass.
  // Return a non-empty string to prepend library definitions/includes.
  // Return null or empty string if no preamble is needed for this set of nodes.
  preamble?: (nodes: Node[]) => string | null
}
