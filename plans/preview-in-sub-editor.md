# Plan: Preview in Sub-Editor (Loop / Module Tabs)

When users navigate into a loop or module sub-editor tab, the preview currently breaks because `useCodegen` emits a loop body module definition with no invocation (and no upstream geometry). This plan introduces **scoped preview codegen** — generating a complete renderable program for the current scope, with a configurable iteration slider and module arg overrides.

---

## Phase 1: Data Layer — Parent Tab Linkage (steps 1–6)

The `EditorTab` interface has no back-reference to its parent. The only link is `ForLoopData.bodyTabId` on the parent's node. We need a reverse pointer and preview state.

1. **Extend `EditorTab`** — Add `parentTabId?: string` and `parentNodeId?: string` to the interface in `src/store/editorStore.ts` (line ~38)
2. **Set parent refs on loop tab creation** — In `createLoopBodyTab` (~line 212), accept and store `callerTabId` + `callerNodeId`
3. **Set parent refs on module tab creation** — Same treatment for module tabs
4. **Backfill on project load** — For legacy saves missing `parentTabId`, reconstruct by scanning tabs for nodes with `bodyTabId` references
5. **Add preview iteration state** to the store:
   - `loopPreviewRange: { start, end, step } | null`
   - `loopPreviewMode: 'single' | 'range'`
   - `loopPreviewValue: number`
   - `modulePreviewArgs: Record<string, string>`
6. **Populate on tab switch** — In `setActiveTab`, when switching to a loop tab, read parent node's start/end/step and initialize the preview state

---

## Phase 2: Scoped Preview Codegen — Loops (steps 7–10)

The core change: synthesize a complete renderable program when the active tab is a loop.

7. **Create `generateLoopPreviewCode()`** in `src/codegen/index.ts`:
   - Emits the loop body module definition (existing `generateLoopBodyCode`)
   - Extracts upstream geometry connected to the parent for-loop node's `in-0` handle from the **parent tab's graph**
   - Synthesizes a call: single iteration `for_body(previewI, ...) { upstream_geo }` or ranged `for (i = [...]) for_body(i, ...) { upstream_geo }`
   - For `GeometryGeneratorLoopNode` (no in-0), invokes without children
8. **Extract `emitUpstreamGeometry()` helper** — Generates code for all geometry flowing into a given node's input handle on a given tab. Reuses existing `emitNode` against the parent tab's adjacency graph
9. **Update `useCodegen`** in `src/hooks/useCodegen.ts` — When `activeTab.tabType === 'loop'` and `parentTabId` exists, call `generateLoopPreviewCode()` instead of skipping. Legacy tabs (no parentRef) fall back to current behavior
10. **Verify nested loops** — Inner body module definitions must also be emitted (should already work since codegen iterates all tabs)

---

## Phase 3: Scoped Preview Codegen — Modules (steps 11–12)

11. **Create `generateModulePreviewCode()`** in `src/codegen/index.ts` — Emits the module definition + a call with user-provided arg overrides, falling back to defaults from `module_arg` nodes
12. **Update `useCodegen`** — Replace the current `${moduleName}();` with `generateModulePreviewCode(activeTab, modulePreviewArgs)` (*depends on step 5*)

---

## Phase 4: Iteration Slider UI (steps 13–14)

13. **Create `LoopPreviewControls`** component in `src/components/panels/LoopPreviewControls.tsx`:
   - Horizontal bar in the PreviewPanel header when on a loop tab
   - Mode toggle: "Single" (slider + numeric input) vs "Range" (start/end/step inputs)
   - Bounded by parent node's range, styled with existing Tailwind dark theme
   - Updates `loopPreviewValue` / `loopPreviewRange` in store → triggers re-codegen
14. **Mount in PreviewPanel** — Conditionally render when `activeTab.tabType === 'loop'` in `src/components/panels/PreviewPanel.tsx`

---

## Phase 5: Module Arg Override UI (steps 15–16)

15. **Create `ModulePreviewArgs`** component in `src/components/panels/ModulePreviewArgs.tsx`:
   - Compact panel showing arg names, types, and editable override values
   - "Reset to defaults" button
   - Derives arg list from `module_arg` nodes in the active tab
16. **Mount in PreviewPanel** — Conditionally render when `activeTab.tabType === 'module'`

---

## Phase 6: Empty Geometry Detection & Panel Hiding (steps 17–18)

17. **Detect geometry-free scopes** — After codegen, if generated code contains only `echo()`, `@botics:export` annotations, comments, or whitespace, set `previewHasGeometry: false` in the store
18. **Hide preview panel** — In `src/App.tsx`, conditionally hide `PreviewPanel` when `previewHasGeometry === false`

---

## Relevant Files

| File | Change |
|------|--------|
| `src/store/editorStore.ts` | `EditorTab` interface, preview state, `setActiveTab` logic, `createLoopBodyTab` params |
| `src/hooks/useCodegen.ts` | Active tab branching for loop/module preview codegen |
| `src/codegen/index.ts` | New `generateLoopPreviewCode()`, `generateModulePreviewCode()`, `emitUpstreamGeometry()` |
| `src/components/panels/PreviewPanel.tsx` | Mount `LoopPreviewControls` and `ModulePreviewArgs` conditionally |
| `src/components/panels/LoopPreviewControls.tsx` | **New file** — iteration slider/range UI |
| `src/components/panels/ModulePreviewArgs.tsx` | **New file** — module arg override UI |
| `src/App.tsx` | Conditional preview panel hiding |
| `src/nodes/control/ForLoopNode.tsx` | Pass `callerTabId` + node id to `createLoopBodyTab` |
| All other loop node files (`GeometryEditorLoopNode`, `GeometryGeneratorLoopNode`, `IntersectionForNode`, `FileIteratorLoopNode`) | Same parent-ref plumbing |

---

## Verification

1. **Unit: `generateLoopPreviewCode()`** — Parent tab has `cube() → for_loop`, body has `translate([i*10,0,0]) children()`. Verify valid OpenSCAD at iteration i=3
2. **Unit: `emitUpstreamGeometry()`** — Chain `cube → translate → for_loop in-0` correctly emits `translate(...) { cube(); }`
3. **Unit: `generateModulePreviewCode()`** — Module defined and called with overridden args
4. **Unit: empty geometry detection** — Code with only echo/comments detected as geometry-free
5. **Manual: Transform loop** — cube → for_loop, enter body tab, slider appears, slide to i=3, see translated cube
6. **Manual: Generator loop** — geo_generator_loop, enter body, see spheres without upstream geometry needed
7. **Manual: Module** — Module with radius=5, override to 10, see updated preview
8. **Manual: File-only loop** — file_iterator_loop with only echo nodes, preview panel hides
9. **Manual: Nested loops** — Inner loop tab preview works (both module defs emitted)
10. **Manual: Tab switching** — Rapid switching between main/loop/module tabs, no stale state
11. **Manual: Legacy projects** — Old saves without parentTabId load correctly with backfill

---

## Decisions

- **Not dependent on halt-flow** — This feature generates a separate preview program; halt within a body tab still works orthogonally
- **Upstream geometry synthesis** — Loop preview pulls geometry from parent tab's in-0 handle for accurate context
- **Empty scope = hidden panel** — Not an error state, the panel is simply hidden
- **Configurable iteration** — Single-value slider + range mode toggle

## Further Considerations

1. **Performance** — Complex upstream geometry could be slow to regenerate. Consider caching upstream code and invalidating only when parent tab changes. Recommendation: defer unless it's a measurable problem.
2. **Camera persistence per tab** — Currently the 3D camera likely resets on tab switch. Storing orbit state per `EditorTab` would avoid disorienting resets.
3. **FileIteratorLoop preview** — File iterators reference actual files. The slider should double as a file index picker, loading the selected file's data into the preview render.
