# Sketch System Audit

This note maps the current Sketch tab data flow, the core files to extend, and recommended insertion points for `connect-the-dots` and `layout-along-path` features.

## Data flow (summary)
- UI nodes/editing: `SketchEditorPanel` drives node graph edits via `useEditorStore` and React Flow.
  - File: web/src/components/sketch/SketchEditorPanel.tsx
- Node definitions: sketch node UI and handles live in `web/src/nodes/sketch/*`.
  - Entry: web/src/nodes/sketch/index.ts
  - Base node: web/src/nodes/sketch/SketchBaseNode.tsx
  - Primitives and transforms: web/src/nodes/sketch/primitives/* and /transforms/*
- Store and serialization: editor store (node/edge state) is in `useEditorStore` (store files).
- Codegen hook: `useSketchCodegen` listens to store changes and triggers generation.
  - File: web/src/hooks/useSketchCodegen.ts
- Sketch codegen: `sketchCodegen.ts` builds Maker.js models from the node graph, with helper `sketchToOpenscad.ts` emitting OpenSCAD.
  - Files: web/src/codegen/sketchCodegen.ts, web/src/codegen/sketchToOpenscad.ts
- Preview: generated SVG or OpenSCAD is rendered by `SketchPreviewPanel` (SVG viewer + 3D texture preview).
  - File: web/src/components/sketch/SketchPreviewPanel.tsx

## Key extension points
- New types & models: add `web/src/types/sketchPath.ts` (added) and/or extend `web/src/types/sketchNodes.ts` to include `PathNode`/`LayoutNode` data shapes.
- New nodes: create nodes under `web/src/nodes/sketch/` (e.g., `path_node`, `path_layout_node`) and register in `web/src/nodes/sketch/index.ts`.
- Palette: add palette entries (see `SKETCH_PALETTE_ITEMS` usage in editor) so users can drag new path nodes.
- UI tools: extend `SketchToolbar.tsx` or add tool components in `web/src/components/sketch/` for interactive anchor placement and selection.
- Math utils: add `web/src/utils/paths.ts` and `web/src/utils/layoutAlongPath.ts` for parametrization, tangent/normals, and placement transforms.
- Codegen: extend `buildSketchModel` in `sketchCodegen.ts` to translate Path nodes into Maker.js paths/chains, and extend `sketchToOpenscad.ts` to discretize curves for polygon emission.
- Preview: `useSketchCodegen` already sets SVG; ensure new model generation returns Maker.js model compatible with `generateSketchSvg`.

## Non-invasive approach
- Implement new nodes as opt-in additions to the nodes index to avoid changing existing nodes.
- Keep path math and layout as pure utilities so they can be unit-tested separately.
- Respect the existing node-editor-parity rule: every editable property must have a handle that can be overridden by connections.

## Short list of files to edit/add (priority)
1. Add type definitions: `web/src/types/sketchPath.ts` (done)
2. Add utils: `web/src/utils/paths.ts`, `web/src/utils/layoutAlongPath.ts`
3. Add nodes: `web/src/nodes/sketch/path/PathNode.tsx`, `web/src/nodes/sketch/path/PathLayoutNode.tsx` and register in `web/src/nodes/sketch/index.ts`
4. Palette: extend wherever `SKETCH_PALETTE_ITEMS` is defined (search for its file) to include new entries
5. Codegen: update `web/src/codegen/sketchCodegen.ts` (function `buildModel`) to handle Path nodes
6. Preview/UI: update `web/src/components/sketch/SketchToolbar.tsx` and optionally `SketchEditorPanel.tsx` for drag/drop tool modes
7. Tests and examples: add `web/public/examples/sketches/connect-the-dots.json` and unit tests under `tests/` for math utilities

## Verification plan (quick)
- Unit tests for `paths.ts` (length, sample points), and `layoutAlongPath.ts` (expected transforms on simple lines and circles).
- Manual test: Drag `PathNode` into editor, place anchors, attach a `PathLayoutNode` with a rectangle template, see live SVG update via `SketchPreviewPanel`.

---

Audit created on: 2026-03-27

