import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2BevelGearData } from "../../types/mechanical";

export function BevelGearNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2BevelGearData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_mechanical"
      label="bevel_gear"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "mod" },
        { id: "in-1", label: "teeth" },
        { id: "in-2", label: "mate_teeth" },
        { id: "in-3", label: "shaft_angle" },
        { id: "in-4", label: "face_width" },
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
        label="mate_teeth"
        value={d.mate_teeth}
        step={1}
        nodeId={id}
        handleId="in-2"
        onChange={(v) => update(id, { mate_teeth: v })}
      />
      <ExpressionInput
        label="shaft_angle"
        value={d.shaft_angle}
        step={1}
        nodeId={id}
        handleId="in-3"
        onChange={(v) => update(id, { shaft_angle: v })}
      />
      <ExpressionInput
        label="face_width"
        value={d.face_width}
        step={1}
        nodeId={id}
        handleId="in-4"
        onChange={(v) => update(id, { face_width: v })}
      />
    </BaseNode>
  );
}
