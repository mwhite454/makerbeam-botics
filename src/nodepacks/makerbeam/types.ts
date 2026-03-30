import type { PaletteItem } from '@/types/nodes'

export interface MakerBeamData {
  length: number
}

export const MAKERBEAM_PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'makerbeam',
    label: 'makerbeam',
    category: 'makerbeam',
    defaultData: { length: 150 } as unknown as Record<string, unknown>,
    description: 'Places a MakerBeamXL 15×15 mm aluminum T-slot extrusion profile along the Z axis.',
    inputs: 'length — beam length in mm',
  },
]
