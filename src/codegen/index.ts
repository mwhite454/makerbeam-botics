import type { Node, Edge } from "@xyflow/react";
import type { GlobalParameter, EditorTab } from "@/store/editorStore";
import { sketchToOpenscad } from "./sketchToOpenscad";
import { NODE_PACKS, PACK_CODEGEN_HANDLERS } from "@/nodepacks";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChildRef {
  nodeId: string;
  handleIndex: number;
  sourceHandleIndex: number;
}

// ─── Helper: build adjacency maps ─────────────────────────────────────────────

function buildAdjacency(edges: Edge[]): Map<string, ChildRef[]> {
  const childrenOf = new Map<string, ChildRef[]>();

  for (const edge of edges) {
    const targetId = edge.target;
    const handleId = edge.targetHandle ?? "in-0";
    const handleIndex = parseInt(handleId.replace("in-", "") || "0", 10);

    const sourceHandleId = edge.sourceHandle ?? "out-0";
    const sourceHandleIndex = parseInt(
      sourceHandleId.replace("out-", "").replace("out", "") || "0",
      10,
    );

    if (!childrenOf.has(targetId)) childrenOf.set(targetId, []);
    childrenOf
      .get(targetId)!
      .push({ nodeId: edge.source, handleIndex, sourceHandleIndex });
  }

  for (const children of childrenOf.values()) {
    children.sort((a, b) => a.handleIndex - b.handleIndex);
  }

  return childrenOf;
}

// ─── Helper: find root nodes ──────────────────────────────────────────────────

function findRoots(nodes: Node[], edges: Edge[]): string[] {
  const hasOutgoingEdge = new Set(edges.map((e) => e.source));
  return nodes.filter((n) => !hasOutgoingEdge.has(n.id)).map((n) => n.id);
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function bool(v: unknown): string {
  return v ? "true" : "false";
}

function num(v: unknown): number {
  return typeof v === "number" ? v : parseFloat(String(v)) || 0;
}

// Returns a string suitable as an OpenSCAD expression fallback.
// Preserves string values (e.g. 'i', 'i*2', 'width/2') instead of
// coercing them to 0 the way num() would.
function expr(v: unknown): string {
  if (typeof v === "number") return String(v);
  const s = String(v ?? "0").trim();
  if (s === "") return "0";
  return s;
}

function escapeString(v: unknown): string {
  return String(v ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function sanitizeIdentifier(raw: unknown, fallback = "value"): string {
  const src = String(raw ?? "").trim();
  const sanitized = src.replace(/[^a-zA-Z0-9_]/g, "_");
  if (/^[a-zA-Z_]/.test(sanitized)) return sanitized;
  return `v_${sanitized || fallback}`;
}

// ─── Recursive code emitter ───────────────────────────────────────────────────

function emitNode(
  nodeId: string,
  nodesMap: Map<string, Node>,
  childrenOf: Map<string, ChildRef[]>,
  visiting: Set<string>,
  visited: Set<string>,
  indent: number,
  tabs?: EditorTab[],
  globalParameters?: GlobalParameter[],
  importedFiles?: Record<string, string>,
  // Optional geometry-string producer that transform leaves (transforms with
  // no wired `in-0` child) should use as their body. Used by the IF node to
  // inject upstream geometry into YES/NO transform-chain branches. Parameter
  // is the desired indent level, so each leaf can re-render at the right
  // depth.
  geometryOverride?: (atIndent: number) => string,
): string {
  if (visiting.has(nodeId))
    return indentStr(indent) + "// ERROR: cycle detected\n";
  if (visited.has(nodeId)) {
    return indentStr(indent) + `// (shared ref: ${nodeId})\n`;
  }

  visiting.add(nodeId);
  visited.add(nodeId);

  const node = nodesMap.get(nodeId);
  if (!node) {
    visiting.delete(nodeId);
    return indentStr(indent) + "// ERROR: node not found\n";
  }

  const d = node.data as Record<string, unknown>;
  const customName = (d.nodeName as string | undefined)?.trim();
  const children = childrenOf.get(nodeId) ?? [];
  const pad = indentStr(indent);

  function getChild(
    index: number,
    override?: (atIndent: number) => string,
  ): string {
    const child = children.find((c) => c.handleIndex === index);
    if (!child) return ""; // no child connected — will be handled by caller
    return emitNode(
      child.nodeId,
      nodesMap,
      childrenOf,
      visiting,
      visited,
      indent + 2,
      tabs,
      globalParameters,
      importedFiles,
      override,
    );
  }

  function getChildRef(index: number): ChildRef | undefined {
    return children.find((c) => c.handleIndex === index);
  }

  function hasChild(index: number): boolean {
    return children.some((c) => c.handleIndex === index);
  }

  function getAllChildren(): string {
    if (children.length === 0) {
      return pad + "  // No children connected\n";
    }
    return children
      .map((c) =>
        emitNode(
          c.nodeId,
          nodesMap,
          childrenOf,
          visiting,
          visited,
          indent + 2,
          tabs,
          globalParameters,
          importedFiles,
        ),
      )
      .join("");
  }

  function asIdentifier(raw: unknown): string {
    return sanitizeIdentifier(raw);
  }

  function resolveExpressionNode(valueData: Record<string, unknown>): string {
    const parameterName = asIdentifier(valueData.parameterName ?? "param");
    const exprTemplate =
      String(valueData.expression ?? "{param}").trim() || "{param}";
    return exprTemplate.replaceAll("{param}", parameterName);
  }

  function resolveValueInput(index: number, fallback: string): string {
    const child = getChildRef(index);
    if (!child) return fallback;

    const valueNode = nodesMap.get(child.nodeId);
    if (!valueNode) return fallback;
    const valueData = valueNode.data as Record<string, unknown>;

    switch (valueNode.type) {
      case "parameter_node":
      case "parameter_list":
      case "var_node":
      case "module_arg":
      case "loop_var":
        return asIdentifier(valueData.varName ?? valueData.argName);
      case "loop_context": {
        // Different outputs of LoopContextNode correspond to different loop params
        switch (child.sourceHandleIndex) {
          case 0:
            return sanitizeIdentifier(valueData.varName || "i"); // current iteration
          case 1:
            return "loop_start";
          case 2:
            return "loop_end";
          case 3:
            return "loop_step";
          default:
            return sanitizeIdentifier(valueData.varName || "i");
        }
      }
      case "expression_node":
        return resolveExpressionNode(valueData);
      case "loop_file":
        // LoopFileNode emits the 'loop_file' module parameter
        return "loop_file";
      default:
        return fallback;
    }
  }

  // For transform nodes: if no child, just emit a comment — unless a
  // geometryOverride was provided (e.g. IF-branch injection), in which case
  // the transform wraps the override geometry. If a child IS connected, we
  // still forward the override so nested transform chains can insert the
  // geometry at the deepest leaf of the chain.
  function emitTransform(header: string): string {
    if (!hasChild(0)) {
      if (geometryOverride != null) {
        const inner = geometryOverride(indent + 2);
        return `${pad}${header} {\n${inner}${pad}}\n`;
      }
      return `${pad}// ${node!.type}: no child connected\n`;
    }
    return `${pad}${header}\n${getChild(0, geometryOverride)}`;
  }

  let result: string;

  switch (node.type) {
    // ── 3D Primitives ─────────────────────────────────────────────────────────
    case "sphere": {
      const radiusExpr = resolveValueInput(0, expr(d.r));
      const fnExpr = resolveValueInput(1, expr(d.fn));
      result = `${pad}sphere(r = ${radiusExpr}, $fn = ${fnExpr});\n`;
      break;
    }

    case "cube": {
      const xExpr = resolveValueInput(0, expr(d.x));
      const yExpr = resolveValueInput(1, expr(d.y));
      const zExpr = resolveValueInput(2, expr(d.z));
      const centerExpr = resolveValueInput(3, bool(d.center));
      result = `${pad}cube([${xExpr}, ${yExpr}, ${zExpr}], center = ${centerExpr});\n`;
      break;
    }

    case "cylinder": {
      const hExpr = resolveValueInput(0, expr(d.h));
      const r1Expr = resolveValueInput(1, expr(d.r1));
      const r2Expr = resolveValueInput(2, expr(d.r2));
      const centerExpr = resolveValueInput(3, bool(d.center));
      const fnExpr = resolveValueInput(4, expr(d.fn));
      result = `${pad}cylinder(h = ${hExpr}, r1 = ${r1Expr}, r2 = ${r2Expr}, center = ${centerExpr}, $fn = ${fnExpr});\n`;
      break;
    }

    case "polyhedron": {
      const pointsExpr = resolveValueInput(0, String(d.points));
      const facesExpr = resolveValueInput(1, String(d.faces));
      result = `${pad}polyhedron(points = ${pointsExpr}, faces = ${facesExpr});\n`;
      break;
    }

    // ── 2D Primitives ─────────────────────────────────────────────────────────
    case "circle": {
      const rExpr = resolveValueInput(0, expr(d.r));
      const fnExpr = resolveValueInput(1, expr(d.fn));
      result = `${pad}circle(r = ${rExpr}, $fn = ${fnExpr});\n`;
      break;
    }

    case "square": {
      const xExpr = resolveValueInput(0, expr(d.x));
      const yExpr = resolveValueInput(1, expr(d.y));
      const centerExpr = resolveValueInput(2, bool(d.center));
      result = `${pad}square([${xExpr}, ${yExpr}], center = ${centerExpr});\n`;
      break;
    }

    case "polygon":
      result = `${pad}polygon(points = ${d.points});\n`;
      break;

    case "scadtext": {
      const sizeExpr = resolveValueInput(0, expr(d.size));
      result = `${pad}text("${d.text}", size = ${sizeExpr}, font = "${d.font}", halign = "${d.halign}", valign = "${d.valign}");\n`;
      break;
    }

    case "sketch_profile": {
      const sketchName = String(d.sketchName || "");
      if (!sketchName || !tabs) {
        result = `${pad}// sketch_profile: no sketch selected\n`;
        break;
      }
      const sketchTab = tabs.find(
        (t) => t.tabType === "sketch" && t.sketchName === sketchName,
      );
      if (!sketchTab) {
        result = `${pad}// sketch_profile: sketch "${sketchName}" not found\n`;
        break;
      }
      // Generate polygon code from the sketch tab's nodes/edges
      const sketchCode = sketchToOpenscad(
        sketchTab.nodes,
        sketchTab.edges,
        globalParameters ?? [],
        undefined,
        importedFiles ?? {},
      );
      // Indent the sketch code to match current indentation
      const indented = sketchCode
        .split("\n")
        .map((line) => (line.trim() ? pad + line : ""))
        .filter(Boolean)
        .join("\n");
      result = indented + "\n";
      break;
    }

    // ── Transforms ────────────────────────────────────────────────────────────
    case "translate": {
      const xExpr = resolveValueInput(1, expr(d.x));
      const yExpr = resolveValueInput(2, expr(d.y));
      const zExpr = resolveValueInput(3, expr(d.z));
      result = emitTransform(`translate([${xExpr}, ${yExpr}, ${zExpr}])`);
      break;
    }

    case "rotate": {
      const xExpr = resolveValueInput(1, expr(d.x));
      const yExpr = resolveValueInput(2, expr(d.y));
      const zExpr = resolveValueInput(3, expr(d.z));
      result = emitTransform(`rotate([${xExpr}, ${yExpr}, ${zExpr}])`);
      break;
    }

    case "scale": {
      const xExpr = resolveValueInput(1, expr(d.x));
      const yExpr = resolveValueInput(2, expr(d.y));
      const zExpr = resolveValueInput(3, expr(d.z));
      result = emitTransform(`scale([${xExpr}, ${yExpr}, ${zExpr}])`);
      break;
    }

    case "mirror": {
      const xExpr = resolveValueInput(1, expr(d.x));
      const yExpr = resolveValueInput(2, expr(d.y));
      const zExpr = resolveValueInput(3, expr(d.z));
      result = emitTransform(`mirror([${xExpr}, ${yExpr}, ${zExpr}])`);
      break;
    }

    case "resize": {
      const xExpr = resolveValueInput(1, expr(d.x));
      const yExpr = resolveValueInput(2, expr(d.y));
      const zExpr = resolveValueInput(3, expr(d.z));
      const autoExpr = resolveValueInput(4, bool(d.auto));
      result = emitTransform(
        `resize([${xExpr}, ${yExpr}, ${zExpr}], auto = ${autoExpr})`,
      );
      break;
    }

    case "multmatrix": {
      const matrixExpr = resolveValueInput(1, String(d.matrix));
      result = emitTransform(`multmatrix(${matrixExpr})`);
      break;
    }

    case "offset":
      if (d.useR) {
        const rExpr = resolveValueInput(1, expr(d.r));
        result = emitTransform(`offset(r = ${rExpr})`);
      } else {
        const deltaExpr = resolveValueInput(2, expr(d.delta));
        const chamferExpr = resolveValueInput(3, bool(d.chamfer));
        result = emitTransform(
          `offset(delta = ${deltaExpr}, chamfer = ${chamferExpr})`,
        );
      }
      break;

    // ── Booleans ──────────────────────────────────────────────────────────────
    case "union":
      result = `${pad}union() {\n${getAllChildren()}${pad}}\n`;
      break;

    case "difference":
      result = `${pad}difference() {\n${getAllChildren()}${pad}}\n`;
      break;

    case "intersection":
      result = `${pad}intersection() {\n${getAllChildren()}${pad}}\n`;
      break;

    // ── Extrusions ────────────────────────────────────────────────────────────
    case "linear_extrude": {
      const heightExpr = resolveValueInput(1, expr(d.height));
      const twistExpr = resolveValueInput(2, expr(d.twist));
      const slicesExpr = resolveValueInput(3, expr(d.slices));
      const scaleExpr = resolveValueInput(4, expr(d.scale));
      const fnExpr = resolveValueInput(5, expr(d.fn));
      const centerExpr = resolveValueInput(6, bool(d.center));

      const parts = [`height = ${heightExpr}`, `center = ${centerExpr}`];
      if (num(d.twist) !== 0 || twistExpr !== String(num(d.twist)))
        parts.push(`twist = ${twistExpr}`);
      if (num(d.slices) > 0 || slicesExpr !== String(num(d.slices)))
        parts.push(`slices = ${slicesExpr}`);
      if (num(d.scale) !== 1 || scaleExpr !== String(num(d.scale)))
        parts.push(`scale = ${scaleExpr}`);
      if (num(d.fn) > 0 || fnExpr !== String(num(d.fn)))
        parts.push(`$fn = ${fnExpr}`);
      result = emitTransform(`linear_extrude(${parts.join(", ")})`);
      break;
    }

    case "rotate_extrude": {
      const angleExpr = resolveValueInput(1, expr(d.angle));
      const fnExpr = resolveValueInput(2, expr(d.fn));
      const parts = [`angle = ${angleExpr}`];
      if (num(d.fn) > 0 || fnExpr !== String(num(d.fn)))
        parts.push(`$fn = ${fnExpr}`);
      result = emitTransform(`rotate_extrude(${parts.join(", ")})`);
      break;
    }

    // ── Modifiers ─────────────────────────────────────────────────────────────
    case "hull":
      result = `${pad}hull() {\n${getAllChildren()}${pad}}\n`;
      break;

    case "minkowski":
      result = `${pad}minkowski() {\n${getAllChildren()}${pad}}\n`;
      break;

    case "color": {
      const hex = String(d.hex ?? "").trim();
      const hexFallback = /^#[0-9a-fA-F]{6}$/.test(hex)
        ? `"${hex}"`
        : `[${num(d.r)}, ${num(d.g)}, ${num(d.b)}]`;
      const colorExpr = resolveValueInput(1, hexFallback);
      const alphaExpr = resolveValueInput(2, expr(d.alpha));
      result = emitTransform(`color(${colorExpr}, ${alphaExpr})`);
      break;
    }

    case "projection": {
      const cutExpr = resolveValueInput(1, bool(d.cut));
      result = emitTransform(`projection(cut = ${cutExpr})`);
      break;
    }

    // ── Control / Math / Import ───────────────────────────────────────────────
    case "for_loop": {
      const varName = sanitizeIdentifier(d.varName || "i");
      const start = resolveValueInput(1, expr(d.start));
      const end = resolveValueInput(2, expr(d.end));
      const step = resolveValueInput(3, expr(d.step) || "1");
      if (d.bodyTabId) {
        // New: delegate body to a linked loop body module tab
        const bodyTab = tabs?.find((t) => t.id === String(d.bodyTabId));
        const bodyModuleName = bodyTab
          ? sanitizeIdentifier(bodyTab.moduleName, "for_body")
          : "for_body";
        result = `${pad}for (${varName} = [${start} : ${step} : ${end}])\n${pad}  ${bodyModuleName}(${varName}, ${start}, ${end}, ${step});\n`;
      } else if (!hasChild(0)) {
        result = `${pad}// for loop: no child connected\n`;
      } else {
        result = `${pad}for (${varName} = [${start} : ${step} : ${end}])\n${getChild(0)}`;
      }
      break;
    }

    case "if_cond": {
      const condition = d.condition || "true";
      // New handle layout:
      //   in-0 = upstream geometry (the subtree each branch operates on)
      //   in-1 = YES (transform chain applied when condition is true)
      //   in-2 = NO  (transform chain applied when condition is false)
      const hasGeom = hasChild(0);
      const hasYes = hasChild(1);
      const hasNo = hasChild(2);
      const geomRef = getChildRef(0);

      // Build a geometry-override closure that re-renders the upstream
      // subtree at any requested indent. Uses a fresh `visited` set per
      // invocation so the same subtree can appear inside BOTH branches
      // without being deduped to a `// (shared ref)` comment.
      const upstreamOverride:
        | ((atIndent: number) => string)
        | undefined = geomRef
        ? (atIndent: number) =>
            emitNode(
              geomRef.nodeId,
              nodesMap,
              childrenOf,
              new Set(),
              new Set(),
              atIndent,
              tabs,
              globalParameters,
              importedFiles,
            )
        : undefined;

      if (!hasYes && !hasNo) {
        if (hasGeom && upstreamOverride) {
          // IF with only upstream geometry is effectively a no-op wrap.
          result = `${pad}if (${condition}) {\n${upstreamOverride(indent + 2)}${pad}}\n`;
        } else {
          result = `${pad}// if: no child connected\n`;
        }
      } else if (upstreamOverride) {
        // Both branches (when present) wrap the upstream geometry via their
        // transform chains. If a branch is unwired, that branch reduces to
        // the bare upstream geometry. Each branch is rendered with a fresh
        // `visited` set so that the upstream geometry can legally appear
        // inside BOTH branches (and inside the IF's own `in-0` slot) without
        // being replaced by a `// (shared ref)` comment.
        const emitBranch = (handleIdx: number): string => {
          const ref = children.find((c) => c.handleIndex === handleIdx);
          if (!ref) return upstreamOverride(indent + 2);
          return emitNode(
            ref.nodeId,
            nodesMap,
            childrenOf,
            new Set(),
            new Set(),
            indent + 2,
            tabs,
            globalParameters,
            importedFiles,
            upstreamOverride,
          );
        };
        const yesBody = emitBranch(1);
        const noBody = emitBranch(2);
        result = `${pad}if (${condition}) {\n${yesBody}${pad}} else {\n${noBody}${pad}}\n`;
      } else {
        // Legacy/fallback path: no upstream geometry wired. Emit branches
        // standalone (backward-compatible with the previous two-handle
        // layout where in-1/in-2 were the then/else bodies).
        result = `${pad}// if: no upstream geometry — branches emit standalone\n`;
        result += `${pad}if (${condition}) {\n`;
        if (hasYes) result += getChild(1);
        result += `${pad}}`;
        if (hasNo) {
          result += ` else {\n${getChild(2)}${pad}}`;
        }
        result += "\n";
      }
      break;
    }

    case "intersection_for": {
      const varName = d.varName || "i";
      const start = resolveValueInput(1, expr(d.start));
      const end = resolveValueInput(2, expr(d.end));
      const step = resolveValueInput(3, expr(d.step) || "1");
      if (!hasChild(0)) {
        result = `${pad}// intersection_for: no child connected\n`;
      } else {
        result = `${pad}intersection_for (${varName} = [${start} : ${step} : ${end}])\n${getChild(0)}`;
      }
      break;
    }

    case "assert_node": {
      const condition = d.condition || "true";
      const message = escapeString(d.message);
      if (!hasChild(0)) {
        result = `${pad}assert(${condition}, "${message}");\n`;
      } else {
        result = `${pad}assert(${condition}, "${message}") {\n${getChild(0)}${pad}}\n`;
      }
      break;
    }

    case "render_node":
      result = emitTransform(`render()`);
      break;

    case "import_stl":
      result = `${pad}import("${d.filename || "model.stl"}");\n`;
      break;

    case "surface_node":
      result = `${pad}surface(file = "${d.filename || "heightmap.dat"}", center = ${bool(d.center)});\n`;
      break;

    case "param_import": {
      // Parameterized import: import(str("prefix", var, "suffix"))
      const prefix = escapeString(d.prefix || "");
      const suffix = escapeString(d.suffix || ".stl");
      const varArg = resolveValueInput(0, "i");
      result = `${pad}import(str("${prefix}", ${varArg}, "${suffix}"));\n`;
      break;
    }

    case "loop_export": {
      // Emit an annotation comment + body geometry; consumed by build scripts
      const prefix = escapeString(d.prefix || "output_");
      const format = escapeString(d.format || "stl");
      const varArg = resolveValueInput(1, "i");
      result = `${pad}// @botics:export str("${prefix}", ${varArg}, ".${format}")\n`;
      if (hasChild(0)) result += getChild(0);
      break;
    }

    case "echo_node":
      result = `${pad}echo("${d.message || ""}");\n`;
      break;

    case "var_node": {
      const vName = customName ? asIdentifier(customName) : d.varName || "x";
      const vValue = d.value ?? "0";
      const vType = (d.dataType as string) || "";
      let formatted: string;
      switch (vType) {
        case "string":
          formatted = `"${escapeString(vValue)}"`;
          break;
        case "boolean":
          formatted = vValue === "true" ? "true" : "false";
          break;
        default:
          formatted = String(vValue);
          break;
      }
      result = `${pad}${vName} = ${formatted};\n`;
      break;
    }

    case "parameter_node": {
      const vName = customName
        ? asIdentifier(customName)
        : d.varName || "param";
      const vValue = d.value ?? 0;
      result = `${pad}${vName} = ${vValue};\n`;
      break;
    }

    case "parameter_list": {
      const vName = customName
        ? asIdentifier(customName)
        : d.varName || "list_param";
      const vValue = d.value ?? "[]";
      result = `${pad}${vName} = ${vValue};\n`;
      break;
    }

    case "module_arg": {
      // Module args are emitted in the module signature, not as body statements
      result = "";
      break;
    }

    case "loop_var": {
      // Loop var is emitted in the loop body module signature, not as a body statement
      result = "";
      break;
    }

    case "loop_context": {
      // Loop context node is emitted in the module signature only (provides multiple outputs)
      result = "";
      break;
    }

    case "loop_input": {
      // Represents geometry connected to the FOR node body handle — emits children()
      result = `${pad}children();
`;
      break;
    }

    case "loop_file": {
      // Resolved via resolveValueInput when wired to another node's input handle
      result = "";
      break;
    }

    case "geo_editor_loop":
    case "geo_generator_loop": {
      const varName = sanitizeIdentifier(d.varName || "i");
      const start = resolveValueInput(1, expr(d.start));
      const end = resolveValueInput(2, expr(d.end));
      const step = resolveValueInput(3, expr(d.step) || "1");
      if (d.bodyTabId) {
        const bodyTab = tabs?.find((t) => t.id === String(d.bodyTabId));
        const bodyModuleName = bodyTab
          ? sanitizeIdentifier(bodyTab.moduleName, "for_body")
          : "for_body";
        result = `${pad}for (${varName} = [${start} : ${step} : ${end}])\n${pad}  ${bodyModuleName}(${varName}, ${start}, ${end}, ${step});\n`;
      } else if (node.type === "geo_editor_loop" && hasChild(0)) {
        result = `${pad}for (${varName} = [${start} : ${step} : ${end}])\n${getChild(0)}`;
      } else {
        result = `${pad}// ${node.type}: connect to loop body tab\n`;
      }
      break;
    }

    case "file_iterator_loop": {
      const varName = sanitizeIdentifier(d.varName || "i");
      const fileMode = (d.fileMode as string | undefined) ?? "sequential";
      const bodyTab = tabs?.find((t) => t.id === String(d.bodyTabId));
      const bodyModuleName = bodyTab
        ? sanitizeIdentifier(bodyTab.moduleName, "for_body")
        : "for_body";

      if (!d.bodyTabId) {
        result = `${pad}// file_iterator_loop: no body tab created yet\n`;
        break;
      }

      if (fileMode === "parameterized") {
        const start = resolveValueInput(0, expr(d.start));
        const end = resolveValueInput(1, expr(d.end));
        const step = resolveValueInput(2, expr(d.step) || "1");
        const prefix = escapeString(d.prefix || "");
        const suffix = escapeString(d.suffix || ".stl");
        result =
          `${pad}for (${varName} = [${start} : ${step} : ${end}])\n` +
          `${pad}  ${bodyModuleName}(${varName}, ${start}, ${end}, ${step}, str("${prefix}", ${varName}, "${suffix}"));\n`;
      } else {
        // Sequential mode: emit file list variable + loop
        const rawFiles = (d.files as string | undefined) ?? "";
        const fileList = rawFiles
          .split("\n")
          .filter(Boolean)
          .map((f) => `"${escapeString(f.trim())}"`)
          .join(", ");
        const filesVar = `_files_${varName}`;
        const count = rawFiles.split("\n").filter(Boolean).length || 1;
        const endVal = String(count - 1);
        result =
          `${pad}${filesVar} = [${fileList}];\n` +
          `${pad}for (${varName} = [0 : 1 : len(${filesVar})-1])\n` +
          `${pad}  ${bodyModuleName}(${varName}, 0, ${endVal}, 1, ${filesVar}[${varName}]);\n`;
      }
      break;
    }

    case "module_call": {
      const moduleName = sanitizeIdentifier(d.moduleName || "", "module");
      const argValues =
        (d.argValues as Record<string, string> | undefined) ?? {};
      const argTypes = (d.argTypes as Record<string, string> | undefined) ?? {};
      const argOrderRaw = Array.isArray(d.argOrder)
        ? (d.argOrder as unknown[]).map((v) => String(v))
        : [];
      const legacyArgs = (d.args || "").toString().trim();
      if (!moduleName) {
        result = `${pad}// module_call: no module selected\n`;
        break;
      }

      // Build structured args: check connected handles first (start at index 1, 0 is children)
      const argParts: string[] = [];
      const argNames =
        argOrderRaw.length > 0 ? argOrderRaw : Object.keys(argValues);
      for (let ai = 0; ai < argNames.length; ai++) {
        const aName = argNames[ai];
        const normalizedName = sanitizeIdentifier(aName, "arg");
        const handleIdx = ai + 1; // handle 0 is children
        const connected = resolveValueInput(handleIdx, "");
        if (connected) {
          argParts.push(`${normalizedName} = ${connected}`);
        } else if (argValues[aName] !== undefined && argValues[aName] !== "") {
          const rawValue = argValues[aName];
          const dataType = argTypes[aName] || "";
          let formattedValue = rawValue;
          if (dataType === "string") {
            const isQuoted = /^\s*"[\s\S]*"\s*$/.test(rawValue);
            formattedValue = isQuoted
              ? rawValue
              : `"${escapeString(rawValue)}"`;
          } else if (dataType === "boolean") {
            formattedValue = rawValue === "true" ? "true" : "false";
          }
          argParts.push(`${normalizedName} = ${formattedValue}`);
        }
      }

      // Fall back to legacy freeform args string if no structured args
      const argsStr = argParts.length > 0 ? argParts.join(", ") : legacyArgs;
      const callHead = `${moduleName}(${argsStr})`;
      if (
        children.length === 0 ||
        (children.length === 1 &&
          children[0].handleIndex > 0 &&
          argNames.length > 0)
      ) {
        // No geometry children connected (handle 0 not used)
        const geomChildren = children.filter((c) => c.handleIndex === 0);
        if (geomChildren.length === 0) {
          result = `${pad}${callHead};\n`;
        } else {
          result = `${pad}${callHead} {\n`;
          for (const gc of geomChildren) {
            result += emitNode(
              gc.nodeId,
              nodesMap,
              childrenOf,
              visiting,
              visited,
              indent + 2,
              tabs,
              globalParameters,
            );
          }
          result += `${pad}}\n`;
        }
      } else {
        const geomChildren = children.filter((c) => c.handleIndex === 0);
        if (geomChildren.length === 0) {
          result = `${pad}${callHead};\n`;
        } else {
          result = `${pad}${callHead} {\n`;
          for (const gc of geomChildren) {
            result += emitNode(
              gc.nodeId,
              nodesMap,
              childrenOf,
              visiting,
              visited,
              indent + 2,
              tabs,
              globalParameters,
            );
          }
          result += `${pad}}\n`;
        }
      }
      break;
    }

    default: {
      // Try pack-registered handlers before falling back to unknown comment
      const packHandler = node.type
        ? PACK_CODEGEN_HANDLERS[node.type]
        : undefined;
      if (packHandler) {
        result = packHandler(node, {
          pad,
          num,
          expr,
          bool,
          escapeString,
          sanitizeIdentifier,
          resolveValueInput,
          getAllChildren,
          getChild,
          hasChild,
          emitTransform,
        });
      } else {
        result = `${pad}// Unknown node type: ${node.type}\n`;
      }
    }
  }

  visiting.delete(nodeId);

  // Prepend a name comment for named nodes (except var/param which already use the name)
  if (
    customName &&
    node.type !== "var_node" &&
    node.type !== "parameter_node" &&
    node.type !== "parameter_list"
  ) {
    result = `${pad}// ${customName}\n${result}`;
  }

  return result;
}

function indentStr(n: number): string {
  return " ".repeat(n);
}

// ─── Global parameter emitter ─────────────────────────────────────────────────

function emitGlobalParameter(p: GlobalParameter): string {
  const name = p.name.replace(/[^a-zA-Z0-9_]/g, "_") || "param";
  switch (p.dataType) {
    case "string":
      return `${name} = "${p.value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}";\n`;
    case "boolean":
      return `${name} = ${p.value === "true" ? "true" : "false"};\n`;
    default:
      return `${name} = ${p.value || "0"};\n`;
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateCode(
  nodes: Node[],
  edges: Edge[],
  globalParameters?: GlobalParameter[],
  tabs?: EditorTab[],
  importedFiles?: Record<string, string>,
): string {
  // Filter out group nodes (visual-only, no codegen impact)
  const codeNodes = nodes.filter((n) => n.type !== "group_node");
  if (
    codeNodes.length === 0 &&
    (!globalParameters || globalParameters.length === 0)
  )
    return "// Add nodes to the canvas to generate code\n";

  const nodesMap = new Map(codeNodes.map((n) => [n.id, n]));
  const childrenOf = buildAdjacency(edges);
  let roots = findRoots(codeNodes, edges);

  // Halt flow: if any nodes are halted, they replace the root set.
  // Only the upstream subgraphs leading to halted nodes are emitted.
  const haltedIds = codeNodes
    .filter((n) => (n.data as Record<string, unknown>)._halted === true)
    .map((n) => n.id);

  let code = "";

  if (haltedIds.length > 0) {
    roots = haltedIds;
    code += `// HALT: isolating ${haltedIds.length} node(s)\n`;
  }

  // Emit global parameters first (top-level declarations)
  if (globalParameters && globalParameters.length > 0) {
    for (const param of globalParameters) {
      code += emitGlobalParameter(param);
    }
    code += "\n";
  }

  // Emit pack preambles (e.g. MakerBeam module definitions, BOSL2 includes)
  for (const pack of NODE_PACKS) {
    if (pack.preamble) {
      const preamble = pack.preamble(nodes);
      if (preamble) code += preamble + "\n";
    }
  }

  const visited = new Set<string>();

  // Emit declarations first so parameter/variable references on value ports are defined.
  for (const node of nodes) {
    if (
      node.type === "parameter_node" ||
      node.type === "parameter_list" ||
      node.type === "var_node"
    ) {
      if (!visited.has(node.id)) {
        code += emitNode(
          node.id,
          nodesMap,
          childrenOf,
          new Set(),
          visited,
          0,
          tabs,
          globalParameters,
          importedFiles,
        );
      }
    }
  }

  if (roots.length === 0) {
    code +=
      "// WARNING: No root nodes found (possible cycle in entire graph)\n";
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        code += emitNode(
          node.id,
          nodesMap,
          childrenOf,
          new Set(),
          visited,
          0,
          tabs,
          globalParameters,
          importedFiles,
        );
      }
    }
  } else {
    for (const rootId of roots) {
      if (!visited.has(rootId)) {
        code += emitNode(
          rootId,
          nodesMap,
          childrenOf,
          new Set(),
          visited,
          0,
          tabs,
          globalParameters,
          importedFiles,
        );
      }
    }
  }

  return code;
}

// ─── Module code generation (for tab system) ──────────────────────────────────

export function generateModuleCode(
  moduleName: string,
  nodes: Node[],
  edges: Edge[],
): string {
  // Extract module_arg nodes for the signature
  const argNodes = nodes.filter((n) => n.type === "module_arg");
  const argParts = argNodes.map((n) => {
    const d = n.data as Record<string, unknown>;
    const name = sanitizeIdentifier(String(d.argName || "param"), "arg");
    const defaultVal = String(d.defaultValue ?? "0");
    const dataType = String(d.dataType || "number");
    let formatted: string;
    switch (dataType) {
      case "string":
        formatted = `"${defaultVal.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
        break;
      case "boolean":
        formatted = defaultVal === "true" ? "true" : "false";
        break;
      default:
        formatted = defaultVal;
        break;
    }
    return `${name} = ${formatted}`;
  });
  const safeModuleName = sanitizeIdentifier(moduleName, "module");
  const signature = `module ${safeModuleName}(${argParts.join(", ")})`;

  if (nodes.length === 0) return `${signature} {\n  // Empty module\n}\n`;

  // Filter out module_arg nodes from body generation (they go in signature)
  const bodyNodes = nodes.filter((n) => n.type !== "module_arg");
  if (bodyNodes.length === 0) return `${signature} {\n  // Empty module\n}\n`;

  const innerCode = generateCode(bodyNodes, edges);
  const indented = innerCode
    .split("\n")
    .map((line) => (line.trim() ? "  " + line : line))
    .join("\n");

  return `${signature} {\n${indented}}\n`;
}

// ─── Loop body code generation ────────────────────────────────────────────────

export function generateLoopBodyCode(
  moduleName: string,
  nodes: Node[],
  edges: Edge[],
): string {
  const safeModuleName = sanitizeIdentifier(moduleName, "for_body");

  // Prefer loop_context nodes (new system) for the module signature
  const contextNodes = nodes.filter((n) => n.type === "loop_context");
  let signature: string;

  const hasFileNode = nodes.some((n) => n.type === "loop_file");

  if (contextNodes.length > 0) {
    const ctxData = contextNodes[0].data as Record<string, unknown>;
    const varParam = sanitizeIdentifier(String(ctxData.varName || "i"), "i");
    const fileParam = hasFileNode ? ", loop_file" : "";
    signature = `module ${safeModuleName}(${varParam}, loop_start, loop_end, loop_step${fileParam})`;
  } else {
    // Fallback: legacy loop_var nodes for backward compat with saved projects
    const varNodes = nodes.filter((n) => n.type === "loop_var");
    const varParts = varNodes.map((n) => {
      const d = n.data as Record<string, unknown>;
      return sanitizeIdentifier(String(d.varName || "i"), "i");
    });
    signature = `module ${safeModuleName}(${varParts.join(", ")})`;
  }

  // Filter out header nodes — they contribute to signature only, not body statements
  const bodyNodes = nodes.filter(
    (n) =>
      n.type !== "loop_var" &&
      n.type !== "loop_context" &&
      n.type !== "loop_file",
  );
  if (bodyNodes.length === 0)
    return `${signature} {\n  // Empty loop body\n}\n`;

  const innerCode = generateCode(bodyNodes, edges);
  const indented = innerCode
    .split("\n")
    .map((line) => (line.trim() ? "  " + line : line))
    .join("\n");

  return `${signature} {\n${indented}}\n`;
}
