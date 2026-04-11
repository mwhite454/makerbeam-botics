/**
 * FileIteratorLoopNode — "File Loop"
 *
 * Two operating modes:
 *
 *  sequential    – User enters a list of file paths (one per line).
 *                  The range is auto-computed as [0 : 1 : len-1].
 *                  In the body tab, the LoopFileNode resolves to
 *                  `_files_<var>[<var>]` (OpenSCAD list lookup).
 *
 *  parameterized – User supplies a prefix and suffix. The filename
 *                  is constructed as `str(prefix, var, suffix)` on
 *                  every iteration. Range fields are editable.
 *
 * Both modes seed the body tab with a LoopContextNode + LoopFileNode.
 */
import { useEffect, useRef } from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode, TextInput, ExpressionInput, SelectInput } from "../BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { FileIteratorData } from "@/types/nodes";
import { buildLoopSeedNodes } from "./ForLoopNode";

const INPUT_HANDLES: { id: string; label: string }[] = [];

export function FileIteratorLoopNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as FileIteratorData;

  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const getActiveTab = useEditorStore((s) => s.getActiveTab);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const updateNodeDataInTab = useEditorStore((s) => s.updateNodeDataInTab);
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
    const fileMode = (liveData?.fileMode as string | undefined) ?? "sequential";

    let start = "0";
    let end_ = "0";
    let step = "1";

    if (fileMode === "parameterized") {
      start = String(liveData?.start ?? 0);
      end_ = String(liveData?.end ?? 5);
      step = String(liveData?.step ?? 1);
    } else {
      const files = ((liveData?.files as string | undefined) ?? "").trim();
      const count = files ? files.split("\n").filter(Boolean).length : 0;
      end_ = String(Math.max(0, count - 1));
    }

    const existingLabels = useEditorStore.getState().tabs.map((t) => t.label);
    const baseLabel = `files_${varName}`;
    let label = baseLabel;
    let suffix = 2;
    while (existingLabels.includes(label)) label = `${baseLabel}_${suffix++}`;

    const callerTabId = getActiveTab()?.id ?? "";
    // Seed LoopContextNode + LoopFileNode
    const ts = Date.now();
    const seedNodes = [
      ...buildLoopSeedNodes(varName, start, end_, step, false, ts),
      {
        id: `loop_file-${ts + 10}`,
        type: "loop_file",
        position: { x: 80, y: 280 },
        data: {},
      },
    ];
    const newTabId = createLoopBodyTab(label, seedNodes as never, undefined, callerTabId, id);
    updateNodeDataInTab(callerTabId, id, { bodyTabId: newTabId });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When file list changes in sequential mode, propagate the auto-range
  const handleFilesChange = (raw: string) => {
    const lines = raw.split("\n").filter(Boolean);
    const count = lines.length;
    const newEnd = String(Math.max(0, count - 1));
    updateNodeData(id, { files: raw, end: newEnd });

    // Propagate updated range into the body tab's LoopContextNode
    if (d.bodyTabId) {
      propagateForLoopContext(id, { end: newEnd });
    }
  };

  const bodyTab = d.bodyTabId
    ? tabs.find((t) => t.id === d.bodyTabId)
    : undefined;

  return (
    <BaseNode
      id={id}
      category="control"
      label="File Loop"
      selected={selected}
      inputHandles={INPUT_HANDLES}
    >
      <TextInput
        label="variable"
        value={d.varName}
        onChange={(v) => updateNodeData(id, { varName: v })}
      />
      <SelectInput
        label="mode"
        value={d.fileMode ?? "sequential"}
        options={["sequential", "parameterized"]}
        onChange={(v) => updateNodeData(id, { fileMode: v })}
      />

      {(d.fileMode ?? "sequential") === "sequential" ? (
        <div className="flex flex-col gap-0.5 py-0.5 nodrag">
          <span className="text-[10px] text-gray-400">
            files (one per line)
          </span>
          <textarea
            className="w-full text-[10px] bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-gray-200 resize-y nodrag"
            rows={4}
            value={d.files ?? ""}
            placeholder="path/to/a.stl&#10;path/to/b.stl"
            onChange={(e) => handleFilesChange(e.target.value)}
          />
          <span className="text-[9px] text-gray-500 mt-0.5">
            range: [0 : 1 :{" "}
            {Math.max(
              0,
              ((d.files ?? "").split("\n").filter(Boolean).length || 1) - 1,
            )}
            ]
          </span>
        </div>
      ) : (
        <>
          <TextInput
            label="prefix"
            value={d.prefix ?? "part_"}
            onChange={(v) => updateNodeData(id, { prefix: v })}
          />
          <TextInput
            label="suffix"
            value={d.suffix ?? ".stl"}
            onChange={(v) => updateNodeData(id, { suffix: v })}
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
        </>
      )}

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
