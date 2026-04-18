import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2ArcCopiesData } from "../../types/transforms";

export function ArcCopiesNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2ArcCopiesData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_distributors"
      label="arc_copies"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "child" },
        { id: "in-1", label: "n" },
        { id: "in-2", label: "r" },
        { id: "in-3", label: "sa" },
        { id: "in-4", label: "ea" },
      ]}
    >
      <ExpressionInput
        label="n"
        value={d.n}
        step={1}
        onChange={(v) => update(id, { n: v })}
      />
      <ExpressionInput
        label="r"
        value={d.r}
        step={1}
        onChange={(v) => update(id, { r: v })}
      />
      <ExpressionInput
        label="sa"
        value={d.sa}
        step={1}
        onChange={(v) => update(id, { sa: v })}
      />
      <ExpressionInput
        label="ea"
        value={d.ea}
        step={1}
        onChange={(v) => update(id, { ea: v })}
      />
    </BaseNode>
  );
}
