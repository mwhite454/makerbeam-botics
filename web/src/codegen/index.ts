import type { Node, Edge } from '@xyflow/react'
import { MAKERBEAM_PREAMBLE } from './makerbeamPreamble'

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

// ─── Format helpers ───────────────────────────────────────────────────────────

function bool(v: unknown): string {
  return v ? 'true' : 'false'
}

function num(v: unknown): number {
  return typeof v === 'number' ? v : parseFloat(String(v)) || 0
}

// ─── Recursive code emitter ───────────────────────────────────────────────────

function emitNode(
  nodeId: string,
  nodesMap: Map<string, Node>,
  childrenOf: Map<string, ChildRef[]>,
  visiting: Set<string>,
  visited: Set<string>,
  indent: number
): string {
  if (visiting.has(nodeId)) return indentStr(indent) + '// ERROR: cycle detected\n'
  if (visited.has(nodeId)) {
    return indentStr(indent) + `// (shared ref: ${nodeId})\n`
  }

  visiting.add(nodeId)
  visited.add(nodeId)

  const node = nodesMap.get(nodeId)
  if (!node) {
    visiting.delete(nodeId)
    return indentStr(indent) + '// ERROR: node not found\n'
  }

  const d = node.data as Record<string, unknown>
  const children = childrenOf.get(nodeId) ?? []
  const pad = indentStr(indent)

  function getChild(index: number): string {
    const child = children.find((c) => c.handleIndex === index)
    if (!child) return ''  // no child connected — will be handled by caller
    return emitNode(child.nodeId, nodesMap, childrenOf, visiting, visited, indent + 2)
  }

  function hasChild(index: number): boolean {
    return children.some((c) => c.handleIndex === index)
  }

  function getAllChildren(): string {
    if (children.length === 0) {
      return pad + '  // No children connected\n'
    }
    return children.map((c) =>
      emitNode(c.nodeId, nodesMap, childrenOf, visiting, visited, indent + 2)
    ).join('')
  }

  // For transform nodes: if no child, just emit a comment
  function emitTransform(header: string): string {
    if (!hasChild(0)) {
      return `${pad}// ${node!.type}: no child connected\n`
    }
    return `${pad}${header}\n${getChild(0)}`
  }

  let result: string

  switch (node.type) {
    // ── 3D Primitives ─────────────────────────────────────────────────────────
    case 'sphere':
      result = `${pad}sphere(r = ${num(d.r)}, $fn = ${num(d.fn)});\n`
      break

    case 'cube':
      result = `${pad}cube([${num(d.x)}, ${num(d.y)}, ${num(d.z)}], center = ${bool(d.center)});\n`
      break

    case 'cylinder':
      result = `${pad}cylinder(h = ${num(d.h)}, r1 = ${num(d.r1)}, r2 = ${num(d.r2)}, center = ${bool(d.center)}, $fn = ${num(d.fn)});\n`
      break

    case 'polyhedron':
      result = `${pad}polyhedron(points = ${d.points}, faces = ${d.faces});\n`
      break

    // ── 2D Primitives ─────────────────────────────────────────────────────────
    case 'circle':
      result = `${pad}circle(r = ${num(d.r)}, $fn = ${num(d.fn)});\n`
      break

    case 'square':
      result = `${pad}square([${num(d.x)}, ${num(d.y)}], center = ${bool(d.center)});\n`
      break

    case 'polygon':
      result = `${pad}polygon(points = ${d.points});\n`
      break

    case 'scadtext':
      result = `${pad}text("${d.text}", size = ${num(d.size)}, font = "${d.font}", halign = "${d.halign}", valign = "${d.valign}");\n`
      break

    // ── Transforms ────────────────────────────────────────────────────────────
    case 'translate':
      result = emitTransform(`translate([${num(d.x)}, ${num(d.y)}, ${num(d.z)}])`)
      break

    case 'rotate':
      result = emitTransform(`rotate([${num(d.x)}, ${num(d.y)}, ${num(d.z)}])`)
      break

    case 'scale':
      result = emitTransform(`scale([${num(d.x)}, ${num(d.y)}, ${num(d.z)}])`)
      break

    case 'mirror':
      result = emitTransform(`mirror([${num(d.x)}, ${num(d.y)}, ${num(d.z)}])`)
      break

    case 'resize':
      result = emitTransform(`resize([${num(d.x)}, ${num(d.y)}, ${num(d.z)}], auto = ${bool(d.auto)})`)
      break

    case 'multmatrix':
      result = emitTransform(`multmatrix(${d.matrix})`)
      break

    case 'offset':
      if (d.useR) {
        result = emitTransform(`offset(r = ${num(d.r)})`)
      } else {
        result = emitTransform(`offset(delta = ${num(d.delta)}, chamfer = ${bool(d.chamfer)})`)
      }
      break

    // ── Booleans ──────────────────────────────────────────────────────────────
    case 'union':
      result = `${pad}union() {\n${getAllChildren()}${pad}}\n`
      break

    case 'difference':
      result = `${pad}difference() {\n${getAllChildren()}${pad}}\n`
      break

    case 'intersection':
      result = `${pad}intersection() {\n${getAllChildren()}${pad}}\n`
      break

    // ── Extrusions ────────────────────────────────────────────────────────────
    case 'linear_extrude': {
      const parts = [`height = ${num(d.height)}`, `center = ${bool(d.center)}`]
      if (num(d.twist) !== 0) parts.push(`twist = ${num(d.twist)}`)
      if (num(d.slices) > 0) parts.push(`slices = ${num(d.slices)}`)
      if (num(d.scale) !== 1) parts.push(`scale = ${num(d.scale)}`)
      if (num(d.fn) > 0) parts.push(`$fn = ${num(d.fn)}`)
      result = emitTransform(`linear_extrude(${parts.join(', ')})`)
      break
    }

    case 'rotate_extrude': {
      const parts = [`angle = ${num(d.angle)}`]
      if (num(d.fn) > 0) parts.push(`$fn = ${num(d.fn)}`)
      result = emitTransform(`rotate_extrude(${parts.join(', ')})`)
      break
    }

    // ── Modifiers ─────────────────────────────────────────────────────────────
    case 'hull':
      result = `${pad}hull() {\n${getAllChildren()}${pad}}\n`
      break

    case 'minkowski':
      result = `${pad}minkowski() {\n${getAllChildren()}${pad}}\n`
      break

    case 'color':
      result = emitTransform(`color([${num(d.r)}, ${num(d.g)}, ${num(d.b)}], ${num(d.alpha)})`)
      break

    case 'projection':
      result = emitTransform(`projection(cut = ${bool(d.cut)})`)
      break

    // ── Control / Math / Import ───────────────────────────────────────────────
    case 'for_loop': {
      const varName = d.varName || 'i'
      const start = num(d.start)
      const end   = num(d.end)
      const step  = num(d.step) || 1
      if (!hasChild(0)) {
        result = `${pad}// for loop: no child connected\n`
      } else {
        result = `${pad}for (${varName} = [${start} : ${step} : ${end}])\n${getChild(0)}`
      }
      break
    }

    case 'if_cond': {
      const condition = d.condition || 'true'
      if (!hasChild(0)) {
        result = `${pad}// if: no child connected\n`
      } else {
        result = `${pad}if (${condition}) {\n${getChild(0)}${pad}}\n`
      }
      break
    }

    case 'render_node':
      result = emitTransform(`render()`)
      break

    case 'import_stl':
      result = `${pad}import("${d.filename || 'model.stl'}");\n`
      break

    case 'surface_node':
      result = `${pad}surface(file = "${d.filename || 'heightmap.dat'}", center = ${bool(d.center)});\n`
      break

    case 'echo_node':
      result = `${pad}echo("${d.message || ''}");\n`
      break

    case 'var_node': {
      const vName = d.varName || 'x'
      const vValue = d.value ?? 0
      result = `${pad}${vName} = ${vValue};\n`
      break
    }

    // ── MakerBeam ─────────────────────────────────────────────────────────────
    case 'makerbeam':
      result = `${pad}makerbeam(${num(d.length)});\n`
      break

    default:
      result = `${pad}// Unknown node type: ${node.type}\n`
  }

  visiting.delete(nodeId)
  return result
}

function indentStr(n: number): string {
  return ' '.repeat(n)
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateCode(nodes: Node[], edges: Edge[]): string {
  if (nodes.length === 0) return '// Add nodes to the canvas to generate code\n'

  const nodesMap = new Map(nodes.map((n) => [n.id, n]))
  const childrenOf = buildAdjacency(edges)
  const roots = findRoots(nodes, edges)

  const hasMakerBeam = nodes.some((n) => n.type === 'makerbeam')

  let code = ''
  if (hasMakerBeam) {
    code += MAKERBEAM_PREAMBLE + '\n'
  }

  const visited = new Set<string>()

  if (roots.length === 0) {
    code += '// WARNING: No root nodes found (possible cycle in entire graph)\n'
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        code += emitNode(node.id, nodesMap, childrenOf, new Set(), visited, 0)
      }
    }
  } else {
    for (const rootId of roots) {
      if (!visited.has(rootId)) {
        code += emitNode(rootId, nodesMap, childrenOf, new Set(), visited, 0)
      }
    }
  }

  return code
}

// ─── Module code generation (for tab system) ──────────────────────────────────

export function generateModuleCode(moduleName: string, nodes: Node[], edges: Edge[]): string {
  if (nodes.length === 0) return `module ${moduleName}() {\n  // Empty module\n}\n`

  const innerCode = generateCode(nodes, edges)
  const indented = innerCode
    .split('\n')
    .map((line) => (line.trim() ? '  ' + line : line))
    .join('\n')

  return `module ${moduleName}() {\n${indented}}\n`
}
