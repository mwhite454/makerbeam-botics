# ARCHITECTURE.md — MakersEdge

**Owners**: Backend Architect (technical decisions), UX Architect (UX decisions)
**Last Updated**: April 4, 2026
**Status**: Living document — updated as features ship
**Brand Reference**: See [BRAND.md](BRAND.md) for all visual, naming, and icon decisions

---

## 1. System Overview

MakersEdge is a **client-side-only** visual node editor for parametric 3D design. There is no backend, no database, no user accounts, and no server-side processing. All computation — codegen, WASM rendering, 3D preview — happens in the browser.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Browser                                                                │
│                                                                         │
│  ┌──────────┐   ┌──────────┐   ┌────────────┐   ┌──────────────────┐   │
│  │  React    │──▶│ Codegen  │──▶│ Web Worker │──▶│  Three.js        │   │
│  │  Node     │   │ (TS)     │   │ OpenSCAD   │   │  Preview Panel   │   │
│  │  Editor   │   │          │   │ WASM       │   │  (STL/OFF mesh)  │   │
│  │ (XYFlow)  │   └──────────┘   └────────────┘   └──────────────────┘   │
│  └──────────┘                                                           │
│       │                                                                 │
│       ▼                                                                 │
│  ┌──────────┐   ┌──────────┐                                            │
│  │ Zustand   │──▶│ localStorage                                         │
│  │ Store     │   │ (auto-save)                                          │
│  └──────────┘   └──────────┘                                            │
│                                                                         │
│  Static assets served from Cloudflare Pages (primary) or nginx (Docker) │
└─────────────────────────────────────────────────────────────────────────┘
```

### Core Data Flow

1. User manipulates nodes in the XYFlow editor
2. `useCodegen` debounces (150ms) and generates OpenSCAD code from the graph
3. OpenSCAD code is sent to the WASM worker for rendering
4. Worker returns STL/OFF/PNG buffers
5. Three.js renders the result in the preview panel
6. State auto-saves to localStorage on interval

### Tech Stack (Current)

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React + TypeScript | 18.x / 5.7 |
| Node Editor | @xyflow/react | 12.x |
| 3D Preview | Three.js | 0.172.x |
| State | Zustand + Immer | 5.x / 10.x |
| CAD Engine | openscad-wasm (Web Worker) | 0.0.4 |
| 2D Sketch | Maker.js | 0.19.x |
| Styling | Tailwind CSS | 3.4.x |
| Build | Vite | 6.x |
| Deployment | Cloudflare Pages / Docker+nginx | — |

---

## 2. Dependency Policy

### Principles

1. **No new runtime dependencies without architectural review.** Every dependency is attack surface, bundle weight, and maintenance liability. The JS ecosystem's supply chain risk is real and growing.
2. **Prefer browser APIs and existing deps.** If Three.js, XYFlow, or the browser platform can solve it, don't add a library.
3. **Pin pre-1.0 packages to exact versions.** Semver `^0.x` allows breaking changes.
4. **Actively maintained or actively replaceable.** If a dependency goes unmaintained, have a migration path.

### Approved Dependencies (Current)

| Package | Status | Notes |
|---------|--------|-------|
| `@xyflow/react` | Active | Core architecture — not replaceable |
| `three` | Active | Core architecture — not replaceable |
| `openscad-wasm` | Pre-1.0, single maintainer | **Pin to exact `0.0.4`**. Monitor for forks if abandoned. |
| `zustand` | Active | Core architecture — lightweight, well-maintained |
| `immer` | Active | Zustand middleware — stays |
| `react-resizable-panels` | Active | Panel layout — stays |
| `react-router-dom` | Active | Routing — stays |
| `makerjs` | Unmaintained (last release 2021) | Acceptable — 2D sketch is stable. No CVEs. Replace only if blocker emerges. |
| `react-color` | Unmaintained (last release 2020) | **Replacement candidate.** Used in `ColorNode.tsx` (`BlockPicker`, `SwatchesPicker`). See Section 2.2. |
| `@tanstack/react-table` | Active | Table rendering — stays |

### Approved New Dependencies (for Feature Work)

| Package | Approx Size (gzip) | Justification | Feature |
|---------|-------------------|---------------|---------|
| `lucide-react` | ~5KB (tree-shakeable) | Tab icons, halt toggle, toolbar — brand guidelines mandate Lucide (see `BRAND.md` Section 5). No existing icon library. Tree-shaking means only imported icons ship. | F-004, F-006, design guidelines |
| `expr-eval` | ~3KB | Safe expression evaluation for preview. No eval/Function(). Isolated evaluator. See Section 3.1. | F-001 |
| `dompurify` | ~7KB | SVG sanitization for `dangerouslySetInnerHTML`. **Security requirement** — not optional. | Security hardening |
| `@types/dompurify` | dev only | TypeScript types for DOMPurify | Security hardening |

### Rejected / Deferred Dependencies

| Package | Size | Reason for Rejection |
|---------|------|---------------------|
| `mathjs` | ~90KB gzip | Massively oversized for our expression grammar. We need `+`, `-`, `*`, `/`, `%`, `**`, comparisons, and variable references — not matrix algebra. |
| `three-viewport-gizmo` | ~15KB | Orientation gizmo (F-003 R4). Build custom instead — it's a small separate scene with synced camera rotation. Avoids dependency for trivial geometry. |
| `monaco-editor` | ~2MB | Expression editor. Absurdly oversized. A styled `<input>` with autosuggest is sufficient. |
| `codemirror` | ~150KB | Same rationale as monaco. Overkill for single-line expressions. |
| `hotkeys-js` / `mousetrap` | ~3-5KB | Keyboard shortcuts (F-005). Use native `KeyboardEvent` handlers — XYFlow already does this. Adding a hotkey library adds complexity without value for <10 shortcuts. |

### Dependency to Replace

**`react-color`** — Unmaintained since 2020. Not a blocker today, but if a bug surfaces there is no upstream fix path. When the color picker needs work (F-003 R3 color persistence), evaluate:
- `@uiw/react-color` — actively maintained, smaller, similar API
- Custom implementation — a simple HSL picker is ~100 lines with existing Tailwind

**Decision**: Defer replacement. If F-003 R3 exposes a `react-color` issue, replace at that time.

---

## 3. Feature Architecture Decisions

### 3.1 Expression Evaluation Strategy (F-001)

**Decision: Two-tier approach — `expr-eval` for preview, existing `Function()` for codegen.**

The application has two distinct expression evaluation needs:

| Context | Requirement | Strategy |
|---------|------------|----------|
| **Preview** (live UI feedback) | Evaluate `i * 2 + width` with variable values → show `42` | `expr-eval` — safe, no eval, handles untrusted input |
| **Codegen** (OpenSCAD output) | Emit `i * 2 + width` as a string in generated OpenSCAD | Pass-through — expressions are strings embedded in code output |

**Why not `Function()` for preview?** The existing `evaluateNumericExpression()` in `sketchCodegen.ts` uses `Function()` with a character whitelist. This works for sketch numerics but:
- The whitelist (`[0-9+\-*/().,\s]`) excludes `%`, `**`, and comparison operators needed by F-001
- Expanding the whitelist to include `>`, `<`, `=`, `!` makes it harder to audit
- `Function()` produces cryptic errors for users ("Unexpected token")
- `expr-eval` gives structured error information suitable for UI display

**Architecture:**

```
src/utils/expressionEvaluator.ts
├── evaluateForPreview(expr, variables) → number | null
│   Uses expr-eval — safe for untrusted input, returns null on error
│
└── resolveScope(tabId, tabs, globalParams) → Record<string, number>
    Walks parent tab chain to collect available variables
```

The scope resolver walks `parentTabId` references (from F-002's data layer) to build the variable scope: global parameters are always available, loop iterators are available inside loop body tabs, module args inside module tabs.

**IF node codegen (F-001 R6):** IF node conditions are emitted directly into OpenSCAD `if` statements. The expression string is embedded in codegen output — no JS-side evaluation needed for codegen. Preview evaluation uses `expr-eval` to show the user what the condition evaluates to at a given iteration.

### 3.2 Camera State Persistence (F-003)

**Decision: Store camera state in Zustand, keyed by tab ID. Capture before geometry swap, restore after.**

```typescript
// In editorStore or a dedicated cameraStore
cameraState: Record<string, {
  position: [number, number, number]
  target: [number, number, number]
  zoom: number
  up: [number, number, number]
}>
```

**Implementation pattern in PreviewPanel:**
1. Before geometry swap: read `camera.position`, `controls.target`, `camera.zoom` → store
2. After new mesh loads: restore from store → `controls.update()`
3. On tab switch: save current tab's camera → restore target tab's camera (or use defaults)

**No cross-session persistence.** Camera state lives in Zustand only (not localStorage). Persisting camera across browser sessions adds save/load format complexity for minimal value. Defer unless users request it.

**Orientation gizmo (F-003 R4):** Built as a second `THREE.Scene` + `THREE.OrthographicCamera` rendered in a small corner overlay (`<canvas>` element). The gizmo camera's rotation is synced to the main camera on every frame. No library needed — it's three colored lines plus axis labels.

### 3.3 Halt Flow Codegen (F-004)

**Decision: Subgraph extraction via root replacement (already implemented).**

When a halt is active, `generateCode()` in `codegen/index.ts` (lines 847–857):
1. Scans for nodes with `_halted === true`
2. Replaces the normal root set with halted node IDs
3. Runs the existing `emitNode()` recursion, which naturally walks only the upstream subgraph

This is effectively Option A (subgraph extraction) achieved through root replacement rather than explicit graph copying. The existing recursive emitter already handles arbitrary subgraphs correctly — no new code paths needed.

**Current state:** Halt toggle UI (`BaseNode.tsx`), visual dimming (`HaltDimmedContext`), codegen isolation (root replacement in `generateCode`), preference for stripping halts on export (`stripHaltsOnExport` in `preferencesStore`), and clear-all-halts toolbar action all exist. **F-004's remaining work is UI polish only** — improving the visual feedback (R1 refinement), verifying convergent branch behavior (R4), and potentially adding a persistent halt status indicator in the toolbar.

### 3.4 Scoped Sub-Editor Preview (F-002)

**Decision: Cross-tab codegen with upstream geometry synthesis.**

This is the most architecturally significant feature. When previewing a loop body tab:

1. Emit the loop body module definition (existing capability)
2. Walk to the parent tab via `parentTabId`
3. Find what's connected to the for-loop node's `in-0` handle
4. Generate code for that upstream geometry using `emitUpstreamGeometry()` — a new helper that runs `emitNode()` against the parent tab's adjacency graph
5. Synthesize an invocation: `for_body(previewI, ...) { upstream_geo }`

**Key architectural concern:** This creates a cross-tab codegen dependency. The `emitUpstreamGeometry()` helper must access the parent tab's nodes and edges, which are stored on the `EditorTab` object. This is read-only and poses no concurrency issues (JS is single-threaded), but the function signature must explicitly take `parentTab: EditorTab` rather than implicitly reading from the active tab.

**`EditorTab` interface additions:**

```typescript
interface EditorTab {
  // ... existing fields ...
  parentTabId?: string    // tab that spawned this one
  parentNodeId?: string   // node in parent tab that owns this body
}
```

**Backfill for legacy saves:** On `importProject`, scan all tabs for nodes with `bodyTabId` references. For each, set the referenced tab's `parentTabId` and `parentNodeId`.

### 3.5 Keyboard Navigation (F-005)

**Decision: Native `KeyboardEvent` handlers on the ReactFlow wrapper. No hotkey library.**

Current keyboard handling already uses `onKeyDown` handlers in `EditorPanel.tsx`. F-005 adds handlers for `SHIFT+Arrow` graph traversal and `SHIFT+TAB` edge focus in the same pattern.

**Focus boundary contract (F-001 + F-005 coexistence):**

```
Canvas focused (EditorPanel)     → F-005 shortcuts active (SHIFT+arrows, SHIFT+TAB)
Node input focused (BaseNode)    → F-001 shortcuts active (Tab, Enter, arrow in autosuggest)
                                   F-005 shortcuts INACTIVE (stopPropagation from input)
```

All node input `onKeyDown` handlers must `stopPropagation()` to prevent graph navigation from firing while editing expressions. This is already partially implemented in `BaseNode.tsx` for Tab cycling.

### 3.6 Tab Type Indicators (F-006)

**Decision: Add `lucide-react`, use tree-shakeable icon imports.**

```typescript
import { Box, RefreshCw, Puzzle, PenTool, Settings } from 'lucide-react'

const TAB_ICON: Record<TabType, LucideIcon> = {
  main: Box,
  loop: RefreshCw,
  module: Puzzle,
  sketch: PenTool,
  tab: Settings,          // Parameter/generic tabs
}
```

`lucide-react` is tree-shakeable — only the 5 imported icons ship in the bundle (~1KB total). This replaces the existing text badges ("mod", "skt", "lp") in `TabBar.tsx`.

---

## 4. Security Architecture

### 4.1 Threat Model

This is a static SPA with no backend. The attack surface is narrower than typical web apps but not zero.

| Threat | Applies | Mitigation |
|--------|---------|------------|
| XSS via SVG injection | **Yes — active finding** | DOMPurify on all `dangerouslySetInnerHTML` (Section 4.2) |
| Supply chain compromise | Yes | Lockfile integrity, `npm ci`, dependency audit, pin pre-1.0 (Section 2) |
| WASM resource exhaustion | Yes | Render timeout, file size limits (Section 4.4) |
| Clickjacking | Yes | `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'` |
| Data breach | **No** | No server-side data, no user accounts, no outbound requests |

### 4.2 Active Vulnerability: SVG Injection

**Severity: High** | **Location:** `src/components/sketch/SketchPreviewPanel.tsx`

The sketch preview renders SVG via `dangerouslySetInnerHTML`. While the SVG originates from `makerjs` codegen (not raw user input), the pipeline includes user-imported SVG files. If `makerjs` passes through malicious SVG attributes from an imported file, script execution is possible.

**Required fix:** Add `dompurify` and sanitize before rendering:

```typescript
import DOMPurify from 'dompurify'

const sanitized = DOMPurify.sanitize(svg, {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: ['svg'],
  ADD_ATTR: ['overflow', 'viewBox', 'xmlns'],
})
```

**This is a P0 security item. Ship before any feature work.**

### 4.3 Content Security Policy

Tailored to our actual resource loading patterns:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data:;
font-src 'self';
connect-src 'self';
worker-src 'self' blob:;
child-src 'self' blob:;
object-src 'none';
base-uri 'self';
form-action 'none';
frame-ancestors 'none';
```

| Directive | Rationale |
|-----------|-----------|
| `script-src 'self'` | No inline scripts, no eval. Vite produces bundled JS only. Blocks XSS payload execution. |
| `style-src 'self' 'unsafe-inline'` | Required — React `style={}`, XYFlow, react-resizable-panels, and Tailwind inject inline styles. Standard for React apps. |
| `worker-src 'self' blob:` | Vite may emit workers as blob URLs. |
| `connect-src 'self'` | No external API calls. Enforces zero-outbound-request policy. |
| `form-action 'none'` | No form submissions. Exports use blob URL `<a>` clicks. |

### 4.4 WASM Worker Hardening

| Measure | Status | Action |
|---------|--------|--------|
| Worker isolation | Done | Separate thread — WASM memory corruption can't affect DOM |
| Fresh instance per render | Done | Prevents state leakage |
| Render timeout | **Missing** | Add 120s timeout in `useOpenSCAD.ts`. Terminate and recreate worker on timeout. |
| Filename sanitization | **Missing** | Sanitize imported filenames before WASM FS mount: strip path components, restrict to `[a-zA-Z0-9._-]` |
| File size limits | **Missing** | Add 50MB cap in `FilePickerInput` before `FileReader` processing |

### 4.5 File Import Validation

| Format | Parser | Risk | Mitigation |
|--------|--------|------|------------|
| SVG | `DOMParser` → `makerjs` | Medium | DOMPurify sanitization (Section 4.2) |
| STL (binary) | `ArrayBuffer` → WASM | Low | File size limit (50MB) |
| JSON (project) | `JSON.parse` | Low | Schema validation on load (version check exists, extend field validation) |
| OFF | Text parsing | Low | Vertex/face count limits to prevent memory exhaustion |

### 4.6 localStorage

**Risk: Low.** localStorage is same-origin isolated. No sensitive data (no auth tokens, no PII, no API keys).

| Item | Status |
|------|--------|
| Size guard (5MB) | Done — `useAutoSave.ts` |
| Parse error handling | Done — try/catch on `loadSavedProject()` |
| Schema validation on load | Partial — `data.version` check exists. Extend if issues arise. |

---

## 5. Deployment & Hosting

### 5.1 Zero User Data Policy

This application collects no user data. This is a deliberate architectural decision, not an omission.

**Enforced by:**
- No backend, no API endpoints, no database
- `connect-src 'self'` CSP — blocks any outbound requests from future code
- No analytics scripts (Cloudflare Web Analytics must remain disabled)
- No cookies beyond Cloudflare's bot protection (`cf_clearance`)
- All project data stays in browser localStorage
- Imported files are processed locally and never uploaded
- Exported files are generated locally and downloaded directly

**Cloudflare observability:** `wrangler.jsonc` has `"observability": { "enabled": true }`. This logs request metadata (IP, path, status code) on Cloudflare's edge infrastructure. This is server-side access logging, not client-side analytics. **Decision for owner:** Evaluate whether edge access logs are acceptable under zero-data posture. If not, set `"enabled": false`.

### 5.2 Cloudflare Pages (Primary)

**`public/_headers` — required hardened configuration:**

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; child-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

**Cloudflare dashboard settings:**

| Setting | Value | Rationale |
|---------|-------|-----------|
| SSL/TLS | Full (Strict) | Never Flexible |
| Always Use HTTPS | On | — |
| Minimum TLS Version | 1.2 | — |
| HSTS | On (6 months+, includeSubDomains) | Via dashboard, not `_headers` |
| Auto-Minify | Off | Vite handles minification |
| Email Obfuscation | Off | Injects inline scripts — breaks CSP |
| Rocket Loader | Off | Breaks CSP and ES module loading |
| Browser Integrity Check | On | — |

**`wrangler.jsonc` cleanup:** Remove `"nodejs_compat"` compatibility flag if no Workers functions are running. It's a Workers runtime flag and doesn't apply to Pages static assets.

### 5.3 Docker / nginx (Self-Hosted)

See `nginx.conf` for the full hardened configuration. Key additions beyond current config:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |
| `Content-Security-Policy` | (same as Section 4.3) |
| `server_tokens` | `off` |

Add dotfile blocking: `location ~ /\. { deny all; return 404; }`

**TLS note:** The Dockerfile exposes port 80 (HTTP only). Self-hosted deployments must terminate TLS upstream (reverse proxy or load balancer). Once TLS is guaranteed, add `Strict-Transport-Security: max-age=63072000; includeSubDomains`.

---

## 6. State Architecture

### 6.1 Store Layout

```
Zustand Stores
├── editorStore (immer middleware)
│   ├── tabs: EditorTab[]              — all open tabs with their node/edge graphs
│   ├── activeTabId: string            — current tab
│   ├── nodes / edges                  — active tab's graph (synced on tab switch)
│   ├── generatedCode: string          — latest codegen output
│   ├── renderResult*                  — WASM output buffers (STL/OFF/PNG)
│   ├── renderStatus / renderError     — render pipeline state
│   ├── globalParameters               — user-defined parameters
│   ├── importedFiles                  — filename → base64 map
│   ├── projectName                    — project identity
│   └── cameraState [F-003]            — per-tab camera state (planned)
│
├── preferencesStore (persist → localStorage)
│   ├── autoSaveEnabled / interval     — auto-save config
│   ├── lastViewport                   — editor viewport position
│   ├── stripHaltsOnExport             — strip _halted flags on project export
│   └── longClickThresholdMs [F-001]   — expression editor config (planned)
│
└── sketchStore
    └── (sketch editor state)
```

### 6.2 EditorTab Model (with planned additions)

```typescript
interface EditorTab {
  id: string
  label: string
  tabType: TabType           // 'main' | 'module' | 'tab' | 'sketch' | 'loop'
  isModule: boolean
  moduleName: string
  sketchName: string
  nodes: Node[]
  edges: Edge[]
  // ── Planned additions ──
  parentTabId?: string       // [F-002] tab that spawned this one
  parentNodeId?: string      // [F-002] node in parent tab that owns this body
}
```

### 6.3 Data Flow Invariants

1. **Active tab's nodes/edges are always synced** — `onNodesChange`/`onEdgesChange` write to `state.nodes`/`state.edges` AND the active tab's arrays
2. **Tab switch saves before loading** — `setActiveTab` persists current tab's graph before switching
3. **Codegen reads from active tab** — `useCodegen` always operates on the current `nodes`/`edges` Zustand values
4. **Render is async** — WASM worker is a singleton; renders queue naturally
5. **Auto-save is throttled** — configurable interval, 5MB localStorage cap

---

## 7. Codegen Architecture

### 7.1 Current Pipeline

```
Node Graph → buildAdjacency() → findRoots() → emitNode() (recursive) → OpenSCAD string
```

- `buildAdjacency(edges)` builds a `Map<nodeId, ChildRef[]>` — children sorted by handle index
- `findRoots(nodes, edges)` finds nodes with no outgoing edges (terminal/render nodes)
- `emitNode()` recursively walks from roots through children, emitting OpenSCAD

Module and loop body tabs emit their code as module definitions. The main tab emits top-level code + invocations.

### 7.2 Planned Codegen Extensions

| Extension | Feature | Approach |
|-----------|---------|----------|
| `emitUpstreamGeometry()` | F-002 | New helper — runs `emitNode()` against a parent tab's adjacency graph for a specific input handle |
| `generateLoopPreviewCode()` | F-002 | Synthesizes loop body def + upstream geo + invocation at preview iteration |
| `generateModulePreviewCode()` | F-002 | Synthesizes module def + call with arg overrides |
| ~~Subgraph extraction for halt~~ | F-004 | **Already implemented.** Halted nodes replace the root set in `generateCode()` (lines 847–857). Remaining F-004 work is UI polish only. |

### 7.3 Expression Handling in Codegen

Expressions in node inputs are **emitted as strings** in OpenSCAD output. The `expr()` helper in `codegen/index.ts` preserves string values like `i*2` and `width/2` rather than coercing them to numbers. This is correct — OpenSCAD evaluates the expressions at render time.

For preview purposes (F-001), `expr-eval` evaluates the same expression string with current variable values. The two systems (codegen string emission and preview evaluation) are independent and never conflict.

---

## 8. Priority Action Items

### P0 — Security (Before Feature Work)

| Item | Effort | Details |
|------|--------|---------|
| Add `dompurify` for SVG sanitization | 30 min | Section 4.2 |
| Expand `public/_headers` with full security headers | 15 min | Section 5.2 |
| Pin `openscad-wasm` to exact `0.0.4` in package.json | 5 min | Section 2 |

### P1 — Security (This Sprint)

| Item | Effort | Details |
|------|--------|---------|
| Harden `nginx.conf` | 30 min | Section 5.3 |
| Add file size limits to file import | 15 min | Section 4.5 |
| Add render timeout to WASM worker | 30 min | Section 4.4 |
| Sanitize filenames before WASM FS mount | 15 min | Section 4.4 |
| Evaluate `observability.enabled` in wrangler.jsonc | 5 min | Section 5.1 |
| Remove `nodejs_compat` from wrangler.jsonc if unused | 5 min | Section 5.2 |

### P2 — Feature Sequencing

See [features/FEATURES.md](features/FEATURES.md) for the full feature inventory and dependency graph.

**Recommended build order:**

| Phase | Feature | Rationale |
|-------|---------|-----------|
| 1 | F-006 (Tab Indicators) + F-003 R1 (Camera re-render persistence) | Quick wins. High impact, low risk. |
| 2 | F-001 (Universal Expression Editor) | Foundational. Unblocks IF node. Provides components for F-002. |
| 3 | F-005 (Keyboard Navigation) + F-003 R2–R4 (Per-tab camera, gizmo) | Productivity layer. |
| 4 | F-002 (Scoped Sub-Editor Preview) | Largest scope. Benefits from F-001 + F-003 being in place. |
| 1a | F-004 (Halt Flow — UI Polish) | Codegen already works. Remaining work is UI refinement only — lowest effort of all features. Can ship alongside Phase 1. |

### P3 — Maintenance (Backlog)

| Item | Details |
|------|---------|
| Enable Dependabot or Renovate | Automated dependency update PRs |
| Add `npm audit` to CI | Weekly + on PRs (Section 4) |
| Evaluate `react-color` replacement | When F-003 R3 work begins |

---

## 9. Conventions for Development Agents

### File Organization

```
src/
├── codegen/          — OpenSCAD code generation (pure functions, no React)
├── components/       — React components
│   ├── panels/       — Major panels (Editor, Preview, Code, Parameters, TabBar)
│   ├── sketch/       — Sketch editor components
│   └── toolbar/      — Toolbar and palette
├── contexts/         — React contexts
├── hooks/            — Custom hooks (useCodegen, useAutoRender, useAutoSave)
├── nodes/            — Node type implementations (BaseNode + categories)
├── nodepacks/        — External node pack definitions
├── store/            — Zustand stores
├── types/            — TypeScript type definitions
├── utils/            — Pure utility functions
└── wasm/             — WASM worker and hook
```

### Rules for Feature Implementation

1. **No new stores without review.** Extend `editorStore` or `preferencesStore` unless there's a clear separation-of-concerns argument.
2. **No external network requests.** `connect-src 'self'` CSP will block them. If you need data, it comes from the user's filesystem or localStorage.
3. **All `dangerouslySetInnerHTML` must use DOMPurify.** No exceptions.
4. **Keyboard shortcuts go in `EditorPanel.tsx`** unless they're input-specific (those go in `BaseNode.tsx` handlers with `stopPropagation`).
5. **Codegen functions are pure.** They take `(nodes, edges, ...)` and return strings. No side effects, no store access.
6. **Follow the styling guide and brand doc.** Dark theme, Tailwind, no emojis in UI, Lucide icons only. See `styling-guide.md` and `BRAND.md`.
7. **Test codegen changes with unit tests.** Codegen is pure-function and highly testable.
8. **No `eval()` or `new Function()` for user-facing evaluation.** Use `expr-eval` for preview. Existing `Function()` in sketch codegen is grandfathered but not a pattern to replicate.
