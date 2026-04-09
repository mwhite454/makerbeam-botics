# F-002: Scoped Sub-Editor Preview

**Status**: Draft — Ready for Architectural Review
**Source Plans**: `plans/preview-in-sub-editor.md`
**Dependencies**: Benefits from F-003 (camera persistence per tab)
**Estimated Complexity**: XL

---

## Problem Statement

When users navigate into a loop or module sub-editor tab, the preview breaks. `useCodegen` emits a loop body module definition with no invocation and no upstream geometry, producing nothing renderable. Users can define loop bodies and module internals but cannot see what they're building until they switch back to the main tab.

This forces a disorienting edit-switch-check-switch cycle that kills flow state and makes iterative design painful. For a tool whose core promise is "visual design," a blind editing mode is a fundamental gap.

---

## Requirements

### R1: Parent Tab Linkage (Data Layer)

Each `EditorTab` maintains a back-reference to the tab and node that created it, enabling codegen to walk upstream and synthesize complete renderable programs.

**Acceptance Criteria:**
- [ ] `EditorTab` interface includes optional `parentTabId` and `parentNodeId` fields
- [ ] `createLoopBodyTab` and module tab creation functions accept and store parent references
- [ ] Legacy saves without `parentTabId` are backfilled on load by scanning tabs for nodes with `bodyTabId` references
- [ ] Parent references survive save/load cycles

### R2: Loop Preview Codegen

When the active tab is a loop body, codegen synthesizes a complete renderable OpenSCAD program: the loop body module definition + upstream geometry from the parent tab + an invocation at the user-selected iteration value.

**Acceptance Criteria:**
- [ ] `generateLoopPreviewCode()` produces valid, renderable OpenSCAD
- [ ] Upstream geometry connected to the parent for-loop node's `in-0` handle is included
- [ ] Single iteration mode: renders one iteration at user-selected value
- [ ] Range mode: renders a range of iterations (start/end/step)
- [ ] `GeometryGeneratorLoopNode` (no in-0 input) works without upstream geometry
- [ ] Nested loops: inner body module definitions are emitted correctly
- [ ] Legacy tabs without `parentTabId` fall back to current behavior (no regression)

### R3: Module Preview Codegen

When the active tab is a module, codegen synthesizes the module definition + a call with user-provided argument overrides (falling back to defaults from `module_arg` nodes).

**Acceptance Criteria:**
- [ ] `generateModulePreviewCode()` produces valid, renderable OpenSCAD
- [ ] Module is called with user-overridden argument values
- [ ] Default values from `module_arg` nodes are used when no override is provided
- [ ] "Reset to defaults" clears all overrides

### R4: Iteration Slider UI

A horizontal control bar in the preview panel header lets users select which iteration(s) to preview when on a loop tab.

**Acceptance Criteria:**
- [ ] Slider appears in preview panel header only when active tab is a loop
- [ ] Mode toggle: "Single" (slider + numeric input) vs "Range" (start/end/step inputs)
- [ ] Slider is bounded by the parent node's configured range
- [ ] Changing the value triggers re-codegen and re-render
- [ ] Styled per design guidelines (dark theme, Tailwind, compact)

### R5: Module Argument Override UI

A compact panel showing module argument names, types, and editable override values when on a module tab.

**Acceptance Criteria:**
- [ ] Panel appears in preview panel only when active tab is a module
- [ ] Arg list derived from `module_arg` nodes in the active tab
- [ ] Each arg shows name, type, and an editable value field
- [ ] "Reset to defaults" button restores all args to `module_arg` node defaults
- [ ] Changes trigger re-codegen and re-render

### R6: Empty Geometry Detection

When a scope contains no renderable geometry (only `echo()`, annotations, comments, or whitespace), the preview panel is hidden rather than showing an empty/broken state.

**Acceptance Criteria:**
- [ ] After codegen, code is analyzed for renderable geometry content
- [ ] If no geometry is found, `previewHasGeometry` is set to `false`
- [ ] Preview panel is hidden when `previewHasGeometry === false`
- [ ] This is a clean state, not an error — no error messages displayed

---

## Technical Considerations

### Key Architecture Decision: Upstream Geometry Synthesis

The loop preview pulls geometry from the parent tab's graph — specifically whatever is connected to the for-loop node's `in-0` handle. This requires an `emitUpstreamGeometry()` helper that can generate code for geometry flowing into a given node's input handle on a given tab, reusing the existing `emitNode` logic against the parent tab's adjacency graph.

This is the most architecturally significant piece — it creates a cross-tab codegen dependency.

### State Management

New preview state in the store:
- `loopPreviewRange: { start, end, step } | null`
- `loopPreviewMode: 'single' | 'range'`
- `loopPreviewValue: number`
- `modulePreviewArgs: Record<string, string>`
- `previewHasGeometry: boolean`

State should be initialized in `setActiveTab` when switching to a loop/module tab: read the parent node's start/end/step and populate defaults.

### Files Impacted

| File | Change |
|------|--------|
| `src/store/editorStore.ts` | `EditorTab` interface, preview state, `setActiveTab`, `createLoopBodyTab` |
| `src/hooks/useCodegen.ts` | Active tab branching for loop/module preview |
| `src/codegen/index.ts` | New `generateLoopPreviewCode()`, `generateModulePreviewCode()`, `emitUpstreamGeometry()` |
| `src/components/panels/PreviewPanel.tsx` | Mount iteration slider and module arg controls |
| `src/components/panels/LoopPreviewControls.tsx` | **New** — iteration slider/range UI |
| `src/components/panels/ModulePreviewArgs.tsx` | **New** — module arg override UI |
| `src/App.tsx` | Conditional preview panel hiding |
| All loop node files (`ForLoopNode`, `GeometryEditorLoopNode`, `GeometryGeneratorLoopNode`, `IntersectionForNode`, `FileIteratorLoopNode`) | Pass parent tab/node refs to `createLoopBodyTab` |

### Open Questions for Review

- [ ] **FileIteratorLoop preview**: File iterators reference actual files. Should the slider act as a file index picker? What data gets fed into the preview render?
- [ ] **Performance**: Complex upstream geometry could be expensive to regenerate on every slider change. Should we cache the upstream code and only invalidate when the parent tab changes? Recommend deferring optimization unless measurable.
- [ ] **Nested loop state**: When previewing an inner loop, should the outer loop's iteration also be configurable? Or is the inner loop always previewed in isolation?

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cross-tab codegen complexity | Medium | High | `emitUpstreamGeometry()` must be thoroughly tested with varied graph topologies |
| Stale state on rapid tab switching | Medium | Medium | Clear preview state on every `setActiveTab` call before populating new values |
| Legacy project breakage on backfill | Low | High | Backfill logic must handle all loop node types and edge cases from existing saves |

---

## Dependencies & Sequencing

- **Depends on**: Nothing strictly, but benefits from F-003 (camera persistence per tab prevents disorienting camera resets on tab switch)
- **Enables**: F-006 (Tab Type Indicators) complements this by making tab types visually distinct
- **Relationship to F-004 (Halt Flow)**: Explicitly independent — halt within a body tab works orthogonally to scoped preview codegen
- **Relationship to F-001 (Expression Editor)**: Module arg override UI (R5) could reuse the expression builder component for arg value inputs

---

## Verification Plan

1. **Unit**: `generateLoopPreviewCode()` — Parent has `cube() → for_loop`, body has `translate([i*10,0,0]) children()`. Verify valid OpenSCAD at i=3
2. **Unit**: `emitUpstreamGeometry()` — Chain `cube → translate → for_loop in-0` correctly emits `translate(...) { cube(); }`
3. **Unit**: `generateModulePreviewCode()` — Module defined and called with overridden args
4. **Unit**: Empty geometry detection — Code with only echo/comments detected as geometry-free
5. **Manual**: Transform loop — cube → for_loop, enter body tab, slider appears, slide to i=3, see translated cube
6. **Manual**: Generator loop — enter body, see geometry without needing upstream input
7. **Manual**: Module — Module with radius=5, override to 10, see updated preview
8. **Manual**: File-only loop — file_iterator_loop with only echo nodes, preview panel hides
9. **Manual**: Nested loops — Inner loop tab preview works
10. **Manual**: Tab switching — Rapid switching between main/loop/module, no stale state
11. **Manual**: Legacy projects — Old saves without parentTabId load correctly

---

## Source Traceability

| Requirement | Source |
|---|---|
| R1: Parent tab linkage | `preview-in-sub-editor.md` Phase 1 |
| R2: Loop preview codegen | `preview-in-sub-editor.md` Phase 2 |
| R3: Module preview codegen | `preview-in-sub-editor.md` Phase 3 |
| R4: Iteration slider | `preview-in-sub-editor.md` Phase 4 |
| R5: Module arg override | `preview-in-sub-editor.md` Phase 5 |
| R6: Empty geometry detection | `preview-in-sub-editor.md` Phase 6 |
