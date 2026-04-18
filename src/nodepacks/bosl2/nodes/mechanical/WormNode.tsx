import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2WormData } from "../../types/mechanical";

export function WormNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2WormData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_mechanical"
      label="worm"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "mod" },
        { id: "in-1", label: "d" },
        { id: "in-2", label: "l" },
        { id: "in-3", label: "starts" },
      ]}
    >
      <ExpressionInput
        label="mod"
        value={d.mod}
        step={0.5}
        nodeId={id}
        handleId="in-0"
        onChange={(v) => update(id, { mod: v })}
      />
      <ExpressionInput
        label="d"
        value={d.d}
        step={1}
        nodeId={id}
        handleId="in-1"
        onChange={(v) => update(id, { d: v })}
      />
      <ExpressionInput
        label="l"
        value={d.l}
        step={1}
        nodeId={id}
        handleId="in-2"
        onChange={(v) => update(id, { l: v })}
      />
      <ExpressionInput
        label="starts"
        value={d.starts}
        step={1}
        nodeId={id}
        handleId="in-3"
        onChange={(v) => update(id, { starts: v })}
      />
    </BaseNode>
  );
}
