import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput, TextInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2ScrewHoleData } from "../../types/mechanical";

export function ScrewHoleNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2ScrewHoleData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_mechanical"
      label="screw_hole"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "length" },
        { id: "in-1", label: "oversize" },
      ]}
    >
      <TextInput
        label="spec"
        value={d.spec}
        onChange={(v) => update(id, { spec: v })}
      />
      <TextInput
        label="head"
        value={d.head}
        onChange={(v) => update(id, { head: v })}
      />
      <ExpressionInput
        label="length"
        value={d.length}
        step={1}
        nodeId={id}
        handleId="in-0"
        onChange={(v) => update(id, { length: v })}
      />
      <ExpressionInput
        label="oversize"
        value={d.oversize}
        step={0.1}
        nodeId={id}
        handleId="in-1"
        onChange={(v) => update(id, { oversize: v })}
      />
    </BaseNode>
  );
}
