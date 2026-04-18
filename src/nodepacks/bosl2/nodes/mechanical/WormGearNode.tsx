import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2WormGearData } from "../../types/mechanical";

export function WormGearNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2WormGearData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_mechanical"
      label="worm_gear"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "mod" },
        { id: "in-1", label: "teeth" },
        { id: "in-2", label: "worm_diam" },
        { id: "in-3", label: "worm_starts" },
        { id: "in-4", label: "thickness" },
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
        label="worm_diam"
        value={d.worm_diam}
        step={1}
        nodeId={id}
        handleId="in-2"
        onChange={(v) => update(id, { worm_diam: v })}
      />
      <ExpressionInput
        label="worm_starts"
        value={d.worm_starts}
        step={1}
        nodeId={id}
        handleId="in-3"
        onChange={(v) => update(id, { worm_starts: v })}
      />
      <ExpressionInput
        label="thickness"
        value={d.thickness}
        step={1}
        nodeId={id}
        handleId="in-4"
        onChange={(v) => update(id, { thickness: v })}
      />
    </BaseNode>
  );
}
