import type { Node, Edge } from '@xyflow/react'
import makerjs from 'makerjs'
import { layoutAlongPath } from '@/utils/layoutAlongPath'
import type { GlobalParameter } from '@/store/editorStore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChildRef { nodeId: string; handleIndex: number }

function sanitizeIdentifier(raw: string): string {
  const sanitized = raw.trim().replace(/[^a-zA-Z0-9_]/g, '_')
  return /^[a-zA-Z_]/.test(sanitized) ? sanitized : `v_${sanitized || 'shape'}`
}

function normalizeParamValue(param: GlobalParameter): string {
  switch (param.dataType) {
    case 'string':
      return JSON.stringify(param.value ?? '')
    case 'boolean':
      return param.value === 'true' ? 'true' : 'false'
    default:
      return String(param.value ?? '0')
  }
}

function paramMapFromList(globalParameters: GlobalParameter[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const p of globalParameters) {
    map[sanitizeIdentifier(p.name)] = normalizeParamValue(p)
  }
  return map
}

function expressionFromNodeData(d: Record<string, unknown>): string {
  const parameterName = sanitizeIdentifier(String(d.parameterName ?? 'param'))
  const template = String(d.expression ?? '{param}').trim() || '{param}'
  return template.replaceAll('{param}', parameterName)
}

function evaluateNumericExpression(expr: string, params: Record<string, string>, fallback: number): number {
  const replaced = expr.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (token) => params[token] ?? token)
  // Allow basic arithmetic only for preview safety.
  if (!/^[0-9+\-*/().,\s]+$/.test(replaced)) return fallback
  try {
    const result = Number(Function(`"use strict"; return (${replaced});`)())
    return Number.isFinite(result) ? result : fallback
  } catch {
    return fallback
  }
}

function resolveExpr(v: unknown, params: Record<string, string>, fallback: number): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback
  if (typeof v === 'string') {
    const n = Number(v)
    if (!isNaN(n)) return n
    return evaluateNumericExpression(v, params, fallback)
  }
  return fallback
}

// ─── Helper: build adjacency maps ─────────────────────────────────────────────

function buildAdjacency(edges: Edge[]): Map<string, ChildRef[]> {
  const childrenOf = new Map<string, ChildRef[]>()

  for (const edge of edges) {
    const targetId = edge.target
    const handleId = edge.targetHandle ?? 'in-0'
    const handleIndex = parseInt(handleId.replace('in-', '') || '0', 10)

    if (!childrenOf.has(targetId)) childrenOf.set(targetId, [])
    childrenOf.get(targetId)!.push({ nodeId: edge.source, handleIndex })
  }

  for (const children of childrenOf.values()) {
    children.sort((a, b) => a.handleIndex - b.handleIndex)
  }

  return childrenOf
}

// ─── Helper: find root nodes ──────────────────────────────────────────────────

function findRoots(nodes: Node[], edges: Edge[]): string[] {
  const hasOutgoingEdge = new Set(edges.map((e) => e.source))
  return nodes
    .filter((n) => !hasOutgoingEdge.has(n.id))
    .map((n) => n.id)
}

// ─── Build Maker.js model from node graph ─────────────────────────────────────

function buildModel(
  nodeId: string,
  nodesMap: Map<string, Node>,
  childrenOf: Map<string, ChildRef[]>,
  visiting: Set<string>,
  visited: Set<string>,
  paramValues: Record<string, string>,
): makerjs.IModel | null {
  if (visiting.has(nodeId) || visited.has(nodeId)) return null
  visiting.add(nodeId)
  visited.add(nodeId)

  const node = nodesMap.get(nodeId)
  if (!node) { visiting.delete(nodeId); return null }

  const d = node.data as Record<string, unknown>
  const children = childrenOf.get(nodeId) ?? []

  function getChildModel(index: number): makerjs.IModel | null {
    const child = children.find((c) => c.handleIndex === index)
    if (!child) return null
    return buildModel(child.nodeId, nodesMap, childrenOf, visiting, visited, paramValues)
  }

  function getNumericValueInput(index: number, fallback: number): number {
    const child = children.find((c) => c.handleIndex === index)
    if (!child) return fallback
    const valueNode = nodesMap.get(child.nodeId)
    if (!valueNode) return fallback
    const valueData = valueNode.data as Record<string, unknown>
    if (valueNode.type === 'sketch_expression' || valueNode.type === 'expression_node') {
      const expr = expressionFromNodeData(valueData)
      return evaluateNumericExpression(expr, paramValues, fallback)
    }
    return fallback
  }

  let model: makerjs.IModel | null = null

  switch (node.type) {
    // ── Primitives ────────────────────────────────────────────────────────
    case 'sketch_rectangle': {
      const w = getNumericValueInput(0, resolveExpr(d.width, paramValues, 1))
      const h = getNumericValueInput(1, resolveExpr(d.height, paramValues, 1))
      const cr = getNumericValueInput(2, resolveExpr(d.cornerRadius, paramValues, 0))
      if (cr > 0) {
        model = makerjs.model.center(
          new makerjs.models.RoundRectangle(w, h, cr),
          d.center !== false
        )
      } else {
        model = makerjs.model.center(
          new makerjs.models.Rectangle(w, h),
          d.center !== false
        )
      }
      break
    }

    case 'sketch_circle': {
      const r = getNumericValueInput(0, resolveExpr(d.radius, paramValues, 1))
      const segs = getNumericValueInput(1, resolveExpr(d.segments, paramValues, 0))
      if (segs > 2) {
        model = new makerjs.models.Polygon(segs, r)
      } else {
        model = { paths: { circle: new makerjs.paths.Circle([0, 0], r) } }
      }
      break
    }

    case 'sketch_ngon': {
      const sides = Math.max(3, Math.round(getNumericValueInput(0, resolveExpr(d.sides, paramValues, 6))))
      const radius = getNumericValueInput(1, resolveExpr(d.radius, paramValues, 1))
      const inscribed = d.inscribed !== false
      if (inscribed) {
        model = new makerjs.models.Polygon(sides, radius)
      } else {
        // Circumscribed: radius is to the flat face
        const circumR = radius / Math.cos(Math.PI / sides)
        model = new makerjs.models.Polygon(sides, circumR)
      }
      break
    }

    case 'sketch_line': {
      try {
        const pts = JSON.parse(String(d.points)) as number[][]
        if (pts.length >= 2) {
          const connect = new makerjs.models.ConnectTheDots(d.closed === true, pts)
          model = connect
        }
      } catch {
        // invalid points JSON
      }
      break
    }

    case 'sketch_path': {
      // Anchors stored as JSON array of {id,pos:[x,y],...}
      try {
        const anchors = JSON.parse(String(d.anchorsJson || '[]')) as Array<{ pos: number[] }>
        // Negate Y: anchors are in SVG Y-down space; makerjs expects Y-up.
        // Resolve each coordinate so that expression strings (e.g. param names) evaluate to numbers.
        const pts = anchors.map((a) => [
          resolveExpr(a.pos[0], paramValues, 0),
          -resolveExpr(a.pos[1], paramValues, 0),
        ])
        if (pts.length >= 2) {
          model = new makerjs.models.ConnectTheDots(d.closed === true, pts)
        }
      } catch {
        // ignore parse errors
      }
      break
    }

    case 'sketch_path_layout': {
      // Build instances of the template along the provided path anchors
      // Template is child handle 0, path is child handle 1 (or path data may be inline)
      const tpl = getChildModel(0)
      // Try to read anchors from connected path node if present
      // Anchor coords may be numbers or expression strings — resolve all to numbers.
      let anchors: [number, number][] = []
      const pathChild = children.find((c) => c.handleIndex === 1)
      if (pathChild) {
        const pathNode = nodesMap.get(pathChild.nodeId)
        if (pathNode) {
          try {
            const pd = pathNode.data as Record<string, unknown>
            const a = JSON.parse(String(pd.anchorsJson || '[]')) as Array<{ pos: unknown[] }>
            anchors = a.map((it) => [resolveExpr(it.pos[0], paramValues, 0), resolveExpr(it.pos[1], paramValues, 0)])
          } catch {
            anchors = []
          }
        }
      }

      // Fallback: inline anchors on this node
      if (anchors.length === 0) {
        try {
          const a = JSON.parse(String(d.anchorsJson || '[]')) as Array<{ pos: unknown[] }>
          anchors = a.map((it) => [resolveExpr(it.pos[0], paramValues, 0), resolveExpr(it.pos[1], paramValues, 0)])
        } catch {
          anchors = []
        }
      }

      if (!tpl || anchors.length === 0) {
        model = tpl
        break
      }

      // Construct a lightweight Path object for the layout util.
      // Anchors are stored in SVG Y-down space (PathPreview convention); makerjs uses
      // math Y-up, so we negate Y here so that layout positions land in the correct space.
      const pathObj = { anchors: anchors.map((p) => ({ pos: { x: p[0], y: -p[1] } })), segments: [], closed: d.closed === true }
      const opts = {
        mode: (d.mode as any) || 'count',
        count: Number(d.count) || 1,
        distance: Number(d.distance) || 10,
        orientation: (d.orientation as any) || 'tangent',
        align: (d.align as any) || 'center',
        offset: Number(d.offset) || 0,
      }

      const layout = layoutAlongPath(pathObj as any, opts as any)

      // Create combined model of clones
      const combined: makerjs.IModel = { models: {} }
      layout.transforms.forEach((t, i) => {
        const instName = `inst_${i}`
        // Deep clone the template model
        const clone = JSON.parse(JSON.stringify(tpl)) as makerjs.IModel
        // Apply rotation (convert radians to degrees) and translation
        const deg = (t.rotation || 0) * (180 / Math.PI)
        try {
          makerjs.model.rotate(clone, deg)
        } catch {}
        try {
          makerjs.model.moveRelative(clone, [t.x || 0, t.y || 0])
        } catch {}
        combined.models![instName] = clone
      })

      model = combined
      break
    }

    case 'sketch_arc': {
      const r = getNumericValueInput(0, resolveExpr(d.radius, paramValues, 1))
      const startA = getNumericValueInput(1, resolveExpr(d.startAngle, paramValues, 0))
      const endA = getNumericValueInput(2, resolveExpr(d.endAngle, paramValues, 180))
      model = { paths: { arc: new makerjs.paths.Arc([0, 0], r, startA, endA) } }
      break
    }

    case 'sketch_ellipse': {
      const rx = getNumericValueInput(0, resolveExpr(d.rx, paramValues, 1))
      const ry = getNumericValueInput(1, resolveExpr(d.ry, paramValues, 1))
      model = new makerjs.models.Ellipse(rx, ry)
      break
    }

    // ── Booleans ──────────────────────────────────────────────────────────
    case 'sketch_union': {
      const a = getChildModel(0)
      const b = getChildModel(1)
      if (a && b) {
        model = makerjs.model.combineUnion(a, b)
      } else {
        model = a ?? b
      }
      break
    }

    case 'sketch_difference': {
      const a = getChildModel(0)
      const b = getChildModel(1)
      if (a && b) {
        model = makerjs.model.combineSubtraction(a, b)
      } else {
        model = a ?? b
      }
      break
    }

    case 'sketch_intersect': {
      const a = getChildModel(0)
      const b = getChildModel(1)
      if (a && b) {
        model = makerjs.model.combineIntersection(a, b)
      } else {
        model = a ?? b
      }
      break
    }

    // ── Transforms ────────────────────────────────────────────────────────
    case 'sketch_translate': {
      const child = getChildModel(0)
      if (child) {
        const tx = getNumericValueInput(1, resolveExpr(d.x, paramValues, 0))
        const ty = getNumericValueInput(2, resolveExpr(d.y, paramValues, 0))
        makerjs.model.moveRelative(child, [tx, ty])
        model = child
      }
      break
    }

    case 'sketch_rotate': {
      const child = getChildModel(0)
      if (child) {
        const angle = getNumericValueInput(1, resolveExpr(d.angle, paramValues, 0))
        makerjs.model.rotate(child, angle)
        model = child
      }
      break
    }

    case 'sketch_scale': {
      const child = getChildModel(0)
      if (child) {
        const sx = getNumericValueInput(1, resolveExpr(d.x, paramValues, 1))
        const sy = getNumericValueInput(2, resolveExpr(d.y, paramValues, 1))
        model = makerjs.model.distort(child, sx, sy)
      }
      break
    }

    case 'sketch_mirror': {
      const child = getChildModel(0)
      if (child) {
        const angle = getNumericValueInput(1, resolveExpr(d.axisAngle, paramValues, 0))
        makerjs.model.mirror(child, angle === 0 || angle === 180, angle === 90 || angle === 270)
        model = child
      }
      break
    }

    // ── Modifiers ─────────────────────────────────────────────────────────
    case 'sketch_offset': {
      const child = getChildModel(0)
      if (child) {
        const dist = getNumericValueInput(1, resolveExpr(d.distance, paramValues, 1))
        const expanded = makerjs.model.outline(child, dist)
        model = expanded
      }
      break
    }

    case 'sketch_expression':
      model = null
      break
  }

  visiting.delete(nodeId)
  return model

}

// ─── Name helpers ──────────────────────────────────────────────────────────────

function resolveVarName(node: Node, usedNames: Set<string>): string {
  const d = node.data as Record<string, unknown>
  const customName = d.nodeName as string | undefined
  let base: string
  if (customName && customName.trim()) {
    base = sanitizeIdentifier(customName)
  } else {
    base = `shape_${node.id.replace(/[^a-zA-Z0-9]/g, '_')}`
  }
  // Ensure uniqueness
  let name = base
  let counter = 2
  while (usedNames.has(name)) {
    name = `${base}_${counter++}`
  }
  usedNames.add(name)
  return name
}

// ─── Code generation (Maker.js JavaScript) ────────────────────────────────────

function emitCode(
  nodeId: string,
  nodesMap: Map<string, Node>,
  childrenOf: Map<string, ChildRef[]>,
  visiting: Set<string>,
  visited: Set<string>,
  indent: number,
  varNameMap: Map<string, string>,
  usedNames: Set<string>,
  paramValues: Record<string, string>,
): string {
  if (visiting.has(nodeId) || visited.has(nodeId)) return ''
  visiting.add(nodeId)
  visited.add(nodeId)

  const node = nodesMap.get(nodeId)
  if (!node) { visiting.delete(nodeId); return '' }

  const d = node.data as Record<string, unknown>
  const children = childrenOf.get(nodeId) ?? []
  const pad = '  '.repeat(indent)
  const varName = resolveVarName(node, usedNames)
  varNameMap.set(nodeId, varName)

  function getChildCode(index: number): { code: string; varName: string } | null {
    const child = children.find((c) => c.handleIndex === index)
    if (!child) return null
    const code = emitCode(child.nodeId, nodesMap, childrenOf, visiting, visited, indent, varNameMap, usedNames, paramValues)
    const childVar = varNameMap.get(child.nodeId) ?? `shape_${child.nodeId.replace(/[^a-zA-Z0-9]/g, '_')}`
    return { code, varName: childVar }
  }

  function resolveValueInput(index: number, fallback: string): string {
    const child = children.find((c) => c.handleIndex === index)
    if (!child) return fallback
    const valueNode = nodesMap.get(child.nodeId)
    if (!valueNode) return fallback
    if (valueNode.type === 'sketch_expression' || valueNode.type === 'expression_node') {
      return expressionFromNodeData(valueNode.data as Record<string, unknown>)
    }
    return fallback
  }

  let result = ''

  switch (node.type) {
    case 'sketch_rectangle': {
      const w = resolveValueInput(0, String(Number(d.width) || 1))
      const h = resolveValueInput(1, String(Number(d.height) || 1))
      const cr = resolveValueInput(2, String(Number(d.cornerRadius) || 0))
      const center = d.center !== false
      if ((Number(d.cornerRadius) || 0) > 0) {
        result = `${pad}var ${varName} = makerjs.model.center(\n${pad}  new makerjs.models.RoundRectangle(${w}, ${h}, ${cr}),\n${pad}  ${center}\n${pad});\n`
      } else {
        result = `${pad}var ${varName} = makerjs.model.center(\n${pad}  new makerjs.models.Rectangle(${w}, ${h}),\n${pad}  ${center}\n${pad});\n`
      }
      break
    }

    case 'sketch_circle': {
      const rExpr = resolveValueInput(0, String(Number(d.radius) || 1))
      const segsExpr = resolveValueInput(1, String(Number(d.segments) || 0))
      const segs = Number(d.segments) || 0
      if (segs > 2 && segsExpr === String(segs)) {
        result = `${pad}var ${varName} = new makerjs.models.Polygon(${segs}, ${rExpr});\n`
      } else {
        result = `${pad}var ${varName} = { paths: { circle: new makerjs.paths.Circle([0, 0], ${rExpr}) } };\n`
      }
      break
    }

    case 'sketch_ngon': {
      const sidesExpr = resolveValueInput(0, String(Math.max(3, Math.round(Number(d.sides) || 6))) )
      const radiusExpr = resolveValueInput(1, String(Number(d.radius) || 1))
      const sides = Math.max(3, Math.round(Number(d.sides) || 6))
      const radius = Number(d.radius) || 1
      const inscribed = d.inscribed !== false
      if (inscribed) {
        result = `${pad}var ${varName} = new makerjs.models.Polygon(${sidesExpr}, ${radiusExpr});\n`
      } else {
        const circumR = (radius / Math.cos(Math.PI / sides)).toFixed(4)
        result = `${pad}var ${varName} = new makerjs.models.Polygon(${sides}, ${circumR}); // circumscribed\n`
      }
      break
    }

    case 'sketch_line': {
      const pts = String(d.points)
      const closed = d.closed === true
      result = `${pad}var ${varName} = new makerjs.models.ConnectTheDots(${closed}, ${pts});\n`
      break
    }

    case 'sketch_arc': {
      const r = resolveValueInput(0, String(Number(d.radius) || 1))
      const sa = resolveValueInput(1, String(Number(d.startAngle) || 0))
      const ea = resolveValueInput(2, String(Number(d.endAngle) || 180))
      result = `${pad}var ${varName} = { paths: { arc: new makerjs.paths.Arc([0, 0], ${r}, ${sa}, ${ea}) } };\n`
      break
    }

    case 'sketch_ellipse': {
      const rx = resolveValueInput(0, String(Number(d.rx) || 1))
      const ry = resolveValueInput(1, String(Number(d.ry) || 1))
      result = `${pad}var ${varName} = new makerjs.models.Ellipse(${rx}, ${ry});\n`
      break
    }

    case 'sketch_union': {
      const a = getChildCode(0)
      const b = getChildCode(1)
      result = (a?.code ?? '') + (b?.code ?? '')
      if (a && b) {
        result += `${pad}var ${varName} = makerjs.model.combineUnion(${a.varName}, ${b.varName});\n`
      } else {
        result += `${pad}var ${varName} = ${a?.varName ?? b?.varName ?? '{}'};\n`
      }
      break
    }

    case 'sketch_difference': {
      const a = getChildCode(0)
      const b = getChildCode(1)
      result = (a?.code ?? '') + (b?.code ?? '')
      if (a && b) {
        result += `${pad}var ${varName} = makerjs.model.combineSubtraction(${a.varName}, ${b.varName});\n`
      } else {
        result += `${pad}var ${varName} = ${a?.varName ?? b?.varName ?? '{}'};\n`
      }
      break
    }

    case 'sketch_intersect': {
      const a = getChildCode(0)
      const b = getChildCode(1)
      result = (a?.code ?? '') + (b?.code ?? '')
      if (a && b) {
        result += `${pad}var ${varName} = makerjs.model.combineIntersection(${a.varName}, ${b.varName});\n`
      } else {
        result += `${pad}var ${varName} = ${a?.varName ?? b?.varName ?? '{}'};\n`
      }
      break
    }

    case 'sketch_translate': {
      const child = getChildCode(0)
      const tx = resolveValueInput(1, String(Number(d.x) || 0))
      const ty = resolveValueInput(2, String(Number(d.y) || 0))
      result = child?.code ?? ''
      result += `${pad}makerjs.model.moveRelative(${child?.varName ?? '{}'}, [${tx}, ${ty}]);\n`
      result += `${pad}var ${varName} = ${child?.varName ?? '{}'};\n`
      break
    }

    case 'sketch_rotate': {
      const child = getChildCode(0)
      const angle = resolveValueInput(1, String(Number(d.angle) || 0))
      result = child?.code ?? ''
      result += `${pad}makerjs.model.rotate(${child?.varName ?? '{}'}, ${angle});\n`
      result += `${pad}var ${varName} = ${child?.varName ?? '{}'};\n`
      break
    }

    case 'sketch_scale': {
      const child = getChildCode(0)
      const sx = resolveValueInput(1, String(Number(d.x) || 1))
      const sy = resolveValueInput(2, String(Number(d.y) || 1))
      result = child?.code ?? ''
      result += `${pad}var ${varName} = makerjs.model.distort(${child?.varName ?? '{}'}, ${sx}, ${sy});\n`
      break
    }

    case 'sketch_mirror': {
      const child = getChildCode(0)
      const angle = resolveValueInput(1, String(Number(d.axisAngle) || 0))
      result = child?.code ?? ''
      result += `${pad}makerjs.model.mirror(${child?.varName ?? '{}'}, (${angle}) === 0 || (${angle}) === 180, (${angle}) === 90 || (${angle}) === 270);\n`
      result += `${pad}var ${varName} = ${child?.varName ?? '{}'};\n`
      break
    }

    case 'sketch_offset': {
      const child = getChildCode(0)
      const dist = resolveValueInput(1, String(Number(d.distance) || 1))
      result = child?.code ?? ''
      result += `${pad}var ${varName} = makerjs.model.outline(${child?.varName ?? '{}'}, ${dist});\n`
      break
    }

    case 'sketch_expression': {
      // Value-only helper node; consumed through value-port connections.
      result = ''
      break
    }

    case 'sketch_path': {
      // Emit ConnectTheDots from anchors JSON
      const anchorsJson = String(d.anchorsJson || '[]')
      result = `${pad}var ${varName} = new makerjs.models.ConnectTheDots(${d.closed === true}, ${anchorsJson});\n`
      break
    }

    case 'sketch_path_layout': {
      // Layout node: for now, pass through the template child's model.
      const tpl = getChildCode(0)
      result = tpl?.code ?? ''
      result += `${pad}var ${varName} = ${tpl?.varName ?? '{}'};\n`
      break
    }

    default:
      result = `${pad}// Unknown sketch node type: ${node.type}\n`
  }

  visiting.delete(nodeId)
  return result
}

// ─── Public: generate code string ─────────────────────────────────────────────

export function generateSketchCode(nodes: Node[], edges: Edge[], globalParameters: GlobalParameter[] = []): string {
  // Filter out group nodes (visual-only, no codegen impact)
  const codeNodes = nodes.filter((n) => n.type !== 'group_node')
  if (codeNodes.length === 0) return '// Add sketch nodes to the canvas…'

  const nodesMap = new Map(codeNodes.map((n) => [n.id, n]))
  const childrenOf = buildAdjacency(edges)
  const roots = findRoots(codeNodes, edges)

  if (roots.length === 0) return '// No root nodes found (cycles?)'

  let code = '// Generated Maker.js code\nvar makerjs = require("makerjs");\n\n'
  const paramValues = paramMapFromList(globalParameters)

  if (globalParameters.length > 0) {
    code += '// Shared global parameters\n'
    for (const p of globalParameters) {
      const name = sanitizeIdentifier(p.name)
      code += `var ${name} = ${normalizeParamValue(p)};\n`
    }
    code += '\n'
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()
  const varNameMap = new Map<string, string>()
  const usedNames = new Set<string>()

  for (const rootId of roots) {
    code += emitCode(rootId, nodesMap, childrenOf, visiting, visited, 0, varNameMap, usedNames, paramValues)
  }

  // The last root's variable is the final model
  const lastRoot = roots[roots.length - 1]
  const lastVar = varNameMap.get(lastRoot) ?? `shape_${lastRoot.replace(/[^a-zA-Z0-9]/g, '_')}`
  code += `\n// Export the final model\nmodule.exports = ${lastVar};\n`

  return code
}

// ─── Public: build Maker.js IModel for preview ───────────────────────────────

export function buildSketchModel(nodes: Node[], edges: Edge[], globalParameters: GlobalParameter[] = []): makerjs.IModel | null {
  const codeNodes = nodes.filter((n) => n.type !== 'group_node')
  if (codeNodes.length === 0) return null

  const nodesMap = new Map(codeNodes.map((n) => [n.id, n]))
  const childrenOf = buildAdjacency(edges)
  const roots = findRoots(codeNodes, edges)

  if (roots.length === 0) return null

  const visiting = new Set<string>()
  const visited = new Set<string>()
  const paramValues = paramMapFromList(globalParameters)

  // Build all root models and combine them
  const models: makerjs.IModel[] = []
  for (const rootId of roots) {
    const m = buildModel(rootId, nodesMap, childrenOf, visiting, visited, paramValues)
    if (m) models.push(m)
  }

  if (models.length === 0) return null
  if (models.length === 1) return models[0]

  // Combine all roots into a single model
  const combined: makerjs.IModel = { models: {} }
  models.forEach((m, i) => {
    combined.models![`root_${i}`] = m
  })
  return combined
}

// ─── Public: generate SVG string from model ───────────────────────────────────

export function generateSketchSvg(model: makerjs.IModel): string {
  const svg = makerjs.exporter.toSVG(model, {
    stroke: '#f472b6',
    strokeWidth: '1.5px',
    fill: 'none',
    fontSize: '10px',
    useSvgPathOnly: true,
  })
  // Add non-scaling strokes so lines stay crisp regardless of zoom level
  return svg.replace(/<path /g, '<path vector-effect="non-scaling-stroke" ')
}
