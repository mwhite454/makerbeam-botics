import { useCallback, useRef, useState, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type ReactFlowInstance,
  type Viewport,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useEditorStore } from "@/store/editorStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { nodeTypes } from "@/nodes";
import { PALETTE_ITEMS } from "@/types/nodes";
import { PACK_PALETTE_ITEMS } from "@/nodepacks";
import { DeletableEdge } from "@/components/DeletableEdge";
import { SearchBar } from "@/components/SearchBar";
import { ContextMenu } from "@/components/panels/ContextMenu";
import { QuickInsertDropdown } from "@/components/panels/QuickInsertDropdown";
import { computeDownstreamOfHalts } from "@/utils/haltGraph";
import { HaltDimmedContext } from "@/contexts/HaltDimmedContext";
import { useGraphNavigation } from "@/hooks/useGraphNavigation";

const edgeTypes = { default: DeletableEdge };
const ALL_PALETTE_ITEMS = [...PALETTE_ITEMS, ...PACK_PALETTE_ITEMS];

let nodeIdCounter = 1;

/** State for the F-005 quick-insert popup (R5). */
interface QuickInsertState {
  /** The focused edge that triggered the insert. */
  edgeId: string;
  /** Screen-space X for positioning the dropdown. */
  screenX: number;
  /** Screen-space Y for positioning the dropdown. */
  screenY: number;
}

export function EditorPanel() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useEditorStore();
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const groupSelectedNodes = useEditorStore((s) => s.groupSelectedNodes);
  const toggleNodeHalted = useEditorStore((s) => s.toggleNodeHalted);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  // ── F-005: Keyboard navigation state ───────────────────────────────────────
  /**
   * When non-null, the user has pressed SHIFT+TAB to "focus" an output edge.
   * SPACE will then open the quick-insert dropdown.
   * ESC will return focus to the edge's source node.
   */
  const [focusedEdgeId, setFocusedEdgeId] = useState<string | null>(null);
  /** When non-null, the quick-insert dropdown is visible. */
  const [quickInsert, setQuickInsert] = useState<QuickInsertState | null>(null);

  const {
    navigateDownstream,
    navigateUpstream,
    getSelectedNodeId,
    getOutputEdgeOfSelected,
    selectNode,
  } = useGraphNavigation({ nodes, edges, onNodesChange, rfInstance });

  // ── Downstream dim computation ─────────────────────────────────────────────
  const dimmedNodeIds = useMemo(() => {
    const haltedIds = nodes
      .filter((n) => (n.data as Record<string, unknown>)._halted)
      .map((n) => n.id);
    return computeDownstreamOfHalts(haltedIds, edges);
  }, [nodes, edges]);

  const lastViewport = usePreferencesStore((s) => s.lastViewport);
  const setLastViewport = usePreferencesStore((s) => s.setLastViewport);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData(
        "application/reactflow-nodetype",
      );
      if (!nodeType || !rfInstance.current) return;

      const paletteItem = ALL_PALETTE_ITEMS.find((p) => p.type === nodeType);
      if (!paletteItem) return;

      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${nodeType}-${nodeIdCounter++}`,
        type: nodeType,
        position,
        data: { ...paletteItem.defaultData },
      };

      addNode(newNode);
    },
    [addNode],
  );

  // ── Keyboard handler ────────────────────────────────────────────────────────
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      // ── F-005 R1: SHIFT+RIGHT — navigate downstream ──────────────────────
      if (
        event.key === "ArrowRight" &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isInputFocused
      ) {
        event.preventDefault();
        event.stopPropagation();
        // Clear any edge-focus mode before navigating
        if (focusedEdgeId) {
          onEdgesChange([
            { type: "select" as const, id: focusedEdgeId, selected: false },
          ]);
          setFocusedEdgeId(null);
        }
        setQuickInsert(null);
        navigateDownstream();
        return;
      }

      // ── F-005 R2: SHIFT+LEFT — navigate upstream ─────────────────────────
      if (
        event.key === "ArrowLeft" &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isInputFocused
      ) {
        event.preventDefault();
        event.stopPropagation();
        if (focusedEdgeId) {
          onEdgesChange([
            { type: "select" as const, id: focusedEdgeId, selected: false },
          ]);
          setFocusedEdgeId(null);
        }
        setQuickInsert(null);
        navigateUpstream();
        return;
      }

      // ── F-005 R4: SHIFT+TAB — jump focus to the node's output edge ───────
      if (
        event.key === "Tab" &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isInputFocused
      ) {
        event.preventDefault();
        event.stopPropagation();
        const outputEdge = getOutputEdgeOfSelected();
        if (outputEdge) {
          // Deselect the current node
          const currentId = getSelectedNodeId();
          if (currentId) {
            onNodesChange([
              { type: "select" as const, id: currentId, selected: false },
            ]);
          }
          // Clear any existing edge selection first so the focused edge is
          // the only visually highlighted one (guards against Shift-click
          // multi-selection leaving stale selected edges).
          const selectedEdgeChanges = edges
            .filter((e) => e.selected)
            .map((e) => ({ type: "select" as const, id: e.id, selected: false }));
          // Visually highlight the focused edge via XYFlow selection
          onEdgesChange([
            ...selectedEdgeChanges,
            { type: "select" as const, id: outputEdge.id, selected: true },
          ]);
          setFocusedEdgeId(outputEdge.id);
          setQuickInsert(null);
        }
        return;
      }

      // ── F-005 R5: SPACE — open quick-insert when an edge is focused ───────
      if (
        event.key === " " &&
        focusedEdgeId &&
        !isInputFocused
      ) {
        event.preventDefault();
        event.stopPropagation();
        const edge = edges.find((e) => e.id === focusedEdgeId);
        if (edge && rfInstance.current) {
          const sourceNode = rfInstance.current.getNode(edge.source);
          if (sourceNode) {
            const measured = (sourceNode as Record<string, unknown>)
              .measured as { width?: number; height?: number } | undefined;
            const w = measured?.width ?? 200;
            const h = measured?.height ?? 150;
            // Use absolute flow position so grouped nodes (which store
            // position relative to their parent) are placed correctly.
            const srcExt = sourceNode as typeof sourceNode & {
              positionAbsolute?: { x: number; y: number };
            };
            const absolutePos = srcExt.positionAbsolute ?? sourceNode.position;
            // Position dropdown just to the right of the source node's output
            const screenPos = rfInstance.current.flowToScreenPosition({
              x: absolutePos.x + w + 24,
              y: absolutePos.y + h / 2 - 20,
            });
            setQuickInsert({
              edgeId: focusedEdgeId,
              screenX: screenPos.x,
              screenY: screenPos.y,
            });
          }
        }
        return;
      }

      // ── F-005: ESC — dismiss quick-insert or return from edge-focus mode ──
      if (event.key === "Escape") {
        if (quickInsert) {
          setQuickInsert(null);
          return;
        }
        if (focusedEdgeId) {
          const edge = edges.find((e) => e.id === focusedEdgeId);
          // Deselect the edge
          onEdgesChange([
            { type: "select" as const, id: focusedEdgeId, selected: false },
          ]);
          setFocusedEdgeId(null);
          // Re-select the edge's source node
          if (edge) selectNode(edge.source);
          return;
        }
      }

      // ── Existing shortcuts ─────────────────────────────────────────────────

      if (event.key === "Delete" || event.key === "Backspace") {
        // Don't delete if an input is focused
        if (isInputFocused) {
          return;
        }
        // ReactFlow handles this via onNodesChange/onEdgesChange with remove changes
      }

      // Ctrl+G: group selected nodes
      if ((event.ctrlKey || event.metaKey) && event.key === "g") {
        event.preventDefault();
        groupSelectedNodes();
      }

      // H: toggle halt on selected nodes
      if (
        event.key === "h" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isInputFocused
      ) {
        const selected = useEditorStore
          .getState()
          .nodes.filter((n) => n.selected);
        for (const node of selected) {
          toggleNodeHalted(node.id);
        }
      }
    },
    [
      groupSelectedNodes,
      toggleNodeHalted,
      navigateDownstream,
      navigateUpstream,
      getOutputEdgeOfSelected,
      getSelectedNodeId,
      onNodesChange,
      onEdgesChange,
      edges,
      focusedEdgeId,
      quickInsert,
      selectNode,
    ],
  );

  // ── Quick-insert handler (F-005 R5) ─────────────────────────────────────────
  const handleQuickInsert = useCallback(
    (item: (typeof ALL_PALETTE_ITEMS)[number]) => {
      if (!quickInsert || !rfInstance.current) return;

      const edge = edges.find((e) => e.id === quickInsert.edgeId);
      if (!edge) {
        setQuickInsert(null);
        setFocusedEdgeId(null);
        return;
      }

      const sourceNode = rfInstance.current.getNode(edge.source);
      const targetNode = rfInstance.current.getNode(edge.target);

      if (!sourceNode) {
        setQuickInsert(null);
        setFocusedEdgeId(null);
        return;
      }

      // Helper: resolve the absolute flow-coordinate position of a node.
      // Grouped nodes store position relative to their parentId; we use
      // positionAbsolute (maintained by XYFlow internally) when available,
      // and fall back to walking the parent chain otherwise.
      const getAbsolutePosition = (n: Node): { x: number; y: number } => {
        const nExt = n as Node & {
          positionAbsolute?: { x: number; y: number };
        };
        if (nExt.positionAbsolute) return nExt.positionAbsolute;
        let x = n.position.x;
        let y = n.position.y;
        let pid = n.parentId;
        while (pid) {
          const p = rfInstance.current?.getNode(pid);
          if (!p) break;
          x += p.position.x;
          y += p.position.y;
          pid = p.parentId;
        }
        return { x, y };
      };

      const srcAbsolute = getAbsolutePosition(sourceNode);
      const tgtAbsolute = targetNode ? getAbsolutePosition(targetNode) : null;

      // Compute insertion point in absolute flow coordinates
      let newAbsX: number;
      let newAbsY: number;
      if (tgtAbsolute) {
        newAbsX = (srcAbsolute.x + tgtAbsolute.x) / 2;
        newAbsY = (srcAbsolute.y + tgtAbsolute.y) / 2;
      } else {
        const measured = (sourceNode as Record<string, unknown>).measured as
          | { width?: number }
          | undefined;
        newAbsX = srcAbsolute.x + (measured?.width ?? 200) + 120;
        newAbsY = srcAbsolute.y;
      }

      // Assign to a parent group when source and target share one, or when
      // only the source is in a group and there is no target.
      const newParentId: string | undefined =
        targetNode && sourceNode.parentId === targetNode.parentId
          ? sourceNode.parentId
          : !targetNode
            ? sourceNode.parentId
            : undefined;

      // Convert absolute coords back to parent-relative if needed
      let newX = newAbsX;
      let newY = newAbsY;
      if (newParentId) {
        const parentNode = rfInstance.current.getNode(newParentId);
        if (parentNode) {
          const parentAbsolute = getAbsolutePosition(parentNode);
          newX = newAbsX - parentAbsolute.x;
          newY = newAbsY - parentAbsolute.y;
        }
      }

      const newNodeId = `${item.type}-${nodeIdCounter++}`;
      const newNode: Node = {
        id: newNodeId,
        type: item.type,
        position: { x: newX, y: newY },
        data: { ...item.defaultData },
        ...(newParentId ? { parentId: newParentId } : {}),
      };

      // Remove the original edge
      onEdgesChange([{ type: "remove" as const, id: edge.id }]);

      // Add the new node
      addNode(newNode);

      // Wire source → new node
      onConnect({
        source: edge.source,
        target: newNodeId,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: null,
      });

      // Wire new node → original target
      onConnect({
        source: newNodeId,
        target: edge.target,
        sourceHandle: null,
        targetHandle: edge.targetHandle ?? null,
      });

      // Select the newly inserted node
      selectNode(newNodeId);

      setQuickInsert(null);
      setFocusedEdgeId(null);
    },
    [quickInsert, edges, rfInstance, onEdgesChange, addNode, onConnect, selectNode],
  );

  const onMoveEnd = useCallback(
    (_e: MouseEvent | TouchEvent | null, vp: Viewport) => {
      setLastViewport(vp);
    },
    [setLastViewport],
  );

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (contextMenu) return;
      const selected = useEditorStore
        .getState()
        .nodes.filter((n) => n.selected);
      if (selected.length < 2) return;
      setContextMenu({ x: e.clientX, y: e.clientY });
    },
    [contextMenu],
  );

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCanvasTouchStart = useCallback((e: React.TouchEvent) => {
    const selected = useEditorStore.getState().nodes.filter((n) => n.selected);
    if (selected.length < 2) return;
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      setContextMenu({ x: touch.clientX, y: touch.clientY });
    }, 500);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  useEffect(() => cancelLongPress, [cancelLongPress]);

  return (
    <HaltDimmedContext.Provider value={dimmedNodeIds}>
      <div
        className="flex-1 relative bg-gray-950"
        onTouchStart={onCanvasTouchStart}
        onTouchMove={cancelLongPress}
        onTouchEnd={cancelLongPress}
      >
        <SearchBar
          nodes={nodes}
          updateNodeData={
            updateNodeData as (
              id: string,
              data: Record<string, unknown>,
            ) => void
          }
          rfInstance={rfInstance}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={(instance) => {
            rfInstance.current = instance;
          }}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onKeyDown={onKeyDown}
          onMoveEnd={onMoveEnd}
          onContextMenu={onContextMenu}
          defaultViewport={lastViewport}
          deleteKeyCode={["Delete", "Backspace"]}
          edgesFocusable
          multiSelectionKeyCode="Shift"
          selectionKeyCode="Shift"
          className="bg-gray-950"
          defaultEdgeOptions={{
            type: "default",
            selectable: true,
            focusable: true,
            style: { stroke: "#60a5fa", strokeWidth: 2 },
            animated: false,
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#374151"
          />
          <Controls className="!bg-gray-900 !border-gray-700 [&_button]:!bg-gray-800 [&_button]:!border-gray-700 [&_button]:!text-gray-300 [&_button:hover]:!bg-gray-700" />
          <MiniMap
            className="!bg-gray-900 !border-gray-700"
            nodeColor={(node) => {
              const colors: Record<string, string> = {
                sphere: "#2563eb",
                cube: "#2563eb",
                cylinder: "#2563eb",
                polyhedron: "#2563eb",
                circle: "#0891b2",
                square: "#0891b2",
                polygon: "#0891b2",
                scadtext: "#0891b2",
                translate: "#f97316",
                rotate: "#f97316",
                scale: "#f97316",
                mirror: "#f97316",
                resize: "#f97316",
                multmatrix: "#f97316",
                offset: "#f97316",
                union: "#dc2626",
                difference: "#dc2626",
                intersection: "#dc2626",
                linear_extrude: "#9333ea",
                rotate_extrude: "#9333ea",
                hull: "#16a34a",
                minkowski: "#16a34a",
                color: "#16a34a",
                projection: "#16a34a",
                makerbeam: "#eab308",
                for_loop: "#f97316",
                if_cond: "#f97316",
                render_node: "#16a34a",
                import_stl: "#6b7280",
                surface_node: "#6b7280",
                echo_node: "#6b7280",
                var_node: "#6b7280",
              };
              return colors[node.type ?? ""] ?? "#6b7280";
            }}
            maskColor="rgba(0,0,0,0.5)"
          />
        </ReactFlow>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onGroupNodes={groupSelectedNodes}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* F-005 R5: Quick-insert dropdown */}
        {quickInsert && (
          <QuickInsertDropdown
            screenX={quickInsert.screenX}
            screenY={quickInsert.screenY}
            paletteItems={ALL_PALETTE_ITEMS}
            onInsert={handleQuickInsert}
            onClose={() => setQuickInsert(null)}
          />
        )}

        {/* Empty state hint */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="text-4xl mb-3">⬡</div>
              <p className="text-sm font-medium text-gray-500">
                Drag nodes from the palette
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Connect nodes to build OpenSCAD geometry
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Select nodes and press Delete to remove them
              </p>
            </div>
          </div>
        )}
      </div>
    </HaltDimmedContext.Provider>
  );
}
