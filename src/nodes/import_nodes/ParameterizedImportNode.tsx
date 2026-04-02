import { type NodeProps } from "@xyflow/react";
import { BaseNode, TextInput } from "../BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { ParameterizedImportData } from "@/types/nodes";

export function ParameterizedImportNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ParameterizedImportData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="import"
      label="param import"
      selected={selected}
      inputHandles={[{ id: "in-0", label: "var" }]}
    >
      <TextInput
        label="prefix"
        value={d.prefix ?? ""}
        onChange={(v) => update(id, { prefix: v })}
      />
      <TextInput
        label="suffix"
        value={d.suffix ?? ".stl"}
        onChange={(v) => update(id, { suffix: v })}
      />
      <div className="text-[9px] text-gray-500 mt-1 font-mono">
        import(str(&quot;{d.prefix ?? ""}&quot;, var, &quot;{d.suffix ?? ".stl"}
        &quot;))
      </div>
    </BaseNode>
  );
}
