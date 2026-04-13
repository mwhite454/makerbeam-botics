import { useCallback } from "react";
import type { Node, Edge, NodeChange, ReactFlowInstance } from "@xyflow/react";
import type React from "react";

interface UseGraphNavigationOptions {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  rfInstance: React.RefObject<ReactFlowInstance | null>;
}

/**
 * F-005: Keyboard navigation between nodes in the node graph.
 *
 * Provides SHIFT+RIGHT (downstream) and SHIFT+LEFT (upstream) traversal
 * with wrap-around at chain termini, plus helpers for edge-focus mode.
 *
 * Graph terminology:
 *   upstream   = toward source primitives (edge.source side)
 *   downstream = toward render output    (edge.target side)
 *
 * "Primary" connection = first edge found in the edges array matching the
 * source or target — consistent with the spec's "first/default handle" rule.
 */
export function useGraphNavigation({
  nodes,
  edges,
  onNodesChange,
  rfInstance,
}: UseGraphNavigationOptions) {
  // ── Viewport helpers ──────────────────────────────────────────────────────

  /** Pan the canvas to center on a node without changing the zoom level. */
  const scrollNodeIntoView = useCallback(
    (nodeId: string) => {
      if (!rfInstance.current) return;
      const node = rfInstance.current.getNode(nodeId);
      if (!node) return;
      // XYFlow v12 stores actual DOM dimensions under `measured`
      const measured = (node as Record<string, unknown>).measured as
        | { width?: number; height?: number }
        | undefined;
      const w = measured?.width ?? 200;
      const h = measured?.height ?? 150;
      rfInstance.current.setCenter(
        node.position.x + w / 2,
        node.position.y + h / 2,
        { duration: 300 },
      );
    },
    [rfInstance],
  );

  // ── Selection helpers ─────────────────────────────────────────────────────

  /**
   * Deselect all currently selected nodes, select targetId, scroll into view.
   * Uses onNodesChange so XYFlow keeps its internal selection state in sync.
   */
  const selectNode = useCallback(
    (targetId: string) => {
      const changes: NodeChange[] = nodes
        .filter((n) => n.selected)
        .map((n) => ({ type: "select" as const, id: n.id, selected: false }));
      changes.push({ type: "select" as const, id: targetId, selected: true });
      onNodesChange(changes);
      scrollNodeIntoView(targetId);
    },
    [nodes, onNodesChange, scrollNodeIntoView],
  );

  /**
   * Returns the id of the currently selected node, or null if nothing is
   * selected or multiple nodes are selected.
   */
  const getSelectedNodeId = useCallback((): string | null => {
    const selected = nodes.filter((n) => n.selected);
    return selected.length === 1 ? selected[0].id : null;
  }, [nodes]);

  // ── Graph adjacency ───────────────────────────────────────────────────────

  /** Primary downstream neighbour: first edge where source === nodeId. */
  const getDownstreamId = useCallback(
    (nodeId: string): string | null =>
      edges.find((e) => e.source === nodeId)?.target ?? null,
    [edges],
  );

  /** Primary upstream neighbour: first edge where target === nodeId. */
  const getUpstreamId = useCallback(
    (nodeId: string): string | null =>
      edges.find((e) => e.target === nodeId)?.source ?? null,
    [edges],
  );

  /**
   * Walk upstream along primary edges to find the chain terminus —
   * the node with no upstream connection. Cycle-safe via visited set.
   */
  const findChainStart = useCallback(
    (nodeId: string): string => {
      const visited = new Set<string>();
      let current = nodeId;
      for (;;) {
        if (visited.has(current)) break; // cycle guard
        visited.add(current);
        const up = getUpstreamId(current);
        if (!up) break;
        current = up;
      }
      return current;
    },
    [getUpstreamId],
  );

  /**
   * Walk downstream along primary edges to find the chain terminus —
   * the node with no downstream connection. Cycle-safe via visited set.
   */
  const findChainEnd = useCallback(
    (nodeId: string): string => {
      const visited = new Set<string>();
      let current = nodeId;
      for (;;) {
        if (visited.has(current)) break; // cycle guard
        visited.add(current);
        const down = getDownstreamId(current);
        if (!down) break;
        current = down;
      }
      return current;
    },
    [getDownstreamId],
  );

  // ── Navigation actions ────────────────────────────────────────────────────

  /**
   * R1 + R3: SHIFT+RIGHT — move to primary downstream node.
   * At the downstream terminus, wraps back to the chain start.
   */
  const navigateDownstream = useCallback(() => {
    const currentId = getSelectedNodeId();
    if (!currentId) return;
    const nextId = getDownstreamId(currentId);
    if (nextId) {
      selectNode(nextId);
    } else {
      // Wrap: jump to chain start
      const start = findChainStart(currentId);
      if (start !== currentId) selectNode(start);
    }
  }, [getSelectedNodeId, getDownstreamId, selectNode, findChainStart]);

  /**
   * R2 + R3: SHIFT+LEFT — move to primary upstream node.
   * At the upstream terminus, wraps forward to the chain end.
   */
  const navigateUpstream = useCallback(() => {
    const currentId = getSelectedNodeId();
    if (!currentId) return;
    const prevId = getUpstreamId(currentId);
    if (prevId) {
      selectNode(prevId);
    } else {
      // Wrap: jump to chain end
      const end = findChainEnd(currentId);
      if (end !== currentId) selectNode(end);
    }
  }, [getSelectedNodeId, getUpstreamId, selectNode, findChainEnd]);

  /**
   * R4: Returns the first output edge from the currently selected node, or
   * null if no node is selected or it has no outgoing connections.
   * Used by SHIFT+TAB to identify which edge to focus.
   */
  const getOutputEdgeOfSelected = useCallback((): Edge | null => {
    const currentId = getSelectedNodeId();
    if (!currentId) return null;
    return edges.find((e) => e.source === currentId) ?? null;
  }, [getSelectedNodeId, edges]);

  return {
    navigateDownstream,
    navigateUpstream,
    getSelectedNodeId,
    getDownstreamId,
    getUpstreamId,
    getOutputEdgeOfSelected,
    scrollNodeIntoView,
    selectNode,
  };
}
