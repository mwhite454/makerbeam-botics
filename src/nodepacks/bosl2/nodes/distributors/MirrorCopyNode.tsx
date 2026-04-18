import { type NodeProps } from "@xyflow/react";
import { BaseNode, ExpressionInput } from "@/nodes/BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { Bosl2MirrorCopyData } from "../../types/transforms";

export function MirrorCopyNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as Bosl2MirrorCopyData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="bosl2_distributors"
      label="mirror_copy"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "child" },
        { id: "in-1", label: "vx" },
        { id: "in-2", label: "vy" },
        { id: "in-3", label: "vz" },
        { id: "in-4", label: "offset" },
      ]}
    >
      <ExpressionInput
        label="vx"
        value={d.vx}
        step={1}
        onChange={(v) => update(id, { vx: v })}
      />
      <ExpressionInput
        label="vy"
        value={d.vy}
        step={1}
        onChange={(v) => update(id, { vy: v })}
      />
      <ExpressionInput
        label="vz"
        value={d.vz}
        step={1}
        onChange={(v) => update(id, { vz: v })}
      />
      <ExpressionInput
        label="offset"
        value={d.offset}
        step={1}
        onChange={(v) => update(id, { offset: v })}
      />
    </BaseNode>
  );
}
