# F-005: Node Editor Keyboard Navigation

**Status**: Draft — Ready for Architectural Review
**Source Plans**: `plans/hot-key-expansion.md`
**Dependencies**: None
**Estimated Complexity**: M

---

## Problem Statement

The node editor is mouse-dependent. Users must click to select nodes, drag to navigate, and use the palette panel to add new nodes. There is no keyboard-driven workflow for traversing a node graph, inspecting connections, or quickly inserting new nodes.

For power users doing iterative design — select a node, check downstream, adjust, move on — mouse-only interaction is slow and breaks flow. Keyboard navigation is table stakes for any serious editor (VS Code, Blender, Figma all have it).

---

## Requirements

### R1: Downstream Traversal

SHIFT + RIGHT ARROW moves selection one node downstream (toward the render output) along the connected edge.

**Acceptance Criteria:**
- [ ] With a node selected, SHIFT+RIGHT moves to the next connected downstream node
- [ ] If multiple downstream connections exist, follows the primary output (first/default edge)
- [ ] Selection visually updates to the new node
- [ ] Node is scrolled into view if off-screen

### R2: Upstream Traversal

SHIFT + LEFT ARROW moves selection one node upstream (toward the first node / source primitives).

**Acceptance Criteria:**
- [ ] With a node selected, SHIFT+LEFT moves to the connected upstream node
- [ ] If multiple upstream connections exist, follows the primary input (first/default edge)
- [ ] Selection visually updates to the new node
- [ ] Node is scrolled into view if off-screen

### R3: Wrap-Around Traversal

At either end of a chain, continuing in the same direction wraps to the opposite terminus.

**Acceptance Criteria:**
- [ ] At the last node in a chain, SHIFT+RIGHT wraps to the first node in that chain
- [ ] At the first node in a chain, SHIFT+LEFT wraps to the last node in that chain
- [ ] Wrap follows the same chain — does not jump to unconnected branches

**Example (from plan):**
> 4 nodes: CUBE → ROTATE → TRANSLATE → SCALE. SCALE is selected, SHIFT+RIGHT wraps back to CUBE. CUBE is selected, SHIFT+LEFT wraps to SCALE.

### R4: Jump to Output Edge

SHIFT + TAB jumps focus from the selected node to its output edge/handle.

**Acceptance Criteria:**
- [ ] With a node selected, SHIFT+TAB moves focus to the node's output edge
- [ ] Output edge is visually highlighted when focused
- [ ] If the node has no output edge, SHIFT+TAB is a no-op

### R5: Quick Node Insert from Edge

With an output edge focused, pressing SPACE opens a filterable dropdown for adding a new node (same options as the node palette).

**Acceptance Criteria:**
- [ ] SPACE on a focused output edge opens a dropdown/command palette
- [ ] Dropdown is filterable by typing (same search behavior as the palette)
- [ ] Selecting a node from the dropdown inserts it downstream, connected to the focused edge
- [ ] ESC closes the dropdown without inserting
- [ ] Dropdown appears near the edge (contextual positioning, not centered on screen)

---

## Technical Considerations

### Keyboard Event Handling

These shortcuts use SHIFT as a modifier to avoid conflicting with XYFlow's default keyboard bindings (arrow keys for panning, etc.). Verify that SHIFT+arrow doesn't conflict with any existing XYFlow or browser behavior.

The event handler should be registered at the ReactFlow wrapper level, only active when the node editor canvas has focus (not when editing a node input field or expression builder — that would conflict with F-001's keyboard navigation within inputs).

### Graph Traversal

Upstream/downstream traversal requires walking the edge adjacency graph. The current XYFlow graph data (nodes + edges) should support this directly. For wrap-around, we need to find the chain termini — nodes with no outgoing (downstream end) or no incoming (upstream end) connections in the same connected subgraph.

### Ambiguity: Multiple Connections

When a node has multiple inputs or outputs, the plan implies "follow the primary." Define primary as the first/default handle. If the user needs to choose between branches, that's a v2 concern — v1 follows the default path.

### Open Questions for Review

- [ ] **Multi-output nodes**: When a node has multiple output edges (e.g., IF node with YES/NO), which path does SHIFT+RIGHT follow? Recommend: first/default output. Branch selection is a v2 feature.
- [ ] **Focus management**: How does SHIFT+TAB to output edge interact with the browser's native tab behavior? Need to prevent default carefully.
- [ ] **Quick insert positioning**: Where exactly does the new node appear? Directly downstream with auto-layout, or at a fixed offset from the edge endpoint?

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Shortcut conflicts with XYFlow internals | Medium | Medium | Audit XYFlow's keyboard handler; use `stopPropagation` where needed |
| Shortcut conflicts with F-001 expression editor | Medium | High | Expression editor keyboard events (Enter, Tab, arrows) must only fire when an input is focused. Node traversal shortcuts only fire when canvas is focused. Clear focus boundary. |
| Graph cycles causing infinite traversal | Low | Medium | Detect cycles and stop traversal at previously-visited nodes |

---

## Dependencies & Sequencing

- **Depends on**: Nothing
- **Complements**: F-001 (Expression Editor) — F-001 handles keyboard navigation *within* a node's inputs (Tab, Enter). F-005 handles keyboard navigation *between* nodes (SHIFT+arrows). The two must coexist without conflict.
- **Recommended sequencing**: Can ship independently. Low risk, medium value. Good candidate for a quick win.

---

## Source Traceability

| Requirement | Source |
|---|---|
| R1: Downstream traversal | `hot-key-expansion.md` item 1 |
| R2: Upstream traversal | `hot-key-expansion.md` item 2 |
| R3: Wrap-around | `hot-key-expansion.md` item 3 |
| R4: Jump to output edge | `hot-key-expansion.md` item 4 |
| R5: Quick node insert | `hot-key-expansion.md` item 5 |
