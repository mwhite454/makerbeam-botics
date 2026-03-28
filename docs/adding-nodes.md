# Adding Nodes to makerbeam-botics

There are two ways to add nodes, depending on whether they belong to the built-in
OpenSCAD language or to an external library (MakerBeam, BOSL2, NopSCADlib, etc.).

---

## Option A — Core node (built-in OpenSCAD)

Use this for nodes that map directly to OpenSCAD primitives, transforms, or
control-flow constructs (`sphere`, `translate`, `for`, etc.).

### Files to touch (8 steps)

| # | File | What to do |
|---|------|------------|
| 1 | `web/src/types/nodes.ts` | Add `export interface MyNodeData { field: Type }` |
| 2 | `web/src/types/nodes.ts` | Add `MyNodeData` to the `AllNodeData` union |
| 3 | `web/src/types/nodes.ts` | Add entry to `PALETTE_ITEMS` |
| 4 | `web/src/types/nodes.ts` | *(if new category)* Add to `NodeCategory` union |
| 5 | `web/src/types/nodes.ts` | *(if new category)* Add to `CATEGORY_COLORS`, `CATEGORY_TEXT`, `CATEGORY_LABELS` |
| 6 | `web/src/nodes/<folder>/MyNode.tsx` | Create the React component |
| 7 | `web/src/nodes/index.ts` | Import and add to `coreNodeTypes` |
| 8 | `web/src/codegen/index.ts` | Add `case 'mynode':` to `emitNode()` switch |
| 9 | *(optional)* `web/src/codegen/myPreamble.ts` | OpenSCAD helper module definitions |

### Node component pattern

```tsx
import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { MyNodeData } from '@/types/nodes'

export function MyNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as MyNodeData
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <BaseNode
      id={id}
      category="primitive3d"   // controls badge color in palette & node header
      label="mynode"
      selected={selected}
      inputHandles={[           // omit if no input ports
        { id: 'in-0', label: 'radius' },
      ]}
    >
      <NumberInput
        label="radius"
        value={d.radius}
        min={0}
        step={1}
        onChange={(v) => update(id, { radius: v })}
      />
    </BaseNode>
  )
}
```

**Available input components** (from `BaseNode`):

| Component | Use for |
|-----------|---------|
| `NumberInput` | Numeric fields (int or float) |
| `ExpressionInput` | Numeric fields that also accept OpenSCAD expressions |
| `ExpressionVectorInput` | [x, y, z] vectors with expression support |
| `CheckboxInput` | Boolean toggles |
| `SelectInput` | Enum dropdowns |
| `TextInput` | Free-form string fields |

### Palette item pattern

```ts
{ type: 'mynode', label: 'my node', category: 'primitive3d',
  defaultData: { radius: 10 } as MyNodeData,
  description: 'One-sentence tooltip shown on hover.',
  inputs: 'radius — radius in mm' },
```

### Codegen case pattern

```ts
case 'mynode': {
  const radiusExpr = resolveValueInput(0, expr(d.radius))
  result = `${pad}my_module(r = ${radiusExpr});\n`
  break
}
```

`resolveValueInput(handleIndex, fallback)` — returns the upstream node's
identifier if a value wire is connected to that handle, otherwise the fallback.

---

## Option B — Pack node (third-party library)

Use this for nodes that require a library to be present (MakerBeam, BOSL2, etc.).
A pack is a self-contained directory that adds nodes **without touching core files**.

### One-time setup (already done for MakerBeam)

The pack system is already wired. To add a new pack library:

1. Create `web/src/nodepacks/<libname>/` with these files:
   - `types.ts` — data interface(s) + `PALETTE_ITEMS` array
   - `preamble.ts` — OpenSCAD `include`/`use` or inlined module definitions
   - `MyLibNode.tsx` — React component(s)
   - `index.ts` — `NodePackDefinition` manifest

2. Add one line to `web/src/nodepacks/index.ts`:
   ```ts
   import { myLibPack } from './mylib'
   export const NODE_PACKS: NodePackDefinition[] = [
     makerbeamPack,
     myLibPack,  // ← add here
   ]
   ```

That's it. The category, palette entries, node components, codegen handler, and
preamble are all wired automatically from `NODE_PACKS`.

### Pack manifest structure

```ts
// web/src/nodepacks/mylib/index.ts
import type { NodePackDefinition } from '@/types/nodePack'
import { MyLibNode } from './MyLibNode'
import { MYLIB_PALETTE_ITEMS } from './types'
import { MYLIB_PREAMBLE } from './preamble'

export const myLibPack: NodePackDefinition = {
  id: 'mylib',
  category: 'mylib',              // new or existing category string
  categoryLabel: 'My Library',
  categoryColor: 'bg-teal-500',   // Tailwind bg class
  categoryTextColor: 'text-white',

  nodeTypes: {
    mylib_cube: MyLibNode,
  },

  paletteItems: MYLIB_PALETTE_ITEMS,

  codegenHandlers: {
    mylib_cube: (node, ctx) => {
      const d = node.data as Record<string, unknown>
      return `${ctx.pad}mylib_cube(${ctx.num(d.size)});\n`
    },
  },

  // Return preamble string when any node from this pack is in the graph,
  // or null to skip.
  preamble: (nodes) =>
    nodes.some((n) => n.type === 'mylib_cube') ? MYLIB_PREAMBLE : null,
}
```

### `CodegenContext` fields

Your `codegenHandlers` receive a `ctx: CodegenContext` with:

| Field | Type | Description |
|-------|------|-------------|
| `ctx.pad` | `string` | Current indentation string |
| `ctx.num(v)` | `(v) => number` | Coerce to number (returns 0 on non-numeric) |
| `ctx.expr(v)` | `(v) => string` | Coerce to expression string (preserves `'i*2'` etc.) |
| `ctx.bool(v)` | `(v) => string` | `'true'` or `'false'` |
| `ctx.escapeString(v)` | `(v) => string` | Escape `\` and `"` for OpenSCAD strings |
| `ctx.sanitizeIdentifier(raw, fb?)` | `(v) => string` | Safe OpenSCAD identifier |
| `ctx.resolveValueInput(idx, fb)` | `(i, s) => string` | Value wire resolver |
| `ctx.getAllChildren()` | `() => string` | Emit all child geometry nodes |
| `ctx.getChild(idx)` | `(i) => string` | Emit single child at handle index |
| `ctx.hasChild(idx)` | `(i) => boolean` | Test if child wire exists |
| `ctx.emitTransform(header)` | `(s) => string` | Emit a transform with its child |

---

## Reference: existing packs

| Pack directory | Category | Nodes |
|----------------|----------|-------|
| `web/src/nodepacks/makerbeam/` | `makerbeam` | `makerbeam` |
