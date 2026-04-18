import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput, TextInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2ScrewData } from "../../types/mechanical";

export function ScrewNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2ScrewData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_mechanical"
      label="screw"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "length" },
        { id: "in-1", label: "thread_len" },
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
      <TextInput
        label="drive"
        value={d.drive}
        onChange={(v) => update(id, { drive: v })}
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
        label="thread_len"
        value={d.thread_len}
        step={1}
        nodeId={id}
        handleId="in-1"
        onChange={(v) => update(id, { thread_len: v })}
      />
    </BaseNode>
  );
}
