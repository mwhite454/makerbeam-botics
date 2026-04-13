/**
 * Tests for F-004 — Halt Flow Rendering.
 *
 * Validates the downstream-dimming algorithm for the R3 (progressive upstream
 * walk) and R4 (convergent branch halt) acceptance criteria, plus core cases.
 *
 * Graph edge convention in this codebase:
 *   edge.source = upstream node (producer / child)
 *   edge.target = downstream node (consumer / parent)
 *
 * "Downstream of a halted node" means nodes reachable by following
 * source → target (toward roots/sinks). These nodes are dimmed because
 * they are excluded from codegen when halt is active.
 */

import { describe, it, expect } from 'vitest'
import { computeDownstreamOfHalts } from '../haltGraph'
import type { Edge } from '@xyflow/react'

/** Helper to build a minimal edge object. */
function edge(source: string, target: string): Edge {
  return { id: `${source}->${target}`, source, target } as Edge
}

// ─── Baseline ────────────────────────────────────────────────────────────────

describe('computeDownstreamOfHalts — baseline', () => {
  it('returns empty set when no nodes are halted', () => {
    const edges = [edge('a', 'b'), edge('b', 'c')]
    expect(computeDownstreamOfHalts([], edges)).toEqual(new Set())
  })

  it('returns empty set when halted node has no downstream consumers', () => {
    // a → b → c, halt c (the root/sink — nothing downstream)
    const edges = [edge('a', 'b'), edge('b', 'c')]
    const dimmed = computeDownstreamOfHalts(['c'], edges)
    expect(dimmed.size).toBe(0)
  })

  it('does not include the halted node itself in the dimmed set', () => {
    const edges = [edge('a', 'b'), edge('b', 'c')]
    const dimmed = computeDownstreamOfHalts(['b'], edges)
    expect(dimmed.has('b')).toBe(false)
  })
})

// ─── R3: Progressive Halt (Upstream Walk) ────────────────────────────────────
//
// Scenario from F-004:
//   3 primitives: cube, sphere, cylinder.
//   Each branches: primitive → translate → rotate (3 parallel chains).
//   The test chain: cube → translate-cube → rotate-cube
//
// When halted at rotate-cube (downstream end): nothing above it is dimmed.
// When halted at translate-cube (one step upstream): rotate-cube is dimmed.
// When halted at cube (furthest upstream): translate-cube + rotate-cube dimmed.

describe('computeDownstreamOfHalts — R3: progressive halt / upstream walk', () => {
  //   cube ──► translate-cube ──► rotate-cube ──► (root)
  const edges = [
    edge('cube', 'translate-cube'),
    edge('translate-cube', 'rotate-cube'),
  ]

  it('halt at the furthest downstream node dims nothing', () => {
    const dimmed = computeDownstreamOfHalts(['rotate-cube'], edges)
    expect(dimmed.size).toBe(0)
  })

  it('halt at mid-chain dims only the downstream node', () => {
    const dimmed = computeDownstreamOfHalts(['translate-cube'], edges)
    expect(dimmed).toEqual(new Set(['rotate-cube']))
  })

  it('halt at the source dims all nodes downstream', () => {
    const dimmed = computeDownstreamOfHalts(['cube'], edges)
    expect(dimmed).toEqual(new Set(['translate-cube', 'rotate-cube']))
  })

  it('moving halt upstream adds the previously halted node to dimmed set', () => {
    // Start: halt at translate-cube → rotate-cube is dimmed
    const dimmedFirst = computeDownstreamOfHalts(['translate-cube'], edges)
    expect(dimmedFirst.has('rotate-cube')).toBe(true)
    expect(dimmedFirst.has('translate-cube')).toBe(false)

    // Move halt upstream to cube → translate-cube AND rotate-cube are now dimmed
    const dimmedMoved = computeDownstreamOfHalts(['cube'], edges)
    expect(dimmedMoved.has('translate-cube')).toBe(true)
    expect(dimmedMoved.has('rotate-cube')).toBe(true)
  })
})

// ─── R3: Parallel chains (independent branches stay independent) ──────────────
//
// Full F-004 scenario: 3 parallel chains, halting in one must not affect others.

describe('computeDownstreamOfHalts — R3: parallel chains', () => {
  //   cube ──► t-cube ──► r-cube
  //   sphere ──► t-sphere ──► r-sphere
  //   cylinder ──► t-cylinder ──► r-cylinder

  const edges = [
    edge('cube', 't-cube'),
    edge('t-cube', 'r-cube'),
    edge('sphere', 't-sphere'),
    edge('t-sphere', 'r-sphere'),
    edge('cylinder', 't-cylinder'),
    edge('t-cylinder', 'r-cylinder'),
  ]

  it('halting at cube dims only the cube chain, not the other two chains', () => {
    const dimmed = computeDownstreamOfHalts(['cube'], edges)
    expect(dimmed).toEqual(new Set(['t-cube', 'r-cube']))
    expect(dimmed.has('sphere')).toBe(false)
    expect(dimmed.has('t-sphere')).toBe(false)
    expect(dimmed.has('cylinder')).toBe(false)
  })

  it('halting at translate-cube dims only r-cube', () => {
    const dimmed = computeDownstreamOfHalts(['t-cube'], edges)
    expect(dimmed).toEqual(new Set(['r-cube']))
  })
})

// ─── R4: Convergent Branch Halt ───────────────────────────────────────────────
//
// Scenario from F-004:
//   Two spheres converge into a union, then a rotation is applied.
//   sphere-a ──► union ──► rotation
//   sphere-b ──►
//
// Halt at union → rotation is dimmed (both sphere inputs render through union).
// Halt at sphere-a → union + rotation are dimmed (only sphere-a isolated).

describe('computeDownstreamOfHalts — R4: convergent branch halt', () => {
  //   sphere-a ──┐
  //              ├──► union ──► rotation
  //   sphere-b ──┘

  const edges = [
    edge('sphere-a', 'union'),
    edge('sphere-b', 'union'),
    edge('union', 'rotation'),
  ]

  it('halt at union dims only rotation (both branches render into union)', () => {
    const dimmed = computeDownstreamOfHalts(['union'], edges)
    expect(dimmed).toEqual(new Set(['rotation']))
    expect(dimmed.has('union')).toBe(false)
    expect(dimmed.has('sphere-a')).toBe(false)
    expect(dimmed.has('sphere-b')).toBe(false)
  })

  it('halt at sphere-a dims union and rotation, isolating one contributor', () => {
    const dimmed = computeDownstreamOfHalts(['sphere-a'], edges)
    expect(dimmed.has('union')).toBe(true)
    expect(dimmed.has('rotation')).toBe(true)
    expect(dimmed.has('sphere-b')).toBe(false)
  })

  it('halt at sphere-b dims union and rotation, isolating the other contributor', () => {
    const dimmed = computeDownstreamOfHalts(['sphere-b'], edges)
    expect(dimmed.has('union')).toBe(true)
    expect(dimmed.has('rotation')).toBe(true)
    expect(dimmed.has('sphere-a')).toBe(false)
  })
})

// ─── R4: Multiple simultaneous halts ─────────────────────────────────────────
//
// Multiple nodes can be halted at the same time; all become roots.
// Their individual downstream sets are merged.

describe('computeDownstreamOfHalts — R4: multiple simultaneous halts', () => {
  //   a ──► b ──► c
  //   d ──► e ──► f

  const edges = [
    edge('a', 'b'),
    edge('b', 'c'),
    edge('d', 'e'),
    edge('e', 'f'),
  ]

  it('halting a and d dims both chains downstream', () => {
    const dimmed = computeDownstreamOfHalts(['a', 'd'], edges)
    expect(dimmed).toEqual(new Set(['b', 'c', 'e', 'f']))
  })

  it('halting b and e dims only their direct tails', () => {
    const dimmed = computeDownstreamOfHalts(['b', 'e'], edges)
    expect(dimmed).toEqual(new Set(['c', 'f']))
  })
})

// ─── Diamond / shared ancestor topology ──────────────────────────────────────
//
// Tests complex graph topologies (risk noted in F-004 risk table).
//
//   root ──► mid-a ──┐
//                    ├──► sink
//   root ──► mid-b ──┘

describe('computeDownstreamOfHalts — diamond topology', () => {
  const edges = [
    edge('root', 'mid-a'),
    edge('root', 'mid-b'),
    edge('mid-a', 'sink'),
    edge('mid-b', 'sink'),
  ]

  it('halt at root dims mid-a, mid-b, and sink without duplicates', () => {
    const dimmed = computeDownstreamOfHalts(['root'], edges)
    expect(dimmed).toEqual(new Set(['mid-a', 'mid-b', 'sink']))
  })

  it('halt at mid-a dims only sink (mid-b still active)', () => {
    const dimmed = computeDownstreamOfHalts(['mid-a'], edges)
    expect(dimmed).toEqual(new Set(['sink']))
    expect(dimmed.has('mid-b')).toBe(false)
  })
})
