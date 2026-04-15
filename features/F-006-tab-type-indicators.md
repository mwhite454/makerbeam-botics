# F-006: Editor Tab Type Indicators

**Status**: Implemented
**Source Plans**: `plans/icons-in-tab-editor.md`
**Dependencies**: None
**Estimated Complexity**: S

---

## Problem Statement

The tab bar at the bottom of the node editor shows tab names but gives no visual indication of tab *type*. When a user has multiple tabs open — main project, loop bodies, modules — they must read the name and recall what each tab represents. This creates unnecessary cognitive load, especially as projects grow in complexity.

A glanceable type indicator lets users orient instantly.

---

## Requirements

### R1: Lucide Icons Per Tab Type

Each tab in the editor tab bar displays a Lucide icon before the tab name, indicating the tab's type.

**Acceptance Criteria:**
- [x] Main project tab: `box` icon (Lucide) — blue-400
- [x] Loop tabs: `refresh-cw` icon (Lucide) — amber-400
- [x] Module tabs: `puzzle` icon (Lucide) — purple-400
- [x] Sketch tabs: `pen-tool` icon (Lucide) — pink-400
- [x] Parameters tab: `settings` icon (Lucide) replacing gear emoji
- [x] Icon is rendered inline before the tab name: `<Icon /> <TabName>`
- [x] Icons are small (10px), consistent with the design guidelines (minimal, clean)
- [x] Icon color follows tab type semantic colors (blue/amber/purple/pink)

---

## Technical Considerations

### Implementation

This is a small, well-scoped UI change. The tab component likely already has access to `tabType` on the `EditorTab` interface. Add a mapping function:

```
tabType → LucideIcon
'main' → Box
'loop' → RefreshCw
'module' → Puzzle
```

Lucide React should already be in the project dependencies (referenced in the brand identity plan and styling guide). If not, it needs to be added.

### Sketch Tabs

The README mentions a "2D sketch editor." If sketch tabs exist, they may need their own icon. The styling guide uses pink (`#ec4899`) for sketch mode. A `pen-tool` or `pencil` icon would fit. Defer unless sketch tabs already appear in the tab bar.

### Open Questions for Review

- [x] **Are there other tab types** beyond main, loop, and module that need icons? — Yes: sketch (`pen-tool`, pink-400) and Parameters (`settings`, inherits amber color). Both implemented.
- [x] **Icon color**: Semantic tab type colors — blue for main, amber for loop, purple for modules, pink for sketch.

---

## Dependencies & Sequencing

- **Depends on**: Nothing
- **Complements**: F-002 (Scoped Sub-Editor Preview) — when users are switching between loop/module tabs for preview, type indicators help them navigate
- **Recommended sequencing**: Quick win. Can ship anytime, independently. Good first PR for a new contributor.

---

## Source Traceability

| Requirement | Source |
|---|---|
| R1: Tab type icons | `icons-in-tab-editor.md` (entire file) |
