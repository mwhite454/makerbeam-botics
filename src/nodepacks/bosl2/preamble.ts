import type { Node } from '@xyflow/react'

// ─── BOSL2 includes ───────────────────────────────────────────────────────────
// The base include covers shapes, transforms, distributors, masks, etc.
// Specialized modules (gears, screws, threading, etc.) need explicit includes.

const BOSL2_BASE = `include <BOSL2/std.scad>\n`

// Map of node type prefixes → extra include lines needed
const EXTRA_INCLUDES: Record<string, string> = {
  bosl2_spur_gear: 'include <BOSL2/gears.scad>\n',
  bosl2_rack: 'include <BOSL2/gears.scad>\n',
  bosl2_bevel_gear: 'include <BOSL2/gears.scad>\n',
  bosl2_worm: 'include <BOSL2/gears.scad>\n',
  bosl2_worm_gear: 'include <BOSL2/gears.scad>\n',
  bosl2_threaded_rod: 'include <BOSL2/threading.scad>\n',
  bosl2_threaded_nut: 'include <BOSL2/threading.scad>\n',
  bosl2_screw: 'include <BOSL2/screws.scad>\n',
  bosl2_screw_hole: 'include <BOSL2/screws.scad>\n',
  bosl2_nut: 'include <BOSL2/screws.scad>\n',
  bosl2_dovetail: 'include <BOSL2/joiners.scad>\n',
  bosl2_snap_pin: 'include <BOSL2/joiners.scad>\n',
  bosl2_knuckle_hinge: 'include <BOSL2/hinges.scad>\n',
  bosl2_bottle_neck: 'include <BOSL2/bottlecaps.scad>\n',
  bosl2_bottle_cap: 'include <BOSL2/bottlecaps.scad>\n',
}

/**
 * Returns the BOSL2 preamble (include lines) needed for the given set of nodes.
 * Returns null if no BOSL2 nodes are present.
 */
export function bosl2Preamble(nodes: Node[]): string | null {
  const types = new Set(nodes.map((n) => n.type))
  const hasAnyBosl2 = [...types].some((t) => t?.startsWith('bosl2_'))
  if (!hasAnyBosl2) return null

  let preamble = BOSL2_BASE

  // Collect unique extra includes
  const extras = new Set<string>()
  for (const t of types) {
    if (t && EXTRA_INCLUDES[t]) {
      extras.add(EXTRA_INCLUDES[t])
    }
  }
  for (const inc of extras) {
    preamble += inc
  }

  return preamble
}
