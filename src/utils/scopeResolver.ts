import { useEditorStore } from "@/store/editorStore";

export interface ScopeVariable {
  name: string;
  kind: "global" | "loop" | "module_arg";
  dataType: string;
  currentValue?: string;
}

/**
 * Resolves all variables available in the current scope.
 *
 * - Global parameters: always available
 * - Loop variables: available when the active tab is a loop body tab
 *   (loop_context / loop_var nodes expose varName, start, end, step)
 * - Module arguments: available when the active tab is a module tab
 */
export function resolveScope(): ScopeVariable[] {
  const state = useEditorStore.getState();
  const vars: ScopeVariable[] = [];

  // 1. Global parameters — always in scope
  for (const p of state.globalParameters) {
    vars.push({
      name: p.name,
      kind: "global",
      dataType: p.dataType,
      currentValue: p.value,
    });
  }

  // 2. Tab-scoped variables
  const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
  if (!activeTab) return vars;

  // Nodes may live in `state.nodes` (for the active tab) or the tab's snapshot
  const tabNodes = state.nodes;

  if (activeTab.tabType === "loop") {
    // Gather loop context / loop var nodes
    for (const node of tabNodes) {
      if (node.type === "loop_context") {
        const d = node.data as Record<string, unknown>;
        const varName = (d.varName as string) || "i";
        vars.push({
          name: varName,
          kind: "loop",
          dataType: "number",
          currentValue: String(d.start ?? 0),
        });
        vars.push({
          name: `${varName}_start`,
          kind: "loop",
          dataType: "number",
          currentValue: String(d.start ?? 0),
        });
        vars.push({
          name: `${varName}_end`,
          kind: "loop",
          dataType: "number",
          currentValue: String(d.end ?? 5),
        });
        vars.push({
          name: `${varName}_step`,
          kind: "loop",
          dataType: "number",
          currentValue: String(d.step ?? 1),
        });
      } else if (node.type === "loop_var") {
        const d = node.data as Record<string, unknown>;
        const varName = (d.varName as string) || "i";
        if (!vars.some((v) => v.name === varName)) {
          vars.push({ name: varName, kind: "loop", dataType: "number" });
        }
      }
    }
  }

  if (activeTab.tabType === "module") {
    // Gather module_arg nodes
    for (const node of tabNodes) {
      if (node.type === "module_arg") {
        const d = node.data as Record<string, unknown>;
        const argName = (d.argName as string) || "param";
        vars.push({
          name: argName,
          kind: "module_arg",
          dataType: (d.dataType as string) || "number",
          currentValue: d.defaultValue as string | undefined,
        });
      }
    }
  }

  return vars;
}

/**
 * React-friendly hook version: subscribes to store changes.
 * Returns a memoised list updated when global params, active tab, or nodes change.
 */
export function useScopeVariables(): ScopeVariable[] {
  const globalParameters = useEditorStore((s) => s.globalParameters);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const tabs = useEditorStore((s) => s.tabs);
  const nodes = useEditorStore((s) => s.nodes);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const vars: ScopeVariable[] = [];

  for (const p of globalParameters) {
    vars.push({
      name: p.name,
      kind: "global",
      dataType: p.dataType,
      currentValue: p.value,
    });
  }

  if (activeTab?.tabType === "loop") {
    for (const node of nodes) {
      if (node.type === "loop_context") {
        const d = node.data as Record<string, unknown>;
        const varName = (d.varName as string) || "i";
        vars.push({
          name: varName,
          kind: "loop",
          dataType: "number",
          currentValue: String(d.start ?? 0),
        });
        vars.push({
          name: `${varName}_start`,
          kind: "loop",
          dataType: "number",
          currentValue: String(d.start ?? 0),
        });
        vars.push({
          name: `${varName}_end`,
          kind: "loop",
          dataType: "number",
          currentValue: String(d.end ?? 5),
        });
        vars.push({
          name: `${varName}_step`,
          kind: "loop",
          dataType: "number",
          currentValue: String(d.step ?? 1),
        });
      } else if (node.type === "loop_var") {
        const d = node.data as Record<string, unknown>;
        const varName = (d.varName as string) || "i";
        if (!vars.some((v) => v.name === varName)) {
          vars.push({ name: varName, kind: "loop", dataType: "number" });
        }
      }
    }
  }

  if (activeTab?.tabType === "module") {
    for (const node of nodes) {
      if (node.type === "module_arg") {
        const d = node.data as Record<string, unknown>;
        const argName = (d.argName as string) || "param";
        vars.push({
          name: argName,
          kind: "module_arg",
          dataType: (d.dataType as string) || "number",
          currentValue: d.defaultValue as string | undefined,
        });
      }
    }
  }

  return vars;
}
