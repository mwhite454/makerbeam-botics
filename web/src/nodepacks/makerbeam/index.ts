import type { Node } from '@xyflow/react'
import type { NodePackDefinition } from '@/types/nodePack'
import { MakerBeamNode } from './MakerBeamNode'
import { MAKERBEAM_PALETTE_ITEMS } from './types'
import { MAKERBEAM_PREAMBLE } from './preamble'

export const makerbeamPack: NodePackDefinition = {
  id: 'makerbeam',
  category: 'makerbeam',
  categoryLabel: 'MakerBeam',
  categoryColor: 'bg-yellow-500',
  categoryTextColor: 'text-gray-900',

  nodeTypes: {
    makerbeam: MakerBeamNode,
  },

  paletteItems: MAKERBEAM_PALETTE_ITEMS,

  codegenHandlers: {
    makerbeam: (node: Node, ctx) => {
      const d = node.data as Record<string, unknown>
      return `${ctx.pad}makerbeam(${ctx.num(d.length)});\n`
    },
  },

  preamble: (nodes: Node[]) => {
    return nodes.some((n) => n.type === 'makerbeam') ? MAKERBEAM_PREAMBLE : null
  },
}
