import type { NodeTypes } from '@xyflow/react'
import type { NodePackDefinition } from '@/types/nodePack'
import type { PaletteItem } from '@/types/nodes'
import { CATEGORY_COLORS, CATEGORY_TEXT, CATEGORY_LABELS } from '@/types/nodes'
import { makerbeamPack } from './makerbeam'
import {
  bosl2Shapes3dPack,
  bosl2Shapes2dPack,
  bosl2TransformsPack,
  bosl2DistributorsPack,
  bosl2RoundingPack,
  bosl2MechanicalPack,
  bosl2AttachmentsPack,
} from './bosl2'

// ─── Pack registry ────────────────────────────────────────────────────────────
// Add new packs here. Each entry is a self-contained NodePackDefinition.

export const NODE_PACKS: NodePackDefinition[] = [
  makerbeamPack,
  bosl2Shapes3dPack,
  bosl2Shapes2dPack,
  bosl2TransformsPack,
  bosl2DistributorsPack,
  bosl2RoundingPack,
  bosl2MechanicalPack,
  bosl2AttachmentsPack,
]

// ─── Populate core category maps with pack entries ───────────────────────────
// This allows BaseNode to look up pack category colors without a circular import.
// Runs once at module evaluation time.
for (const pack of NODE_PACKS) {
  CATEGORY_COLORS[pack.category] = pack.categoryColor
  CATEGORY_TEXT[pack.category]   = pack.categoryTextColor
  CATEGORY_LABELS[pack.category] = pack.categoryLabel
}

// ─── Computed aggregates (consumed by core registries) ────────────────────────

export const PACK_NODE_TYPES: NodeTypes = Object.assign(
  {},
  ...NODE_PACKS.map((p) => p.nodeTypes),
)

export const PACK_PALETTE_ITEMS: PaletteItem[] = NODE_PACKS.flatMap((p) => p.paletteItems)

export const PACK_CATEGORY_ORDER: string[] = NODE_PACKS.map((p) => p.category)

export const PACK_CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  NODE_PACKS.map((p) => [p.category, p.categoryColor]),
)

export const PACK_CATEGORY_TEXT: Record<string, string> = Object.fromEntries(
  NODE_PACKS.map((p) => [p.category, p.categoryTextColor]),
)

export const PACK_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  NODE_PACKS.map((p) => [p.category, p.categoryLabel]),
)

export const PACK_CODEGEN_HANDLERS: Record<
  string,
  NodePackDefinition['codegenHandlers'][string]
> = Object.assign({}, ...NODE_PACKS.map((p) => p.codegenHandlers))
