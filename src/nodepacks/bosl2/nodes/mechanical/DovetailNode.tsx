import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput, SelectInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2DovetailData } from "../../types/mechanical";

export function DovetailNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2DovetailData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_mechanical"
      label="dovetail"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "width" },
        { id: "in-1", label: "height" },
        { id: "in-2", label: "slope" },
        { id: "in-3", label: "slide" },
      ]}
    >
      <SelectInput
        label="gender"
        value={d.gender}
        options={["male", "female"]}
        onChange={(v) => update(id, { gender: v })}
      />
      <ExpressionInput
        label="width"
        value={d.width}
        step={1}
        nodeId={id}
        handleId="in-0"
        onChange={(v) => update(id, { width: v })}
      />
      <ExpressionInput
        label="height"
        value={d.height}
        step={1}
        nodeId={id}
        handleId="in-1"
        onChange={(v) => update(id, { height: v })}
      />
      <ExpressionInput
        label="slope"
        value={d.slope}
        step={1}
        nodeId={id}
        handleId="in-2"
        onChange={(v) => update(id, { slope: v })}
      />
      <ExpressionInput
        label="slide"
        value={d.slide}
        step={1}
        nodeId={id}
        handleId="in-3"
        onChange={(v) => update(id, { slide: v })}
      />
    </BaseNode>
  );
}
