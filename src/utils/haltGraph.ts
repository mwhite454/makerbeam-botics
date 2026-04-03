import type { Edge } from "@xyflow/react";

/**
 * Compute the set of node IDs that are downstream of any halted node.
 * "Downstream" means reachable by following edges in the forward direction
 * (source → target, i.e. toward the graph roots / sinks).
 *
 * These nodes should be visually dimmed since they are excluded from codegen
 * when halts are active.
 */
export function computeDownstreamOfHalts(
  haltedIds: string[],
  edges: Edge[],
): Set<string> {
  if (haltedIds.length === 0) return new Set();

  // Build forward adjacency: source → [targets that consume it]
  // In the React Flow graph edges go from upstream (source) to downstream (target),
  // but in this node editor the convention is reversed: edges point from child (source)
  // to parent (target). "Downstream" of a halted node means toward the roots, which
  // is the target direction.
  const forward = new Map<string, string[]>();
  for (const edge of edges) {
    // edge.source is the upstream node (child), edge.target is the downstream node (parent/consumer)
    if (!forward.has(edge.source)) forward.set(edge.source, []);
    forward.get(edge.source)!.push(edge.target);
  }

  const haltedSet = new Set(haltedIds);
  const dimmed = new Set<string>();
  const queue: string[] = [];

  // Seed BFS with the direct downstream neighbours of halted nodes
  for (const id of haltedIds) {
    const neighbours = forward.get(id);
    if (!neighbours) continue;
    for (const n of neighbours) {
      if (!haltedSet.has(n) && !dimmed.has(n)) {
        dimmed.add(n);
        queue.push(n);
      }
    }
  }

  // BFS forward
  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbours = forward.get(current);
    if (!neighbours) continue;
    for (const n of neighbours) {
      if (!dimmed.has(n) && !haltedSet.has(n)) {
        dimmed.add(n);
        queue.push(n);
      }
    }
  }

  return dimmed;
}
