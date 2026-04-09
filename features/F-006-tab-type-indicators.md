# F-006: Editor Tab Type Indicators

**Status**: Draft — Ready for Architectural Review
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
- [ ] Main project tab: `box` icon (Lucide)
- [ ] Loop tabs: `refresh-cw` icon (Lucide)
- [ ] Module tabs: `puzzle` icon (Lucide)
- [ ] Icon is rendered inline before the tab name: `<Icon /> <TabName>`
- [ ] Icons are small, consistent with the design guidelines (minimal, clean)
- [ ] Icon color follows tab type semantic colors from the style guide (if applicable — e.g., purple for modules)

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

- [ ] **Are there other tab types** beyond main, loop, and module that need icons? (e.g., sketch tabs) - Sketch tabs, Parameter Tab (currently has a gear emoji)
- [ ] **Icon color**: Should icons be monochrome (gray-400) or match semantic tab type colors (blue for main, purple for modules, etc.)? semantic tab colors.

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
