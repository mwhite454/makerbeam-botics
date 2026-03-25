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

function escapeString(v: unknown): string {
  return String(v ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')
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

  function getChildRef(index: number): ChildRef | undefined {
    return children.find((c) => c.handleIndex === index)
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

  function asIdentifier(raw: unknown): string {
    const src = String(raw ?? '').trim()
    const sanitized = src.replace(/[^a-zA-Z0-9_]/g, '_')
    return /^[a-zA-Z_]/.test(sanitized) ? sanitized : `v_${sanitized || 'value'}`
  }

  function resolveValueInput(index: number, fallback: string): string {
    const child = getChildRef(index)
    if (!child) return fallback

    const valueNode = nodesMap.get(child.nodeId)
    if (!valueNode) return fallback
    const valueData = valueNode.data as Record<string, unknown>

    switch (valueNode.type) {
      case 'parameter_node':
      case 'parameter_list':
      case 'var_node':
        return asIdentifier(valueData.varName)
      default:
        return fallback
    }
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
    case 'sphere': {
      const radiusExpr = resolveValueInput(0, String(num(d.r)))
      const fnExpr = resolveValueInput(1, String(num(d.fn)))
      result = `${pad}sphere(r = ${radiusExpr}, $fn = ${fnExpr});\n`
      break
    }

    case 'cube': {
      const xExpr = resolveValueInput(0, String(num(d.x)))
      const yExpr = resolveValueInput(1, String(num(d.y)))
      const zExpr = resolveValueInput(2, String(num(d.z)))
      result = `${pad}cube([${xExpr}, ${yExpr}, ${zExpr}], center = ${bool(d.center)});\n`
      break
    }

    case 'cylinder': {
      const hExpr = resolveValueInput(0, String(num(d.h)))
      const r1Expr = resolveValueInput(1, String(num(d.r1)))
      const r2Expr = resolveValueInput(2, String(num(d.r2)))
      const centerExpr = resolveValueInput(3, bool(d.center))
      const fnExpr = resolveValueInput(4, String(num(d.fn)))
      result = `${pad}cylinder(h = ${hExpr}, r1 = ${r1Expr}, r2 = ${r2Expr}, center = ${centerExpr}, $fn = ${fnExpr});\n`
      break
    }

    case 'polyhedron': {
      const pointsExpr = resolveValueInput(0, String(d.points))
      const facesExpr = resolveValueInput(1, String(d.faces))
      result = `${pad}polyhedron(points = ${pointsExpr}, faces = ${facesExpr});\n`
      break
    }

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
    {
      const hex = String(d.hex ?? '').trim()
      const hexFallback = /^#[0-9a-fA-F]{6}$/.test(hex)
        ? `"${hex}"`
        : `[${num(d.r)}, ${num(d.g)}, ${num(d.b)}]`
      const colorExpr = resolveValueInput(1, hexFallback)
      const alphaExpr = resolveValueInput(2, String(num(d.alpha)))
      result = emitTransform(`color(${colorExpr}, ${alphaExpr})`)
      break
    }

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
      const hasThen = hasChild(0)
      const hasElse = hasChild(1)
      if (!hasThen && !hasElse) {
        result = `${pad}// if: no child connected\n`
      } else {
        result = `${pad}if (${condition}) {\n${getChild(0)}${pad}}`
        if (hasElse) {
          result += ` else {\n${getChild(1)}${pad}}`
        }
        result += '\n'
      }
      break
    }

    case 'intersection_for': {
      const varName = d.varName || 'i'
      const start = num(d.start)
      const end   = num(d.end)
      const step  = num(d.step) || 1
      if (!hasChild(0)) {
        result = `${pad}// intersection_for: no child connected\n`
      } else {
        result = `${pad}intersection_for (${varName} = [${start} : ${step} : ${end}])\n${getChild(0)}`
      }
      break
    }

    case 'assert_node': {
      const condition = d.condition || 'true'
      const message = escapeString(d.message)
      if (!hasChild(0)) {
        result = `${pad}assert(${condition}, "${message}");\n`
      } else {
        result = `${pad}assert(${condition}, "${message}") {\n${getChild(0)}${pad}}\n`
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

    case 'parameter_node': {
      const vName = d.varName || 'param'
      const vValue = d.value ?? 0
      result = `${pad}${vName} = ${vValue};\n`
      break
    }

    case 'parameter_list': {
      const vName = d.varName || 'list_param'
      const vValue = d.value ?? '[]'
      result = `${pad}${vName} = ${vValue};\n`
      break
    }

    case 'module_call': {
      const moduleName = (d.moduleName || '').toString().trim()
      const args = (d.args || '').toString().trim()
      if (!moduleName) {
        result = `${pad}// module_call: no module selected\n`
        break
      }

      const callHead = `${moduleName}(${args})`
      if (children.length === 0) {
        result = `${pad}${callHead};\n`
      } else {
        result = `${pad}${callHead} {\n${getAllChildren()}${pad}}\n`
      }
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

  // Emit declarations first so parameter/variable references on value ports are defined.
  for (const node of nodes) {
    if (node.type === 'parameter_node' || node.type === 'parameter_list' || node.type === 'var_node') {
      if (!visited.has(node.id)) {
        code += emitNode(node.id, nodesMap, childrenOf, new Set(), visited, 0)
      }
    }
  }

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
