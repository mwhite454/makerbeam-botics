# Sketch UI Wireframes (draft)

Goal: Provide minimal wireframes for interactive "connect-the-dots" sketching and a layout panel for "layout along path".

## Toolbar additions
- Tool group: `Path Tools`
  - `Select/Move` (existing)
  - `Add Anchor` (click canvas to add anchor to active PathNode)
  - `Insert Anchor` (click segment to add anchor between points)
  - `Toggle Smooth` (switch selected anchor between corner/smooth)
  - `Close/Open Path`
  - `Layout` (opens a side panel for layout options when a PathNode is selected)

## Editor canvas interactions
- Click on a PathNode's rendered shape to select it. When selected:
  - Left-click with `Add Anchor` active: append anchor at cursor
  - Drag anchor: updates anchor `pos`
  - Shift+Click a segment: insert anchor between two anchors
  - Right-click anchor: context menu for `delete`, `toggle-smooth`, `add-handle` (bezier)
- Visual aids:
  - Anchor markers with index numbers (small label)
  - Visible handles for bezier control points when `smooth`
  - Highlighted segment under cursor for insertion

## PathNode UI (node body)
- Fields and handles:
  - Label: `nodeName` (meta)
  - Toggle: `closed` (checkbox)
  - Numeric input: `smoothing` (0-1) — also has `in-0` handle for override
  - Button: `Edit anchors` opens an anchor-list editor (modal) with precise coordinates
- Input handles:
  - `in-0`: shape input (chain/previous)
  - `in-1`: anchors array (for programmatic override)
  - `out-0`: path output

## PathLayoutNode UI (node body)
- Fields and handles:
  - `template` input (the node to place along path) — `in-0`
  - `mode` (count | distance) with `count` or `distance` numeric fields
  - `orientation` (tangent | normal | fixed) and `angle` when `fixed`
  - `align` (start | center | end)
  - `offset` numeric
  - `in-1`: path input
  - `out-0`: shape output (composed)

## Layout panel (side panel when Layout node or Path selected)
- Preview list of sampled placements (small thumbnails)
- Controls for spacing, orientation, jitter, and flip
- `Apply as separate nodes` button to materialize placed templates as individual nodes (optional)

## Example flows
1. Connect-the-dots polygon
  - Add `PathNode`, click `Add Anchor` to drop anchors 0..n, toggle `closed`
  - Connect into a `sketch_offset` or `sketch_translate` node for further ops
2. Layout bolts along a path
  - Add `PathNode` + anchors
  - Add `PathLayoutNode`, connect `path` to `in-1`, connect a `sketch_circle` node as `template` in `in-0`
  - Set `mode=count` and `count=8`, orientation=`tangent`
  - Preview shows circles placed along path; codegen converts them to Maker.js placements

---

Next UI implementation steps:
- Create `PathNode` and `PathLayoutNode` skeletons under `web/src/nodes/sketch/path/`
- Add palette entries and register nodes
- Implement simple anchor editor modal and canvas anchor hit-testing handlers

Wireframes draft created on: 2026-03-27
