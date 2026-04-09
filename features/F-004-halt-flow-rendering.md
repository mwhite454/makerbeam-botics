# F-004: Halt Flow Rendering

**Status**: Partially Implemented — Architectural review update
**Source Plans**: `plans/halt-flow-indicator.md`
**Dependencies**: None
**Estimated Complexity**: S–M (down from L — codegen already implemented)

---

## Problem Statement

In OpenSCAD, placing `!` on a geometry statement isolates it in the preview — only that piece renders. This is essential for debugging complex models: you need to see one part in isolation without deleting or disconnecting everything else.

The node editor has no equivalent. When a user has a complex graph with many parallel branches, there's no way to isolate and inspect a single branch or a specific point in a chain. The only option is to manually disconnect nodes, check the preview, then reconnect — which is destructive and error-prone.

### Already Implemented

The following are **already working** in the current codebase:
- **Per-node halt toggle** — `toggleNodeHalted()` in `editorStore.ts` sets `_halted` flag on node data
- **Toggle UI** — `BaseNode.tsx` exposes the halt toggle on every node
- **Visual dimming** — `HaltDimmedContext` dims downstream nodes
- **Codegen isolation** — `generateCode()` in `codegen/index.ts` (lines 847–857) replaces the root set with halted node IDs, so only the upstream subgraph is emitted
- **Multiple halt support** — Multiple nodes can be halted simultaneously; all become roots
- **Clear all halts** — Toolbar action via `clearAllHalts()`
- **Export stripping** — `stripHaltsOnExport` preference in `preferencesStore`
- **Keyboard shortcut** — `H` key toggles halt on selected node (in `EditorPanel.tsx`)

---

## Requirements

### R1: Per-Node Halt Toggle

Every node in the main editor displays a toggle control. When activated, only the geometry upstream of (and including) that node is rendered. All downstream nodes are excluded from codegen.

**Acceptance Criteria:**
- [x] Every node in the main editor has a visible halt toggle (icon or button)
- [ ] Toggle is visually distinct when active (clear on/off state) — **needs UX review**
- [x] ~~Only one halt point is active at a time~~ Multiple halt points supported (all become roots)
- [x] Toggle is accessible without opening the node’s detail panel
- [ ] Styled per design guidelines — Lucide icon, dark theme, compact — **pending F-006 Lucide integration**

### R2: Branch-Aware Codegen Isolation

When halt is active on a node, codegen traces only the edges and branches that lead to that node and generates code exclusively for that subgraph. All other branches are excluded.

**Acceptance Criteria:**
- [x] Codegen walks upstream from the halted node and emits only that subgraph — **implemented via root replacement**
- [x] Parallel branches that do not connect to the halted node are excluded
- [x] The halted node’s own operation is included in the output
- [x] Re-running codegen with halt active produces valid, renderable OpenSCAD

### R3: Progressive Halt (Upstream Walk)

Users can move the halt point upstream along a chain to progressively strip transformations, revealing geometry at earlier stages.

**Acceptance Criteria:**
- [ ] User activates halt on a downstream node → sees full chain up to that point
- [ ] User moves halt one node upstream → the downstream node's transform is removed
- [ ] This works for arbitrarily long chains

**Example (from plan):**
> 3 primitives at origin: cube, sphere, cylinder. Each branches to translate then rotate (3 parallel chains). User halts on the cube's rotate node → only the cube is visible, translated and rotated. User moves halt to translate → cube is visible translated only, no rotation.

### R4: Convergent Branch Halt

When nodes from multiple branches converge (e.g., two spheres into a union), halting at the convergence point renders all contributing branches.

**Acceptance Criteria:**
- [ ] Halting on a union/intersection/difference node renders all geometry flowing into it
- [ ] User can then halt further upstream on one input branch to isolate a single contributor
- [ ] Boolean operation at the halt point is applied (the union result is shown, not separate pieces)

**Example (from plan):**
> Two spheres converge in a union, then a rotation is applied. User halts on union → merged sphere geometry visible. User halts one edge further upstream → only one sphere visible.

---

## Technical Considerations

### Codegen Strategy

Two approaches for the architect to evaluate:

**~~Option A: Subgraph extraction~~** — **Implemented.** Halted nodes replace the root set in `generateCode()`. The existing recursive `emitNode()` naturally walks only the upstream subgraph. No explicit graph copying needed.

**Option B: Codegen filtering** — Not adopted. Root replacement is cleaner.

### Visual Feedback

Nodes downstream of the halt point should be visually dimmed or desaturated. **Partially implemented** via `HaltDimmedContext`. Needs UX review for:
- Whether the dimming contrast is sufficient
- Whether the halted node itself has a distinct enough indicator
- Whether a persistent toolbar indicator shows halt state

### Interaction with Halt in Sub-Editor Tabs

The plan states halt is for the "MAIN editor." Clarify whether halt should also work within loop/module body tabs. Given F-002's scoped preview codegen, halt within a sub-editor tab could be valuable — but it adds complexity. Recommend main editor only for v1.

### Open Questions for Review

- [x] **Single vs. multiple halt points**: ~~Plan implies single halt point.~~ Implementation supports multiple — all halted nodes become roots. This is correct behavior for convergent branch halt (R4).
- [ ] **Halt persistence**: Should halt state survive save/load? Currently `_halted` is on node data and survives save. `stripHaltsOnExport` preference exists. **Decision**: Current behavior is correct — halts persist in saves, users can strip on export.
- [ ] **Halt + sub-editor tabs**: Main editor only for v1, or include loop/module body tabs?
- [x] **Performance**: Root replacement is O(n) scan + existing recursive walk. No performance concern.

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Complex graph topologies (diamonds, multi-merge) | Medium | Medium | Thorough test coverage for convergent branches, shared ancestors |
| Codegen producing invalid OpenSCAD for partial subgraphs | Medium | High | Validate output against OpenSCAD parser; ensure all required definitions are emitted |
| UX confusion — user forgets halt is active | Low | Medium | Persistent visual indicator in the editor toolbar showing halt state and which node |

---

## Dependencies & Sequencing

- **Depends on**: Nothing
- **Independent of**: F-002 (Scoped Sub-Editor Preview) — explicitly noted in the source plan as non-dependent
- **Recommended sequencing**: Can ship independently at any time. Lower priority than F-001 and F-002 but high user value for debugging workflows.

---

## Source Traceability

| Requirement | Source |
|---|---|
| R1: Per-node halt toggle | `halt-flow-indicator.md` ("Each node should have a toggle visible in the MAIN editor") |
| R2: Branch-aware codegen | `halt-flow-indicator.md` ("isolate only the edges/branching of nodes that leads to that point") |
| R3: Progressive halt | `halt-flow-indicator.md` (cube translate/rotate example) |
| R4: Convergent branch halt | `halt-flow-indicator.md` (union example) |
