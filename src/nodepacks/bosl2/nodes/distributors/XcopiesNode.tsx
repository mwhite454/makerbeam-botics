import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2AxisCopiesData } from "../../types/transforms";

export function XcopiesNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2AxisCopiesData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_distributors"
      label="xcopies"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "child" },
        { id: "in-1", label: "spacing" },
        { id: "in-2", label: "n" },
      ]}
    >
      <ExpressionInput
        label="spacing"
        value={d.spacing}
        step={1}
        onChange={(v) => update(id, { spacing: v })}
      />
      <ExpressionInput
        label="n"
        value={d.n}
        step={1}
        onChange={(v) => update(id, { n: v })}
      />
    </BaseNode>
  );
}
