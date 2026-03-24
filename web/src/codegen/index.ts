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

  // Sort children by handle index so child order is deterministic
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
    // Already emitted; use a comment reference
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
    if (!child) return pad + '  // WARNING: missing child\n'
    return emitNode(child.nodeId, nodesMap, childrenOf, visiting, visited, indent + 2)
  }

  function getAllChildren(): string {
    return children.map((c) =>
      emitNode(c.nodeId, nodesMap, childrenOf, visiting, visited, indent + 2)
    ).join('')
  }

  let result: string

  switch (node.type) {
    // ── 3D Primitives ─────────────────────────────────────────────────────────
    case 'sphere':
      result = `${pad}sphere(r=${d.r}, $fn=${d.fn});\n`
      break

    case 'cube':
      result = `${pad}cube([${d.x}, ${d.y}, ${d.z}], center=${d.center});\n`
      break

    case 'cylinder':
      result = `${pad}cylinder(h=${d.h}, r1=${d.r1}, r2=${d.r2}, center=${d.center}, $fn=${d.fn});\n`
      break

    case 'polyhedron': {
      result = `${pad}polyhedron(points=${d.points}, faces=${d.faces});\n`
      break
    }

    // ── 2D Primitives ─────────────────────────────────────────────────────────
    case 'circle':
      result = `${pad}circle(r=${d.r}, $fn=${d.fn});\n`
      break

    case 'square':
      result = `${pad}square([${d.x}, ${d.y}], center=${d.center});\n`
      break

    case 'polygon':
      result = `${pad}polygon(points=${d.points});\n`
      break

    case 'scadtext':
      result = `${pad}text(${JSON.stringify(d.text)}, size=${d.size}, font=${JSON.stringify(d.font)}, halign=${JSON.stringify(d.halign)}, valign=${JSON.stringify(d.valign)});\n`
      break

    // ── Transforms ────────────────────────────────────────────────────────────
    case 'translate':
      result = `${pad}translate([${d.x}, ${d.y}, ${d.z}])\n${getChild(0)}`
      break

    case 'rotate':
      result = `${pad}rotate([${d.x}, ${d.y}, ${d.z}])\n${getChild(0)}`
      break

    case 'scale':
      result = `${pad}scale([${d.x}, ${d.y}, ${d.z}])\n${getChild(0)}`
      break

    case 'mirror':
      result = `${pad}mirror([${d.x}, ${d.y}, ${d.z}])\n${getChild(0)}`
      break

    case 'resize':
      result = `${pad}resize([${d.x}, ${d.y}, ${d.z}], auto=${d.auto})\n${getChild(0)}`
      break

    case 'multmatrix':
      result = `${pad}multmatrix(${d.matrix})\n${getChild(0)}`
      break

    case 'offset':
      if (d.useR) {
        result = `${pad}offset(r=${d.r})\n${getChild(0)}`
      } else {
        result = `${pad}offset(delta=${d.delta}, chamfer=${d.chamfer})\n${getChild(0)}`
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
      const fnPart = d.fn ? `, $fn=${d.fn}` : ''
      result = `${pad}linear_extrude(height=${d.height}, center=${d.center}, twist=${d.twist}, slices=${d.slices}, scale=${d.scale}${fnPart})\n${getChild(0)}`
      break
    }

    case 'rotate_extrude':
      result = `${pad}rotate_extrude(angle=${d.angle}, $fn=${d.fn})\n${getChild(0)}`
      break

    // ── Modifiers ─────────────────────────────────────────────────────────────
    case 'hull':
      result = `${pad}hull() {\n${getAllChildren()}${pad}}\n`
      break

    case 'minkowski':
      result = `${pad}minkowski() {\n${getAllChildren()}${pad}}\n`
      break

    case 'color':
      result = `${pad}color([${d.r}, ${d.g}, ${d.b}], ${d.alpha})\n${getChild(0)}`
      break

    case 'projection':
      result = `${pad}projection(cut=${d.cut})\n${getChild(0)}`
      break

    // ── MakerBeam ─────────────────────────────────────────────────────────────
    case 'makerbeam':
      result = `${pad}makerbeam(${d.length});\n`
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
    // All nodes connected in a loop — shouldn't happen but handle gracefully
    code += '// WARNING: No root nodes found (possible cycle in entire graph)\n'
    // Emit each node anyway
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
