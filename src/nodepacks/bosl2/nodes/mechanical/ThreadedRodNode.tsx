import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput, CheckboxInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2ThreadedRodData } from "../../types/mechanical";

export function ThreadedRodNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2ThreadedRodData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_mechanical"
      label="threaded_rod"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "d" },
        { id: "in-1", label: "l" },
        { id: "in-2", label: "pitch" },
      ]}
    >
      <ExpressionInput
        label="d"
        value={d.d}
        step={1}
        nodeId={id}
        handleId="in-0"
        onChange={(v) => update(id, { d: v })}
      />
      <ExpressionInput
        label="l"
        value={d.l}
        step={1}
        nodeId={id}
        handleId="in-1"
        onChange={(v) => update(id, { l: v })}
      />
      <ExpressionInput
        label="pitch"
        value={d.pitch}
        step={0.5}
        nodeId={id}
        handleId="in-2"
        onChange={(v) => update(id, { pitch: v })}
      />
      <CheckboxInput
        label="internal"
        value={d.internal}
        onChange={(v) => update(id, { internal: v })}
      />
    </BaseNode>
  );
}
