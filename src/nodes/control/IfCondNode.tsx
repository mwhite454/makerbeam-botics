import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput } from "../BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { IfCondData } from "@/types/nodes";

export function IfCondNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as IfCondData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="control"
      label="if"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "YES" },
        { id: "in-1", label: "NO" },
      ]}
    >
      <ExpressionInput
        label="condition"
        value={d.condition}
        onChange={(v) => update(id, { condition: String(v) })}
        forceFormula
        widthClass="w-[100px]"
      />
    </BaseNode>
  );
}
