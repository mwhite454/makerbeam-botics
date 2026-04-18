import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2RackData } from "../../types/mechanical";

export function RackNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2RackData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_mechanical"
      label="rack"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "mod" },
        { id: "in-1", label: "teeth" },
        { id: "in-2", label: "thickness" },
        { id: "in-3", label: "height" },
        { id: "in-4", label: "pressure_angle" },
        { id: "in-5", label: "helical" },
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
        label="teeth"
        value={d.teeth}
        step={1}
        nodeId={id}
        handleId="in-1"
        onChange={(v) => update(id, { teeth: v })}
      />
      <ExpressionInput
        label="thickness"
        value={d.thickness}
        step={1}
        nodeId={id}
        handleId="in-2"
        onChange={(v) => update(id, { thickness: v })}
      />
      <ExpressionInput
        label="height"
        value={d.height}
        step={1}
        nodeId={id}
        handleId="in-3"
        onChange={(v) => update(id, { height: v })}
      />
      <ExpressionInput
        label="pressure_angle"
        value={d.pressure_angle}
        step={1}
        nodeId={id}
        handleId="in-4"
        onChange={(v) => update(id, { pressure_angle: v })}
      />
      <ExpressionInput
        label="helical"
        value={d.helical}
        step={1}
        nodeId={id}
        handleId="in-5"
        onChange={(v) => update(id, { helical: v })}
      />
    </BaseNode>
  );
}
