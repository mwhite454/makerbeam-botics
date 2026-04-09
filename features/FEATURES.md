# Feature Index — MakerBeam Botics

**Synthesized**: April 3, 2026
**Source**: 8 plan files in `./plans/` consolidated into 6 features
**Status**: Draft — Ready for Architectural and Senior Development Review

---

## Synthesis Summary

8 raw plan files were analyzed for overlaps, conflicts, and dependencies, then consolidated into 6 cohesive features:

| Plan File | Mapped To | Notes |
|---|---|---|
| `refine-expression-editor.md` | **F-001** | Merged with IF workflow — same underlying capability |
| `if-workflow.md` | **F-001** | IF node needs the universal expression editor, not a separate one |
| `preview-in-sub-editor.md` | **F-002** | Standalone — already well-scoped |
| `preview-camera-state.md` | **F-003** | Merged with per-tab camera from sub-editor plan |
| `halt-flow-indicator.md` | **F-004** | Standalone |
| `hot-key-expansion.md` | **F-005** | Standalone |
| `icons-in-tab-editor.md` | **F-006** | Standalone |
| `brand-identity.md` | **Design Guidelines** | Cross-cutting constraint, not a feature |

### Key Decisions Made During Synthesis

1. **Merged expression editors**: `refine-expression-editor` and `if-workflow` both request expression editing capabilities. Building two separate expression editors would create inconsistency and duplicate work. The IF node's condition input is a use case of the universal expression builder, with IF-specific requirements (YES/NO edges, loop variable access) layered on top.

2. **Merged camera persistence**: `preview-camera-state` asks for camera persistence across re-renders. `preview-in-sub-editor` mentions per-tab camera persistence as a further consideration. These are the same problem at two scopes — consolidated into one feature.

3. **Brand identity as guideline, not feature**: The brand identity plan describes constraints (dark theme, Lucide icons, no emojis) that apply to all features. It's captured as a design guidelines reference, not a standalone deliverable.

---

## Feature Inventory

| ID | Feature | Complexity | Dependencies | Source Plans |
|---|---|---|---|---|
| F-001 | [Universal Expression Editor](F-001-universal-expression-editor.md) | XL | None (foundational) | refine-expression-editor, if-workflow |
| F-002 | [Scoped Sub-Editor Preview](F-002-scoped-sub-editor-preview.md) | XL | Benefits from F-003 | preview-in-sub-editor |
| F-003 | [Preview Panel Enhancements](F-003-preview-panel-enhancements.md) | M | None | preview-camera-state, preview-in-sub-editor |
| F-004 | [Halt Flow Rendering](F-004-halt-flow-rendering.md) | S–M | None | halt-flow-indicator |
| F-005 | [Keyboard Navigation](F-005-keyboard-navigation.md) | M | None | hot-key-expansion |
| F-006 | [Tab Type Indicators](F-006-tab-type-indicators.md) | S | None | icons-in-tab-editor |

**Reference**: [Design Guidelines](design-guidelines.md) — all features must comply

---

## Dependency Graph

```
F-006 (Tab Indicators) ──── complements ────┐
                                             │
F-003 (Preview Enhancements) ── enables ──► F-002 (Sub-Editor Preview)
                                             │
F-001 (Expression Editor) ── reuse ──────────┘
                                             
F-004 (Halt Flow) ──── independent of all ────
F-005 (Keyboard Nav) ── complements F-001 ────
```

- **F-003 → F-002**: Per-tab camera state (F-003 R2) prevents disorienting resets when F-002 switches between tabs
- **F-001 ↔ F-002**: Module arg override UI (F-002 R5) could reuse expression builder components from F-001
- **F-001 ↔ F-005**: Must coexist — F-001 handles keyboard within node inputs, F-005 handles keyboard between nodes. Clear focus boundary required.
- **F-006 → F-002**: Tab type icons help users navigate when multiple loop/module tabs are open
- **F-004**: Explicitly independent of everything

---

## Suggested Sequencing

Based on dependencies, risk, and value:

| Phase | Features | Rationale |
|---|---|---|
| **Phase 1** | F-006, F-004, F-003 (R1 only) | Quick wins. Tab icons and halt UI polish are trivial. Camera persistence on re-render is high-impact, low-risk. Builds confidence. |
| **Phase 2** | F-001 | Foundational. Universal expression editor unblocks IF node usability and provides components F-002 can reuse. |
| **Phase 3** | F-005, F-003 (R2–R4) | Keyboard navigation ships alongside per-tab camera and the orientation gizmo. |
| **Phase 4** | F-002 | Largest scope. Benefits from F-001 components and F-003 camera work being in place. |

This is a recommendation, not a mandate. The features are designed to be shippable independently — the sequencing optimizes for dependency satisfaction and compound value.

---

## Open Questions for Architectural Review

These questions span multiple features and need resolution before development begins:

1. **Expression language grammar** (F-001): What subset of expressions do we support in v1? Math + variables + comparisons, or broader? This affects both the expression builder and IF node codegen.

2. **WASM color output** (F-003): Does the OpenSCAD WASM pipeline preserve color data, or is it geometry-only? Determines the color persistence strategy.

3. **Variable scope resolution** (F-001, F-002): Both features need to resolve which variables are available in a given scope. Should this be a shared service built once, or can each feature solve it independently?

4. **Focus management** (F-001, F-005): Two features introduce keyboard interactions — one within nodes, one between nodes. The focus boundary between "editing an input" and "navigating the graph" must be crystal clear. Recommend defining this contract before either ships.

5. **User preferences system** (F-001): The expression editor needs a configurable long-click threshold. The `preferencesStore` (Zustand + localStorage persistence) already exists with `autoSave`, `lastViewport`, and `stripHaltsOnExport` — extend it with `longClickThresholdMs`.
