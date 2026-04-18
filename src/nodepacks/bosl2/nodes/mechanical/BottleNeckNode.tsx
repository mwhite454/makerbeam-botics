import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2BottleNeckData } from "../../types/mechanical";

export function BottleNeckNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2BottleNeckData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_mechanical"
      label="bottle_neck"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "wall" },
        { id: "in-1", label: "neck_d" },
        { id: "in-2", label: "thread_pitch" },
      ]}
    >
      <ExpressionInput
        label="wall"
        value={d.wall}
        step={0.5}
        nodeId={id}
        handleId="in-0"
        onChange={(v) => update(id, { wall: v })}
      />
      <ExpressionInput
        label="neck_d"
        value={d.neck_d}
        step={1}
        nodeId={id}
        handleId="in-1"
        onChange={(v) => update(id, { neck_d: v })}
      />
      <ExpressionInput
        label="thread_pitch"
        value={d.thread_pitch}
        step={0.5}
        nodeId={id}
        handleId="in-2"
        onChange={(v) => update(id, { thread_pitch: v })}
      />
    </BaseNode>
  );
}
