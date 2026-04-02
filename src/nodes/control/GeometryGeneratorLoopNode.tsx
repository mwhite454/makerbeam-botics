/**
 * GeometryGeneratorLoopNode — "Generate Loop"
 *
 * Iterates over a range and generates new geometry on every iteration.
 * No geometry input — the loop body constructs everything from scratch
 * using the iterator variable. Use this when you want to programmatically
 * instantiate multiple copies / grid layouts / parametric series.
 *
 * Inputs:  start (in-0), end (in-1), step (in-2)
 * Outputs: generated geometry (out-0)
 */
import { useEffect, useRef } from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode, TextInput, ExpressionInput } from "../BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { ForLoopData } from "@/types/nodes";
import { buildLoopSeedNodes } from "./ForLoopNode";

const INPUT_HANDLES = [
  { id: "in-0", label: "start" },
  { id: "in-1", label: "end" },
  { id: "in-2", label: "step" },
];

export function GeometryGeneratorLoopNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ForLoopData;

  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const getActiveTab = useEditorStore((s) => s.getActiveTab);
  const updateNodeDataInTab = useEditorStore((s) => s.updateNodeDataInTab);
  const propagateForLoopVarName = useEditorStore(
    (s) => s.propagateForLoopVarName,
  );
  const propagateForLoopContext = useEditorStore(
    (s) => s.propagateForLoopContext,
  );
  const createLoopBodyTab = useEditorStore((s) => s.createLoopBodyTab);
  const tabs = useEditorStore((s) => s.tabs);

  const autoInitFired = useRef(false);
  useEffect(() => {
    if (autoInitFired.current) return;
    autoInitFired.current = true;

    const liveNode = useEditorStore.getState().nodes.find((n) => n.id === id);
    const liveData = liveNode?.data as Record<string, unknown> | undefined;
    if (liveData?.bodyTabId) return;

    const varName = (liveData?.varName as string | undefined) || "i";
    const start = String(liveData?.start ?? 0);
    const end_ = String(liveData?.end ?? 5);
    const step = String(liveData?.step ?? 1);

    const existingLabels = useEditorStore.getState().tabs.map((t) => t.label);
    const baseLabel = `gen_${varName}`;
    let label = baseLabel;
    let suffix = 2;
    while (existingLabels.includes(label)) label = `${baseLabel}_${suffix++}`;

    const callerTabId = getActiveTab()?.id ?? "";
    // No LoopInputNode — this node generates, not edits
    const seedNodes = buildLoopSeedNodes(
      varName,
      start,
      end_,
      step,
      false,
      Date.now(),
    );
    const newTabId = createLoopBodyTab(label, seedNodes as never);
    updateNodeDataInTab(callerTabId, id, { bodyTabId: newTabId });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bodyTab = d.bodyTabId
    ? tabs.find((t) => t.id === d.bodyTabId)
    : undefined;

  return (
    <BaseNode
      id={id}
      category="control"
      label="Generate Loop"
      selected={selected}
      inputHandles={INPUT_HANDLES}
    >
      <TextInput
        label="variable"
        value={d.varName}
        onChange={(v) => propagateForLoopVarName(id, v)}
      />
      <ExpressionInput
        label="start"
        value={d.start}
        step={1}
        onChange={(v) => propagateForLoopContext(id, { start: String(v) })}
      />
      <ExpressionInput
        label="end"
        value={d.end}
        step={1}
        onChange={(v) => propagateForLoopContext(id, { end: String(v) })}
      />
      <ExpressionInput
        label="step"
        value={d.step}
        step={1}
        onChange={(v) => propagateForLoopContext(id, { step: String(v) })}
      />
      {bodyTab && (
        <button
          className="mt-1.5 flex items-center gap-1.5 w-full text-[10px] px-2 py-1 rounded bg-amber-900/60 border border-amber-600/40 hover:bg-amber-800/60 text-amber-300 transition-colors nodrag"
          onClick={() => setActiveTab(bodyTab.id)}
          title="Open loop body tab"
        >
          <span className="font-semibold text-amber-400 bg-amber-900/80 px-1 rounded text-[9px]">
            lp
          </span>
          <span className="font-mono truncate">{bodyTab.label}</span>
          <span className="ml-auto">↗</span>
        </button>
      )}
    </BaseNode>
  );
}
