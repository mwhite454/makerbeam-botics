# F-001: Universal Expression Editor

**Status**: Draft — Ready for Architectural Review
**Source Plans**: `plans/refine-expression-editor.md`, `plans/if-workflow.md`
**Dependencies**: None (foundational — other features may depend on this)
**Estimated Complexity**: XL

---

## Problem Statement

The node input system is inconsistent and underpowered. Some nodes have an expression builder, some don't. Some default to expression mode, some to raw data entry. The IF node is essentially non-functional — its dropdown only offers true/false, making conditional logic impossible for any real design work.

Users cannot write parametric expressions that reference variables or global parameters, cannot preview computed values, and have no consistent keyboard-driven workflow for editing node inputs. This blocks the product's core value proposition: parametric design without code.

**What's broken today:**
- Expression builder availability is per-node, not universal
- IF node cannot evaluate meaningful conditions (only true/false dropdown)
- No autosuggest for in-scope variables or global parameters
- No way to preview the evaluated result of an expression
- Inconsistent keyboard navigation between node inputs

---

## Requirements

### R1: Universal Expression Builder (Default Input Mode)

Every node input field renders as an expression builder by default, prepopulated with sane defaults for that node type. The expression builder component is a single, shared implementation — not per-node.

**Acceptance Criteria:**
- [ ] All node input fields use the same `ExpressionBuilder` component
- [ ] Expression builder is the default mode for every input (not raw/dumb data)
- [ ] Each node type defines sensible default expressions for its inputs
- [ ] CTRL+M toggles between expression builder and raw data entry
- [ ] Toggling preserves the current value where type-compatible

### R2: Variable & Parameter Autosuggest

When typing in an expression builder, a filterable autosuggest dropdown appears showing all variables in scope (loop iterators, locally declared variables) and all global parameters by name.

**Acceptance Criteria:**
- [ ] Typing triggers autosuggest with matching variables/parameters
- [ ] Suggestions include: loop iterator variables (e.g., `i`), variables declared in the current tab scope, global parameters by name
- [ ] Arrow keys navigate the suggestion list; Enter or Tab selects
- [ ] ESC closes the autosuggest without selecting
- [ ] Autosuggest updates in real time as user types

### R3: Click & Selection Behavior

Single-click on an expression builder selects all text (any typing immediately overwrites). Long-click (>1s, configurable in user preferences) positions the cursor at the click point without selecting.

**Acceptance Criteria:**
- [ ] Single-click selects all content in the expression input
- [ ] Long-click (threshold configurable) inserts cursor at click position
- [ ] Long-click threshold stored in user preferences with a sensible default (1000ms)

### R4: Value Preview

Users can hover over a named variable or parameter in an expression to see its current value in a tooltip. An expandable preview pane shows the total evaluated result of the expression.

**Acceptance Criteria:**
- [ ] Hover over a variable/parameter name shows its current value in a tooltip
- [ ] An expandable preview shows the computed result of the full expression
- [ ] Preview is limited to numeric and simple math results — does not attempt to render SVG documents, geometry, or complex data structures
- [ ] Preview updates live as the expression changes

### R5: Keyboard Navigation Within Nodes

Enter accepts the current input value and advances focus to the next input on the same node. Tab with a node selected cycles through its inputs sequentially.

**Acceptance Criteria:**
- [ ] Enter in an input field commits the value and moves focus to the next input
- [ ] Tab with a node selected (but no input focused) cycles through the node's inputs
- [ ] Shift+Tab cycles inputs in reverse order

### R6: IF Node — Expression-Driven Conditional Logic

The IF node uses the universal expression builder (R1) for its condition, with access to all in-scope variables and parameters. It outputs through clearly labeled YES/NO edges.

**Acceptance Criteria:**
- [ ] IF node condition input uses the universal expression builder
- [ ] IF node has access to loop variables (e.g., `i`, `steps`) and global parameters
- [ ] IF node output edges are labeled YES (condition true) and NO (condition false)
- [ ] IF node takes geometry input on its first edge (prior geometry flows in)
- [ ] Code generation produces valid OpenSCAD — JS-side evaluation translates to correct OpenSCAD conditionals
- [ ] Works within for-loops: e.g., `if (i > steps/2)` evaluates per iteration

**Example (from plan):**
> Within a for loop creating 5 centered cubes then translating them, the IF block checks if `i > steps/2` to determine translation direction. If greater than half, translate positive X. If less, translate negative X. If equal (the middle cube), no translation.

---

## Technical Considerations

### Architecture Decision: Expression Evaluation Strategy

The expression builder needs to handle two distinct concerns:
1. **Authoring UX** — Variable autosuggest, preview, selection behavior (pure frontend)
2. **Code generation** — Translating JS-compatible expressions into valid OpenSCAD

For the IF node specifically, some expressions may not have direct OpenSCAD equivalents. The codegen layer needs the ability to evaluate JS expressions and emit equivalent OpenSCAD. This is a non-trivial capability — scope it carefully.

### Variable Scope Resolution

The autosuggest system needs a scope resolver that can determine which variables are available in a given context:
- **Global parameters**: Always available
- **Loop iterators**: Available inside loop body tabs (e.g., `i`, `steps`)
- **Module arguments**: Available inside module tabs

This likely requires a scope chain that walks up through `parentTabId` references (see F-002's parent tab linkage).

### Open Questions for Review

- [ ] **Expression language spec**: What subset of expressions do we support? Pure math + variable references? Ternary operators? String operations? Need to define the grammar.
- [ ] **Preview safety**: How do we distinguish "safe to preview" expressions from those that would be expensive or meaningless to evaluate? The plan mentions "straightforward math operations" — we need a concrete boundary.
- [ ] **IF node codegen**: What's the codegen strategy for IF conditions that use JS idioms not native to OpenSCAD? Do we pre-evaluate in JS and emit constants, or can we map to OpenSCAD `if` statements?
- [x] **Preference storage**: ~~Where does the long-click threshold live?~~ Extend `preferencesStore` (Zustand + localStorage). Already has `autoSave`, `lastViewport`, `stripHaltsOnExport`. Add `longClickThresholdMs: number` (default 1000).

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Expression grammar scope creep | High | High | Define a minimal grammar spec before implementation. V1 = math + variables + comparisons only. |
| Performance of live preview evaluation | Medium | Medium | Debounce evaluation, limit to numeric results, skip complex types |
| Variable scope resolution complexity | Medium | Medium | Depends on F-002's parent tab linkage — if that ships first, scope resolution becomes straightforward |

---

## Dependencies & Sequencing

- **Depends on**: Nothing — this is foundational
- **Enables**: F-004 (Halt Flow) benefits from consistent node inputs. F-002 (Sub-Editor Preview) module arg overrides could reuse expression builder components.
- **Relationship to F-002**: The scope resolver for autosuggest would benefit from F-002's `parentTabId` linkage, but can be built independently with a simpler scope walk.

---

## Source Traceability

| Requirement | Source |
|---|---|
| R1: Universal expression builder | `refine-expression-editor.md` items 1, 5 |
| R2: Autosuggest | `refine-expression-editor.md` item 2 |
| R3: Click behavior | `refine-expression-editor.md` items 3, 4 |
| R4: Value preview | `refine-expression-editor.md` item 6 |
| R5: Keyboard navigation | `refine-expression-editor.md` items 7, 8 |
| R6: IF node | `if-workflow.md` (entire file) |
