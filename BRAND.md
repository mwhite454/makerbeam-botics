# BRAND.md — MakersEdge

**Owners**: UI Designer (visual decisions), UX Architect (interaction patterns)
**Last Updated**: April 4, 2026
**Status**: Living document — all UI agents must read before implementation

---

## 1. Identity

### Product Name

**MakersEdge** — one word, camelCase capital E.

| Context | Usage |
|---------|-------|
| Full name | MakersEdge |
| Badge mark | **MX** (monospace, bold) |
| Page title | MakersEdge — Visual OpenSCAD Designer |
| Meta description | Parametric 3D design, without code |
| Repo / internal | `makerbeam-botics` (legacy, do not surface to users) |

### Tagline

> Parametric 3D design, without code.

Use in meta tags, README hero, and any onboarding context. Do not invent alternatives.

### Badge Mark

The **MX badge** is the primary brand element. It appears in the toolbar and favicon.

```
Shape:   Rounded square (rx="6")
Size:    20×20px in toolbar (w-5 h-5), 32×32px favicon
BG:      #eab308 (Tailwind yellow-500)
Text:    "MX" — monospace, font-black, #111827 (gray-900)
```

The badge is intentionally warm against the cold dark palette. This contrast is the brand's visual anchor — do not mute it, do not change the color.

### Favicon

SVG at `public/icon.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#eab308"/>
  <text x="16" y="22" font-family="monospace" font-size="14" font-weight="bold"
        text-anchor="middle" fill="#111827">MX</text>
</svg>
```

### Sketch Sub-Brand

The 2D sketch editor is a **distinct sub-brand** under MakersEdge.

| Attribute | Value |
|-----------|-------|
| Name | **Sketch** (not "MakersEdge Sketch") |
| Badge | Lucide `PenTool` icon (replaces the old "SK" text badge) |
| Color | Pink `#ec4899` (Tailwind pink-500) |
| Badge style | `w-5 h-5 bg-pink-500 rounded flex items-center justify-center` |
| Label | "Sketch Editor" text beside the icon |

Pink marks everything sketch-related: tab borders, node headers, toolbar badge. This is a mode distinction, not a color preference — pink means "you are in 2D."

---

## 2. Color System

### Palette

All colors use Tailwind utility classes. No custom hex values in component code — reference Tailwind scale names.

#### Background Layers (dark → light)

| Role | Tailwind | Hex |
|------|----------|-----|
| App shell / canvas | `gray-950` | `#030712` |
| Primary panel bg | `gray-900` | `#111827` |
| Card / input bg | `gray-800` | `#1f2937` |
| Hover state bg | `gray-700` | `#374151` |
| Muted bg | `gray-600` | `#4b5563` |

#### Text Hierarchy

| Role | Tailwind | Hex |
|------|----------|-----|
| Primary | `white` | `#ffffff` |
| Secondary | `gray-300` | `#d1d5db` |
| Muted | `gray-400` | `#9ca3af` |
| Placeholder | `gray-500` | `#6b7280` |
| Disabled | `gray-600` | `#4b5563` |

#### Semantic Colors

| Meaning | Color | Tailwind | Usage |
|---------|-------|----------|-------|
| Interactive / primary | Blue | `blue-500` / `blue-600` | Buttons, focus rings, active tabs, selected state |
| Brand mark | Amber | `yellow-500` | MX badge only |
| Formula / expression | Amber | `amber-400` / `amber-500` | Expression mode borders, formula highlights |
| Success / code output | Green | `green-500` / `green-400` | Render done, code panel text |
| Danger / delete | Red | `red-500` / `red-600` | Delete actions, error state |
| Module / extrusion | Purple | `purple-600` | Module tabs, extrusion nodes |
| Sketch mode | Pink | `pink-500` / `pink-600` | Sketch nodes, sketch tab borders |
| 2D primitives | Cyan | `cyan-600` | 2D shape nodes |

**Color is semantic, never decorative.** If a color doesn't communicate meaning, it shouldn't be there. Agents must not introduce new accent colors without updating this table.

#### Borders & Dividers

| Role | Value |
|------|-------|
| Standard border | `border-white/10` |
| Fine divider | `border-white/5` |
| Input border | `border-gray-700` |
| Focus border | `border-blue-500` |

#### Alpha Overlays

```
rgba(255, 255, 255, 0.04)  — separator bg
rgba(255, 255, 255, 0.10)  — panel borders
rgba(255, 255, 255, 0.15)  — separator inner line
rgba(59, 130, 246, 0.30)   — separator hover bg
rgba(59, 130, 246, 0.70)   — separator active inner line
```

### Node Category Colors

These are **locked**. Do not modify without brand review.

| Category | Color | Tailwind |
|----------|-------|----------|
| 3D Primitives | Blue | `bg-blue-600` |
| 2D Primitives | Cyan | `bg-cyan-600` |
| Transforms | Orange | `bg-orange-500` |
| Booleans | Red | `bg-red-600` |
| Extrusions | Purple | `bg-purple-600` |
| Modifiers | Green | `bg-green-600` |
| Control Flow | Amber | `bg-amber-600` |
| Import/Export | Gray | `bg-gray-600` |

Sketch nodes follow a parallel palette:

| Category | Color | Tailwind |
|----------|-------|----------|
| Sketch Primitives | Pink | `bg-pink-600` |
| Sketch Booleans | Red | `bg-red-600` |
| Sketch Transforms | Orange | `bg-orange-500` |
| Sketch Modifiers | Teal | `bg-teal-600` |
| Sketch Control | Amber | `bg-amber-600` |
| Sketch Import | Gray | `bg-gray-600` |

### Tab Type Colors

Icons and badges in the tab bar use these semantic colors:

| Tab Type | Color | Icon (Lucide) |
|----------|-------|---------------|
| Main | `blue-400` | `Box` |
| Loop | `amber-400` | `RefreshCw` |
| Module | `purple-400` | `Puzzle` |
| Sketch | `pink-400` | `PenTool` |
| Parameters | `gray-400` | `SlidersVertical` |

---

## 3. Typography

### Font Stack

| Context | Family | Load Strategy |
|---------|--------|---------------|
| UI text | System sans-serif | No font file — `font-sans` default |
| Code, values, expressions | JetBrains Mono | Self-hosted via `@font-face` in `index.css` |

**JetBrains Mono** replaces system monospace for **all** `font-mono` contexts: node input values, code panel, expression previews, inline edits, table data, type badges. Load weights 400 and 700 only. Use `font-display: swap` to avoid FOIT.

```css
/* index.css — add to @layer base or before Tailwind imports */
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

Update `tailwind.config.js`:
```js
theme: {
  extend: {
    fontFamily: {
      mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },
  },
}
```

### Type Scale

| Size | Tailwind | Usage |
|------|----------|-------|
| 8px | `text-[8px]` | Tab type badges only |
| 9px | `text-[9px]` | Handle labels, micro annotations |
| 10px | `text-[10px]` | Panel headers (uppercase), status labels |
| 11px | `text-[11px]` | Toolbar buttons, tab labels, form labels |
| 12px | `text-xs` | Input fields, node values, general body |
| 14px | `text-sm` | Project name, search results, panel titles |

### Weight & Spacing

| Element | Weight | Letter Spacing |
|---------|--------|---------------|
| Panel headers | `font-bold` + `uppercase` | `tracking-widest` (0.1em) |
| Category sub-headers | `font-bold` + `uppercase` | `tracking-wider` (0.05em) |
| Node titles | `font-semibold` | `tracking-wide` (0.025em) |
| Toolbar buttons | `font-semibold` | default |
| Tab labels | `font-medium` | default |
| Input values | 400 (regular) | default |

**The uppercase + `tracking-widest` + `text-gray-500` combo is the panel header signature.** Do not use different casing or spacing for panel headers.

---

## 4. Interaction Principles

### Transitions

**Every interactive element must transition.** This is non-negotiable.

| Scenario | Transition |
|----------|-----------|
| Color change only (buttons, borders, text) | `transition-colors` |
| Scale, position, or opacity change | `transition-all` |
| Fade in/out (secondary buttons, hover reveals) | `transition-opacity` |

**Duration:** Tailwind default (150ms). Separator CSS uses explicit `0.15s`. Never exceed 300ms unless an element is entering/exiting the DOM.

### Hover Behaviors

- Toolbar buttons: `text-gray-400 → text-white` + `bg-transparent → bg-gray-800`
- Danger actions: `opacity-50 → opacity-100` (delete buttons appear on hover)
- Handles/icons: `hover:scale-110` (small, snappy)
- Cards/dropdowns: `hover:bg-gray-700`

### Focus

```css
focus:outline-none focus:border-blue-500
```

No `ring-*` utilities. Focus is communicated by border color change only. This keeps the dense UI clean.

### Dense but Breathable

| Spacing Token | Pixel | Usage |
|---------------|-------|-------|
| `gap-1` | 4px | Icon + text (tight) |
| `gap-1.5` | 6px | Button icon + label |
| `gap-2` | 8px | Standard horizontal groups |
| `gap-3` | 12px | Stacked form fields |
| `px-1.5 py-1` | 6/4 | Small inputs |
| `px-2 py-1` | 8/4 | Toolbar buttons |
| `px-3 py-1.5` | 12/6 | Panel headers |
| `px-4 py-2` | 16/8 | Main content areas |

**Keep spacing tight.** This is a professional tool, not a consumer app. White space should feel intentional, not generous.

---

## 5. Icon System

### Library

**Lucide React** — tree-shakeable, import only what you use.

```tsx
import { Box, RefreshCw, Puzzle, PenTool, SlidersVertical } from 'lucide-react'
```

### Rules

1. **Lucide only.** Do not mix icon libraries. Do not use SVG inlines unless the icon doesn't exist in Lucide.
2. **No emojis.** Do not render emoji characters in the frontend UI. No exceptions. Replace any existing emoji with a Lucide equivalent.
3. **Size:** `size={14}` for toolbar and tab icons. `size={12}` for inline/node icons. `size={16}` for empty state display.
4. **Color:** Icons inherit `currentColor`. Set color via parent's text color class.
5. **Stroke width:** Lucide default (2). Do not adjust unless readability requires it at very small sizes.

### Icon Reference

| Context | Icon | Lucide Name | Size |
|---------|------|-------------|------|
| Main tab | Box | `Box` | 14 |
| Loop tab | Refresh | `RefreshCw` | 14 |
| Module tab | Puzzle | `Puzzle` | 14 |
| Sketch tab | Pen | `PenTool` | 14 |
| Parameters tab | Sliders | `SlidersVertical` | 14 |
| Save | Save | `Save` | 14 |
| Load / Open | Folder open | `FolderOpen` | 14 |
| New project | File plus | `FilePlus` | 14 |
| Export | Download | `Download` | 14 |
| Render | Play | `Play` | 14 |
| Delete node | Trash | `Trash2` | 12 |
| Halt toggle (off) | Pause circle | `CirclePause` | 12 |
| Halt toggle (on) | Pause circle filled | `CirclePause` | 12 |
| Clear all halts | X circle | `XCircle` | 14 |
| Settings/Preferences | Settings | `Settings` | 14 |
| Search | Search | `Search` | 14 |
| Close tab | X | `X` | 12 |
| Empty state (generic) | Inbox | `Inbox` | 48 |

Icons listed here are prescriptive. When implementing a feature, check this table first. If the needed icon isn't listed, add it here before using it.

### Toolbar Pattern

All toolbar actions use **icon + text label**, both visible:

```tsx
<button className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors">
  <Save size={14} />
  Save
</button>
```

Primary action buttons (e.g., Render) use the filled blue style:

```tsx
<button className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all">
  <Play size={14} />
  Render
</button>
```

---

## 6. Component Patterns

### Panel Header (Signature Pattern)

```html
<div class="px-3 py-2 border-b border-white/10 flex items-center justify-between shrink-0">
  <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Panel Title</span>
</div>
```

This is the **signature visual pattern**. Every panel uses it. Agents must not deviate from this for panel headers.

### Tab Bar

```
h-8 bg-gray-900 border-t border-white/10 flex items-stretch overflow-x-auto
```

Active tab: `bg-gray-800 text-white border-t-2 border-t-blue-500`
Inactive tab: `bg-gray-900 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 border-t-2 border-t-transparent`

Tab type icons render inline before the tab name at `size={12}` with their semantic color.

### Inputs

**Standard text/number:**
```
bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-white font-mono
focus:outline-none focus:border-blue-500
```

**Expression/formula mode:**
```
border border-amber-500/60 focus:border-amber-400 text-amber-200 font-mono
```

**Connected input (has incoming data edge):**
```
border-l-2 border-l-blue-400 focus:border-l-blue-300
```

### Buttons

| Variant | Classes |
|---------|---------|
| Primary | `bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors` |
| Secondary/ghost | `text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors` |
| Danger | `opacity-50 hover:opacity-100 transition-opacity text-red-400` |
| Disabled | `bg-gray-600 text-gray-400 cursor-not-allowed` |

### Dropdowns / Autocomplete

```
bg-gray-800 border border-gray-600 rounded shadow-xl min-w-[120px] max-h-40 overflow-y-auto
```

Items: `text-[11px] font-mono` — active: `bg-blue-600 text-white`, default: `text-green-300 hover:bg-gray-700`

### Empty States

Replace all emoji-based empty states with a **Lucide icon + text** pattern:

```tsx
<div className="flex flex-col items-center justify-center h-full text-center px-8 gap-3">
  <Inbox size={48} className="text-gray-700" />
  <p className="text-sm text-gray-500">Nothing here yet.</p>
</div>
```

Icon is always `text-gray-700` (very subtle against `gray-900`/`gray-950` backgrounds). Text is `text-gray-500`. No opacity tricks — use the gray scale for muting.

### Scrollbar

```css
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: #4b5563; }
```

### Status Indicators

```
Loading:  w-2 h-2 rounded-full bg-yellow-400 animate-pulse
Ready:    w-2 h-2 rounded-full bg-green-400
Error:    w-2 h-2 rounded-full bg-red-500
```

Label: `text-[10px] text-gray-400`

---

## 7. Fixed Dimensions

| Element | Size |
|---------|------|
| Toolbar height | `h-10` (40px) |
| Tab bar height | `h-8` (32px) |
| Status dot | `w-2 h-2` (8px) |
| Scrollbar width | 4px |
| Panel separator | 6px |
| Border radius default | `rounded-lg` (8px) |
| Shadow default | `shadow-xl` |

---

## 8. Shadows & Elevation

```
shadow-xl   — cards, dropdowns, context menus
shadow-2xl  — tooltips, popovers
```

Nodes use colored ring shadows for state:
```
ring-2 ring-yellow-400/60   — search match
ring-1 ring-blue-400/50     — selected
```

**No raised/card shadows on panels.** Panel separation is borders only.

---

## 9. Hard Rules for UI Agents

These are non-negotiable. Violations will be rejected in review.

1. **No emojis in the UI.** Replace existing ones with Lucide icons at the prescribed size and color.
2. **No new colors.** If an element needs a color not in Section 2, request brand review first.
3. **No `ring-*` for focus.** Focus is `border-blue-500` only.
4. **All interactive elements must have `transition-colors` at minimum.** No static hover states.
5. **All `font-mono` renders in JetBrains Mono** once the font is loaded. System mono is the fallback.
6. **Panel headers use the signature pattern** (Section 6). No exceptions.
7. **Icons are Lucide only.** No inline SVGs, no FontAwesome, no Material Icons, no emoji.
8. **No custom hex values in components.** Use Tailwind utility classes. If a specific value is needed, it goes in `tailwind.config.js` and is documented here.
9. **Toolbar buttons show icon + text label.** Do not create icon-only toolbar buttons.
10. **Dark theme is the only theme.** There is no light mode. Do not build for one. Do not add `dark:` variants.
11. **No decorative elements.** No illustrations, gradients, or visual flourishes. This is a tool.
12. **Refer to the product as "MakersEdge"** in all user-facing text, page titles, and meta tags.

---

## 10. Implementation Checklist (Brand Debt)

Existing violations to resolve. These should ship before or alongside Phase 1 features.

| Item | Location | Action |
|------|----------|--------|
| Badge text "MB" → "MX" | `Toolbar.tsx`, `public/icon.svg` | Update text content |
| Page title | `index.html` | Change to "MakersEdge — Visual OpenSCAD Designer" |
| Meta description | `index.html` | Change to "Parametric 3D design, without code" |
| Gear emoji in Parameters tab | `TabBar.tsx` line ~137 | Replace with `<SlidersVertical size={12} />` |
| Gear emoji in Parameters empty state | `ParametersPanel.tsx` line ~191 | Replace with `<SlidersVertical size={48} className="text-gray-700" />` |
| Sketch badge "SK" text | `SketchToolbar.tsx` | Replace with `<PenTool size={14} />` in pink badge |
| Add `lucide-react` dependency | `package.json` | `npm install lucide-react` |
| Add JetBrains Mono font | `public/fonts/`, `index.css`, `tailwind.config.js` | Self-host woff2, add @font-face, extend config |
| Remove unused Tailwind `surface`/`accent` colors | `tailwind.config.js` | Delete custom color definitions |
| Favicon text "MB" → "MX" | `public/icon.svg` | Update SVG text element |
| Old project name references | README.md, package.json `name` | Update product description to MakersEdge |

---

## 11. Cross-References

| Document | Relationship |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical governance — dependency policy, security, codegen |
| [styling-guide.md](styling-guide.md) | Detailed component CSS patterns (canonical CSS reference) |
| [features/design-guidelines.md](features/design-guidelines.md) | Feature-level design constraints (references this document) |
| [features/F-006-tab-type-indicators.md](features/F-006-tab-type-indicators.md) | Tab icon implementation spec |
