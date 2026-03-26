import type { Node, Edge } from '@xyflow/react'
import makerjs from 'makerjs'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChildRef { nodeId: string; handleIndex: number }

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
    return buildModel(child.nodeId, nodesMap, childrenOf, visiting, visited)
  }

  let model: makerjs.IModel | null = null

  switch (node.type) {
    // ── Primitives ────────────────────────────────────────────────────────
    case 'sketch_rectangle': {
      const w = Number(d.width) || 1
      const h = Number(d.height) || 1
      const cr = Number(d.cornerRadius) || 0
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
      const r = Number(d.radius) || 1
      const segs = Number(d.segments) || 0
      if (segs > 2) {
        model = new makerjs.models.Polygon(segs, r)
      } else {
        model = { paths: { circle: new makerjs.paths.Circle([0, 0], r) } }
      }
      break
    }

    case 'sketch_ngon': {
      const sides = Math.max(3, Math.round(Number(d.sides) || 6))
      const radius = Number(d.radius) || 1
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

    case 'sketch_arc': {
      const r = Number(d.radius) || 1
      const startA = Number(d.startAngle) || 0
      const endA = Number(d.endAngle) || 180
      model = { paths: { arc: new makerjs.paths.Arc([0, 0], r, startA, endA) } }
      break
    }

    case 'sketch_ellipse': {
      const rx = Number(d.rx) || 1
      const ry = Number(d.ry) || 1
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
        makerjs.model.moveRelative(child, [Number(d.x) || 0, Number(d.y) || 0])
        model = child
      }
      break
    }

    case 'sketch_rotate': {
      const child = getChildModel(0)
      if (child) {
        makerjs.model.rotate(child, Number(d.angle) || 0)
        model = child
      }
      break
    }

    case 'sketch_scale': {
      const child = getChildModel(0)
      if (child) {
        makerjs.model.scale(child, Number(d.x) || 1)
        model = child
      }
      break
    }

    case 'sketch_mirror': {
      const child = getChildModel(0)
      if (child) {
        const angle = Number(d.axisAngle) || 0
        makerjs.model.mirror(child, angle === 0 || angle === 180, angle === 90 || angle === 270)
        model = child
      }
      break
    }

    // ── Modifiers ─────────────────────────────────────────────────────────
    case 'sketch_offset': {
      const child = getChildModel(0)
      if (child) {
        const dist = Number(d.distance) || 1
        const expanded = makerjs.model.outline(child, dist)
        model = expanded
      }
      break
    }
  }

  visiting.delete(nodeId)
  return model
}

// ─── Code generation (Maker.js JavaScript) ────────────────────────────────────

function emitCode(
  nodeId: string,
  nodesMap: Map<string, Node>,
  childrenOf: Map<string, ChildRef[]>,
  visiting: Set<string>,
  visited: Set<string>,
  indent: number
): string {
  if (visiting.has(nodeId) || visited.has(nodeId)) return ''
  visiting.add(nodeId)
  visited.add(nodeId)

  const node = nodesMap.get(nodeId)
  if (!node) { visiting.delete(nodeId); return '' }

  const d = node.data as Record<string, unknown>
  const children = childrenOf.get(nodeId) ?? []
  const pad = '  '.repeat(indent)
  const varName = `shape_${nodeId.replace(/[^a-zA-Z0-9]/g, '_')}`

  function getChildCode(index: number): { code: string; varName: string } | null {
    const child = children.find((c) => c.handleIndex === index)
    if (!child) return null
    const childVar = `shape_${child.nodeId.replace(/[^a-zA-Z0-9]/g, '_')}`
    const code = emitCode(child.nodeId, nodesMap, childrenOf, visiting, visited, indent)
    return { code, varName: childVar }
  }

  let result = ''

  switch (node.type) {
    case 'sketch_rectangle': {
      const w = Number(d.width) || 1
      const h = Number(d.height) || 1
      const cr = Number(d.cornerRadius) || 0
      const center = d.center !== false
      if (cr > 0) {
        result = `${pad}var ${varName} = makerjs.model.center(\n${pad}  new makerjs.models.RoundRectangle(${w}, ${h}, ${cr}),\n${pad}  ${center}\n${pad});\n`
      } else {
        result = `${pad}var ${varName} = makerjs.model.center(\n${pad}  new makerjs.models.Rectangle(${w}, ${h}),\n${pad}  ${center}\n${pad});\n`
      }
      break
    }

    case 'sketch_circle': {
      const r = Number(d.radius) || 1
      const segs = Number(d.segments) || 0
      if (segs > 2) {
        result = `${pad}var ${varName} = new makerjs.models.Polygon(${segs}, ${r});\n`
      } else {
        result = `${pad}var ${varName} = { paths: { circle: new makerjs.paths.Circle([0, 0], ${r}) } };\n`
      }
      break
    }

    case 'sketch_ngon': {
      const sides = Math.max(3, Math.round(Number(d.sides) || 6))
      const radius = Number(d.radius) || 1
      const inscribed = d.inscribed !== false
      if (inscribed) {
        result = `${pad}var ${varName} = new makerjs.models.Polygon(${sides}, ${radius});\n`
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
      const r = Number(d.radius) || 1
      const sa = Number(d.startAngle) || 0
      const ea = Number(d.endAngle) || 180
      result = `${pad}var ${varName} = { paths: { arc: new makerjs.paths.Arc([0, 0], ${r}, ${sa}, ${ea}) } };\n`
      break
    }

    case 'sketch_ellipse': {
      const rx = Number(d.rx) || 1
      const ry = Number(d.ry) || 1
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
      result = child?.code ?? ''
      result += `${pad}makerjs.model.moveRelative(${child?.varName ?? '{}'}, [${Number(d.x) || 0}, ${Number(d.y) || 0}]);\n`
      result += `${pad}var ${varName} = ${child?.varName ?? '{}'};\n`
      break
    }

    case 'sketch_rotate': {
      const child = getChildCode(0)
      result = child?.code ?? ''
      result += `${pad}makerjs.model.rotate(${child?.varName ?? '{}'}, ${Number(d.angle) || 0});\n`
      result += `${pad}var ${varName} = ${child?.varName ?? '{}'};\n`
      break
    }

    case 'sketch_scale': {
      const child = getChildCode(0)
      result = child?.code ?? ''
      result += `${pad}makerjs.model.scale(${child?.varName ?? '{}'}, ${Number(d.x) || 1});\n`
      result += `${pad}var ${varName} = ${child?.varName ?? '{}'};\n`
      break
    }

    case 'sketch_mirror': {
      const child = getChildCode(0)
      const angle = Number(d.axisAngle) || 0
      result = child?.code ?? ''
      result += `${pad}makerjs.model.mirror(${child?.varName ?? '{}'}, ${angle === 0 || angle === 180}, ${angle === 90 || angle === 270});\n`
      result += `${pad}var ${varName} = ${child?.varName ?? '{}'};\n`
      break
    }

    case 'sketch_offset': {
      const child = getChildCode(0)
      result = child?.code ?? ''
      result += `${pad}var ${varName} = makerjs.model.outline(${child?.varName ?? '{}'}, ${Number(d.distance) || 1});\n`
      break
    }

    default:
      result = `${pad}// Unknown sketch node type: ${node.type}\n`
  }

  visiting.delete(nodeId)
  return result
}

// ─── Public: generate code string ─────────────────────────────────────────────

export function generateSketchCode(nodes: Node[], edges: Edge[]): string {
  if (nodes.length === 0) return '// Add sketch nodes to the canvas…'

  const nodesMap = new Map(nodes.map((n) => [n.id, n]))
  const childrenOf = buildAdjacency(edges)
  const roots = findRoots(nodes, edges)

  if (roots.length === 0) return '// No root nodes found (cycles?)'

  let code = '// Generated Maker.js code\nvar makerjs = require("makerjs");\n\n'

  const visiting = new Set<string>()
  const visited = new Set<string>()

  for (const rootId of roots) {
    code += emitCode(rootId, nodesMap, childrenOf, visiting, visited, 0)
  }

  // The last root's variable is the final model
  const lastRoot = roots[roots.length - 1]
  const lastVar = `shape_${lastRoot.replace(/[^a-zA-Z0-9]/g, '_')}`
  code += `\n// Export the final model\nmodule.exports = ${lastVar};\n`

  return code
}

// ─── Public: build Maker.js IModel for preview ───────────────────────────────

export function buildSketchModel(nodes: Node[], edges: Edge[]): makerjs.IModel | null {
  if (nodes.length === 0) return null

  const nodesMap = new Map(nodes.map((n) => [n.id, n]))
  const childrenOf = buildAdjacency(edges)
  const roots = findRoots(nodes, edges)

  if (roots.length === 0) return null

  const visiting = new Set<string>()
  const visited = new Set<string>()

  // Build all root models and combine them
  const models: makerjs.IModel[] = []
  for (const rootId of roots) {
    const m = buildModel(rootId, nodesMap, childrenOf, visiting, visited)
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
  return makerjs.exporter.toSVG(model, {
    stroke: '#f472b6',
    strokeWidth: '1.5px',
    fill: 'none',
    fontSize: '10px',
    useSvgPathOnly: true,
  })
}
