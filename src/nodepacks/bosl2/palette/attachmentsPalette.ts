import type { PaletteItem } from '@/types/nodes'

export const ATTACHMENTS_PALETTE: PaletteItem[] = [
  {
    type: 'bosl2_diff', label: 'diff', category: 'bosl2_attachments',
    defaultData: { remove: 'remove', keep: '' },
    description: 'BOSL2 diff() — boolean difference using attachment tags.',
    inputs: 'remove — tag to subtract; keep — tag to keep',
  },
  {
    type: 'bosl2_intersect', label: 'intersect', category: 'bosl2_attachments',
    defaultData: { intersect: 'intersect', keep: '' },
    description: 'BOSL2 intersect() — boolean intersection using attachment tags.',
    inputs: 'intersect — tag to intersect; keep — tag to keep',
  },
  {
    type: 'bosl2_position', label: 'position', category: 'bosl2_attachments',
    defaultData: { at: 'TOP' },
    description: 'BOSL2 position() — place a child at a named anchor of the parent.',
    inputs: 'at — anchor name (e.g. TOP, BOTTOM, LEFT, RIGHT, FRONT, BACK)',
  },
  {
    type: 'bosl2_attach', label: 'attach', category: 'bosl2_attachments',
    defaultData: { parent: 'TOP', child: 'BOT', overlap: 0 },
    description: 'BOSL2 attach() — attach a child anchor to a parent anchor.',
    inputs: 'parent — parent anchor; child — child anchor; overlap',
  },
  {
    type: 'bosl2_tag', label: 'tag', category: 'bosl2_attachments',
    defaultData: { tag: 'remove' },
    description: 'BOSL2 tag() — tag children for use with diff()/intersect().',
    inputs: 'tag — tag name string',
  },
  {
    type: 'bosl2_recolor', label: 'recolor', category: 'bosl2_attachments',
    defaultData: { c: 'red' },
    description: 'BOSL2 recolor() — set the color of children.',
    inputs: 'c — color name or [r,g,b] expression',
  },
  {
    type: 'bosl2_half_of', label: 'half_of', category: 'bosl2_attachments',
    defaultData: { vx: 0, vy: 0, vz: 1, cpx: 0, cpy: 0, cpz: 0 },
    description: 'BOSL2 half_of() — cut children in half along a plane.',
    inputs: 'vx, vy, vz — plane normal; cpx, cpy, cpz — center point',
  },
  {
    type: 'bosl2_partition', label: 'partition', category: 'bosl2_attachments',
    defaultData: { x: 100, y: 100, z: 100, spread: 10, cutpath: 'jigsaw' },
    description: 'BOSL2 partition() — split an object into interlocking pieces.',
    inputs: 'x, y, z — size; spread; cutpath — cut pattern',
  },
]
