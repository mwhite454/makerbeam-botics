import type { Node, Edge } from '@xyflow/react'
import { MAKERBEAM_PREAMBLE } from './makerbeamPreamble'
import type { GlobalParameter } from '@/store/editorStore'

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

function sanitizeIdentifier(raw: unknown, fallback = 'value'): string {
  const src = String(raw ?? '').trim()
  const sanitized = src.replace(/[^a-zA-Z0-9_]/g, '_')
  if (/^[a-zA-Z_]/.test(sanitized)) return sanitized
  return `v_${sanitized || fallback}`
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
  const customName = (d.nodeName as string | undefined)?.trim()
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
    return sanitizeIdentifier(raw)
  }

  function resolveExpressionNode(valueData: Record<string, unknown>): string {
    const parameterName = asIdentifier(valueData.parameterName ?? 'param')
    const exprTemplate = String(valueData.expression ?? '{param}').trim() || '{param}'
    return exprTemplate.replaceAll('{param}', parameterName)
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
      case 'module_arg':
        return asIdentifier(valueData.varName ?? valueData.argName)
      case 'expression_node':
        return resolveExpressionNode(valueData)
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
      const centerExpr = resolveValueInput(3, bool(d.center))
      result = `${pad}cube([${xExpr}, ${yExpr}, ${zExpr}], center = ${centerExpr});\n`
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
    case 'circle': {
      const rExpr = resolveValueInput(0, String(num(d.r)))
      const fnExpr = resolveValueInput(1, String(num(d.fn)))
      result = `${pad}circle(r = ${rExpr}, $fn = ${fnExpr});\n`
      break
    }

    case 'square': {
      const xExpr = resolveValueInput(0, String(num(d.x)))
      const yExpr = resolveValueInput(1, String(num(d.y)))
      const centerExpr = resolveValueInput(2, bool(d.center))
      result = `${pad}square([${xExpr}, ${yExpr}], center = ${centerExpr});\n`
      break
    }

    case 'polygon':
      result = `${pad}polygon(points = ${d.points});\n`
      break

    case 'scadtext': {
      const sizeExpr = resolveValueInput(0, String(num(d.size)))
      result = `${pad}text("${d.text}", size = ${sizeExpr}, font = "${d.font}", halign = "${d.halign}", valign = "${d.valign}");\n`
      break
    }

    // ── Transforms ────────────────────────────────────────────────────────────
    case 'translate': {
      const xExpr = resolveValueInput(1, String(num(d.x)))
      const yExpr = resolveValueInput(2, String(num(d.y)))
      const zExpr = resolveValueInput(3, String(num(d.z)))
      result = emitTransform(`translate([${xExpr}, ${yExpr}, ${zExpr}])`)
      break
    }

    case 'rotate': {
      const xExpr = resolveValueInput(1, String(num(d.x)))
      const yExpr = resolveValueInput(2, String(num(d.y)))
      const zExpr = resolveValueInput(3, String(num(d.z)))
      result = emitTransform(`rotate([${xExpr}, ${yExpr}, ${zExpr}])`)
      break
    }

    case 'scale': {
      const xExpr = resolveValueInput(1, String(num(d.x)))
      const yExpr = resolveValueInput(2, String(num(d.y)))
      const zExpr = resolveValueInput(3, String(num(d.z)))
      result = emitTransform(`scale([${xExpr}, ${yExpr}, ${zExpr}])`)
      break
    }

    case 'mirror': {
      const xExpr = resolveValueInput(1, String(num(d.x)))
      const yExpr = resolveValueInput(2, String(num(d.y)))
      const zExpr = resolveValueInput(3, String(num(d.z)))
      result = emitTransform(`mirror([${xExpr}, ${yExpr}, ${zExpr}])`)
      break
    }

    case 'resize': {
      const xExpr = resolveValueInput(1, String(num(d.x)))
      const yExpr = resolveValueInput(2, String(num(d.y)))
      const zExpr = resolveValueInput(3, String(num(d.z)))
      const autoExpr = resolveValueInput(4, bool(d.auto))
      result = emitTransform(`resize([${xExpr}, ${yExpr}, ${zExpr}], auto = ${autoExpr})`)
      break
    }

    case 'multmatrix': {
      const matrixExpr = resolveValueInput(1, String(d.matrix))
      result = emitTransform(`multmatrix(${matrixExpr})`)
      break
    }

    case 'offset':
      if (d.useR) {
        const rExpr = resolveValueInput(1, String(num(d.r)))
        result = emitTransform(`offset(r = ${rExpr})`)
      } else {
        const deltaExpr = resolveValueInput(2, String(num(d.delta)))
        const chamferExpr = resolveValueInput(3, bool(d.chamfer))
        result = emitTransform(`offset(delta = ${deltaExpr}, chamfer = ${chamferExpr})`)
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
      const heightExpr = resolveValueInput(1, String(num(d.height)))
      const twistExpr = resolveValueInput(2, String(num(d.twist)))
      const slicesExpr = resolveValueInput(3, String(num(d.slices)))
      const scaleExpr = resolveValueInput(4, String(num(d.scale)))
      const fnExpr = resolveValueInput(5, String(num(d.fn)))
      const centerExpr = resolveValueInput(6, bool(d.center))

      const parts = [`height = ${heightExpr}`, `center = ${centerExpr}`]
      if (num(d.twist) !== 0 || twistExpr !== String(num(d.twist))) parts.push(`twist = ${twistExpr}`)
      if (num(d.slices) > 0 || slicesExpr !== String(num(d.slices))) parts.push(`slices = ${slicesExpr}`)
      if (num(d.scale) !== 1 || scaleExpr !== String(num(d.scale))) parts.push(`scale = ${scaleExpr}`)
      if (num(d.fn) > 0 || fnExpr !== String(num(d.fn))) parts.push(`$fn = ${fnExpr}`)
      result = emitTransform(`linear_extrude(${parts.join(', ')})`)
      break
    }

    case 'rotate_extrude': {
      const angleExpr = resolveValueInput(1, String(num(d.angle)))
      const fnExpr = resolveValueInput(2, String(num(d.fn)))
      const parts = [`angle = ${angleExpr}`]
      if (num(d.fn) > 0 || fnExpr !== String(num(d.fn))) parts.push(`$fn = ${fnExpr}`)
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

    case 'projection': {
      const cutExpr = resolveValueInput(1, bool(d.cut))
      result = emitTransform(`projection(cut = ${cutExpr})`)
      break
    }

    // ── Control / Math / Import ───────────────────────────────────────────────
    case 'for_loop': {
      const varName = d.varName || 'i'
      const start = resolveValueInput(1, String(num(d.start)))
      const end   = resolveValueInput(2, String(num(d.end)))
      const step  = resolveValueInput(3, String(num(d.step) || 1))
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
      const start = resolveValueInput(1, String(num(d.start)))
      const end   = resolveValueInput(2, String(num(d.end)))
      const step  = resolveValueInput(3, String(num(d.step) || 1))
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
      const vName = customName ? asIdentifier(customName) : (d.varName || 'x')
      const vValue = d.value ?? '0'
      const vType = (d.dataType as string) || ''
      let formatted: string
      switch (vType) {
        case 'string':
          formatted = `"${escapeString(vValue)}"`
          break
        case 'boolean':
          formatted = vValue === 'true' ? 'true' : 'false'
          break
        default:
          formatted = String(vValue)
          break
      }
      result = `${pad}${vName} = ${formatted};\n`
      break
    }

    case 'parameter_node': {
      const vName = customName ? asIdentifier(customName) : (d.varName || 'param')
      const vValue = d.value ?? 0
      result = `${pad}${vName} = ${vValue};\n`
      break
    }

    case 'parameter_list': {
      const vName = customName ? asIdentifier(customName) : (d.varName || 'list_param')
      const vValue = d.value ?? '[]'
      result = `${pad}${vName} = ${vValue};\n`
      break
    }

    case 'module_arg': {
      // Module args are emitted in the module signature, not as body statements
      result = ''
      break
    }

    case 'module_call': {
      const moduleName = sanitizeIdentifier(d.moduleName || '', 'module')
      const argValues = (d.argValues as Record<string, string> | undefined) ?? {}
      const argTypes = (d.argTypes as Record<string, string> | undefined) ?? {}
      const argOrderRaw = Array.isArray(d.argOrder)
        ? (d.argOrder as unknown[]).map((v) => String(v))
        : []
      const legacyArgs = (d.args || '').toString().trim()
      if (!moduleName) {
        result = `${pad}// module_call: no module selected\n`
        break
      }

      // Build structured args: check connected handles first (start at index 1, 0 is children)
      const argParts: string[] = []
      const argNames = argOrderRaw.length > 0
        ? argOrderRaw
        : Object.keys(argValues)
      for (let ai = 0; ai < argNames.length; ai++) {
        const aName = argNames[ai]
        const normalizedName = sanitizeIdentifier(aName, 'arg')
        const handleIdx = ai + 1 // handle 0 is children
        const connected = resolveValueInput(handleIdx, '')
        if (connected) {
          argParts.push(`${normalizedName} = ${connected}`)
        } else if (argValues[aName] !== undefined && argValues[aName] !== '') {
          const rawValue = argValues[aName]
          const dataType = argTypes[aName] || ''
          let formattedValue = rawValue
          if (dataType === 'string') {
            const isQuoted = /^\s*"[\s\S]*"\s*$/.test(rawValue)
            formattedValue = isQuoted ? rawValue : `"${escapeString(rawValue)}"`
          } else if (dataType === 'boolean') {
            formattedValue = rawValue === 'true' ? 'true' : 'false'
          }
          argParts.push(`${normalizedName} = ${formattedValue}`)
        }
      }

      // Fall back to legacy freeform args string if no structured args
      const argsStr = argParts.length > 0 ? argParts.join(', ') : legacyArgs
      const callHead = `${moduleName}(${argsStr})`
      if (children.length === 0 || (children.length === 1 && children[0].handleIndex > 0 && argNames.length > 0)) {
        // No geometry children connected (handle 0 not used)
        const geomChildren = children.filter(c => c.handleIndex === 0)
        if (geomChildren.length === 0) {
          result = `${pad}${callHead};\n`
        } else {
          result = `${pad}${callHead} {\n`
          for (const gc of geomChildren) {
            result += emitNode(gc.nodeId, nodesMap, childrenOf, visiting, visited, indent + 2)
          }
          result += `${pad}}\n`
        }
      } else {
        const geomChildren = children.filter(c => c.handleIndex === 0)
        if (geomChildren.length === 0) {
          result = `${pad}${callHead};\n`
        } else {
          result = `${pad}${callHead} {\n`
          for (const gc of geomChildren) {
            result += emitNode(gc.nodeId, nodesMap, childrenOf, visiting, visited, indent + 2)
          }
          result += `${pad}}\n`
        }
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

  // Prepend a name comment for named nodes (except var/param which already use the name)
  if (customName && node.type !== 'var_node' && node.type !== 'parameter_node' && node.type !== 'parameter_list') {
    result = `${pad}// ${customName}\n${result}`
  }

  return result
}

function indentStr(n: number): string {
  return ' '.repeat(n)
}

// ─── Global parameter emitter ─────────────────────────────────────────────────

function emitGlobalParameter(p: GlobalParameter): string {
  const name = p.name.replace(/[^a-zA-Z0-9_]/g, '_') || 'param'
  switch (p.dataType) {
    case 'string':
      return `${name} = "${p.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";\n`
    case 'boolean':
      return `${name} = ${p.value === 'true' ? 'true' : 'false'};\n`
    default:
      return `${name} = ${p.value || '0'};\n`
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateCode(nodes: Node[], edges: Edge[], globalParameters?: GlobalParameter[]): string {
  // Filter out group nodes (visual-only, no codegen impact)
  const codeNodes = nodes.filter((n) => n.type !== 'group_node')
  if (codeNodes.length === 0 && (!globalParameters || globalParameters.length === 0)) return '// Add nodes to the canvas to generate code\n'

  const nodesMap = new Map(codeNodes.map((n) => [n.id, n]))
  const childrenOf = buildAdjacency(edges)
  const roots = findRoots(codeNodes, edges)

  const hasMakerBeam = nodes.some((n) => n.type === 'makerbeam')

  let code = ''

  // Emit global parameters first (top-level declarations)
  if (globalParameters && globalParameters.length > 0) {
    for (const param of globalParameters) {
      code += emitGlobalParameter(param)
    }
    code += '\n'
  }

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
  // Extract module_arg nodes for the signature
  const argNodes = nodes.filter((n) => n.type === 'module_arg')
  const argParts = argNodes.map((n) => {
    const d = n.data as Record<string, unknown>
    const name = sanitizeIdentifier(String(d.argName || 'param'), 'arg')
    const defaultVal = String(d.defaultValue ?? '0')
    const dataType = String(d.dataType || 'number')
    let formatted: string
    switch (dataType) {
      case 'string':
        formatted = `"${defaultVal.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
        break
      case 'boolean':
        formatted = defaultVal === 'true' ? 'true' : 'false'
        break
      default:
        formatted = defaultVal
        break
    }
    return `${name} = ${formatted}`
  })
  const safeModuleName = sanitizeIdentifier(moduleName, 'module')
  const signature = `module ${safeModuleName}(${argParts.join(', ')})`

  if (nodes.length === 0) return `${signature} {\n  // Empty module\n}\n`

  // Filter out module_arg nodes from body generation (they go in signature)
  const bodyNodes = nodes.filter((n) => n.type !== 'module_arg')
  if (bodyNodes.length === 0) return `${signature} {\n  // Empty module\n}\n`

  const innerCode = generateCode(bodyNodes, edges)
  const indented = innerCode
    .split('\n')
    .map((line) => (line.trim() ? '  ' + line : line))
    .join('\n')

  return `${signature} {\n${indented}}\n`
}
