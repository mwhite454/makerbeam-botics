# F-003: Preview Panel Enhancements

**Status**: Draft — Ready for Architectural Review
**Source Plans**: `plans/preview-camera-state.md`, `plans/preview-in-sub-editor.md` (Further Considerations §2)
**Dependencies**: None
**Estimated Complexity**: M

---

## Problem Statement

Every time a user modifies geometry and a re-render occurs, the 3D camera resets to its default position. Users must re-navigate to their viewing angle after every single edit. For iterative design — the primary workflow — this is a severe productivity drain.

Additionally, applied colors are lost on re-render, there is no orientation reference in the viewport, and when users switch between tabs (main, loop, module), camera state is destroyed.

**User impact:** A user adjusting a rotation from 45° to 30° must re-orient the camera every time. Multiply this by dozens of edits per session and the friction is substantial.

---

## Requirements

### R1: Camera State Persistence Across Re-Renders

When WASM delivers a new render result, the camera position, rotation, and zoom level from the previous frame are re-applied. The user's viewing angle is never involuntarily reset.

**Acceptance Criteria:**
- [ ] Camera position, target, rotation, and zoom are captured before each re-render
- [ ] Captured state is re-applied after the new geometry loads
- [ ] Works for all re-render triggers: node parameter change, node connection change, codegen update
- [ ] No visible camera "jump" — transition should be seamless

### R2: Per-Tab Camera State

Each editor tab maintains its own camera state. Switching between main, loop, and module tabs restores the camera to wherever the user left it in that tab.

**Acceptance Criteria:**
- [ ] Camera state is stored per `EditorTab` (or keyed by tab ID in a separate map)
- [ ] Switching to a tab with saved camera state restores it
- [ ] Switching to a tab with no saved state uses the default camera position
- [ ] Camera state per tab survives re-codegen within that tab

### R3: Color Persistence

When a user applies colors to geometry, those colors survive re-renders and are visible in the preview.

**Acceptance Criteria:**
- [ ] Colors applied via node parameters (e.g., `color()` in OpenSCAD) are preserved in the Three.js scene after re-render
- [ ] Colors are not reset to default material on geometry update

### R4: Orthogonal Orientation Gizmo

A small 3D gizmo displayed in the preview viewport showing global X, Y, Z axis directions, providing the user with a persistent spatial reference.

**Acceptance Criteria:**
- [ ] Gizmo renders in a corner of the preview viewport (non-obstructive)
- [ ] Gizmo reflects the current camera orientation in real time
- [ ] Axes are color-coded (standard convention: X=red, Y=green, Z=blue)
- [ ] Gizmo does not interfere with geometry interaction (click-through or separate render layer)
- [ ] Styled to match dark theme (muted axis colors, subtle background)

---

## Technical Considerations

### Camera State Storage

Two levels of persistence:
1. **Within a session** — Zustand store, keyed by tab ID. Covers re-renders and tab switching.
2. **Across sessions** — Consider persisting camera state in the project save format. Recommend deferring to v2 unless trivial to add.

Camera state object should include at minimum: `position: Vector3`, `target: Vector3`, `zoom: number`, `up: Vector3`.

### Three.js Integration

The camera is likely managed by Three.js's `OrbitControls` or equivalent. The pattern is:
1. Before geometry swap: capture `camera.position`, `controls.target`, `camera.zoom`
2. After new geometry loads: restore captured values, call `controls.update()`

The orientation gizmo can be implemented as a separate `Scene` + `Camera` rendered in a small viewport overlay, with its camera rotation synced to the main camera.

### Color Handling

Colors in OpenSCAD are set via the `color()` module. The WASM output (likely STL or a mesh format) may not preserve color data. Need to determine:
- Does the current WASM pipeline output color information?
- If not, can we parse color from the generated OpenSCAD code and apply it to Three.js materials post-render?

### Open Questions for Review

- [ ] **WASM color output**: Does the OpenSCAD WASM output include color/material data, or is it geometry-only (STL)? If geometry-only, we need a color-mapping strategy from codegen source to Three.js materials.
- [ ] **Gizmo library**: Build custom or use a library like `three-viewport-gizmo`? Custom keeps bundle small and matches the brand; library ships faster.
- [ ] **Camera state in saves**: Should camera position be part of the project file format? Convenient but adds save/load complexity. Recommend defer.

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Camera "jump" on complex geometry changes | Medium | Low | Lerp camera to new position if geometry bounds change dramatically |
| Color data not in WASM output | High | Medium | Build codegen-to-material color mapping as fallback |
| Gizmo z-fighting with geometry | Low | Low | Render gizmo in a separate viewport overlay |

---

## Dependencies & Sequencing

- **Depends on**: Nothing
- **Enables**: F-002 (Scoped Sub-Editor Preview) — per-tab camera state prevents disorienting resets when switching into loop/module tabs
- **Recommended sequencing**: Ship R1 (re-render persistence) first — it's the highest-impact, lowest-complexity item. R2 (per-tab) aligns with F-002's tab work. R4 (gizmo) is independent and can ship anytime.

---

## Source Traceability

| Requirement | Source |
|---|---|
| R1: Camera persistence across re-renders | `preview-camera-state.md` (primary ask) |
| R2: Per-tab camera state | `preview-in-sub-editor.md` Further Considerations §2 |
| R3: Color persistence | `preview-camera-state.md` ("Camera data should include Colors") |
| R4: Orientation gizmo | `preview-camera-state.md` ("orthogonal gizmo") |
