import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2RotCopiesData } from "../../types/transforms";

export function RotCopiesNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RotCopiesData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_distributors"
      label="rot_copies"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "child" },
        { id: "in-1", label: "n" },
        { id: "in-2", label: "sa" },
      ]}
    >
      <ExpressionInput
        label="n"
        value={d.n}
        step={1}
        onChange={(v) => update(id, { n: v })}
      />
      <ExpressionInput
        label="sa"
        value={d.sa}
        step={1}
        onChange={(v) => update(id, { sa: v })}
      />
    </BaseNode>
  );
}
