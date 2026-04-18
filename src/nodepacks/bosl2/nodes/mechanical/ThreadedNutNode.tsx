import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2ThreadedNutData } from "../../types/mechanical";

export function ThreadedNutNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2ThreadedNutData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_mechanical"
      label="threaded_nut"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "nutwidth" },
        { id: "in-1", label: "id" },
        { id: "in-2", label: "h" },
        { id: "in-3", label: "pitch" },
      ]}
    >
      <ExpressionInput
        label="nutwidth"
        value={d.nutwidth}
        step={1}
        nodeId={id}
        handleId="in-0"
        onChange={(v) => update(id, { nutwidth: v })}
      />
      <ExpressionInput
        label="id"
        value={d.id}
        step={1}
        nodeId={id}
        handleId="in-1"
        onChange={(v) => update(id, { id: v })}
      />
      <ExpressionInput
        label="h"
        value={d.h}
        step={1}
        nodeId={id}
        handleId="in-2"
        onChange={(v) => update(id, { h: v })}
      />
      <ExpressionInput
        label="pitch"
        value={d.pitch}
        step={0.5}
        nodeId={id}
        handleId="in-3"
        onChange={(v) => update(id, { pitch: v })}
      />
    </BaseNode>
  );
}
