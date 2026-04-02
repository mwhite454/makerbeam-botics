import { type NodeProps } from "@xyflow/react";
import { BaseNode, TextInput, SelectInput } from "../BaseNode";
import { useEditorStore } from "@/store/editorStore";
import type { LoopExportData } from "@/types/nodes";

const FORMAT_OPTIONS = ["stl", "png", "dxf", "amf"];

export function LoopExportNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as LoopExportData;
  const update = useEditorStore((s) => s.updateNodeData);
  return (
    <BaseNode
      id={id}
      category="control"
      label="loop export"
      selected={selected}
      inputHandles={[
        { id: "in-0", label: "body" },
        { id: "in-1", label: "var" },
      ]}
      hasOutput={false}
    >
      <TextInput
        label="prefix"
        value={d.prefix ?? "output_"}
        onChange={(v) => update(id, { prefix: v })}
      />
      <SelectInput
        label="format"
        value={d.format ?? "stl"}
        options={FORMAT_OPTIONS}
        onChange={(v) => update(id, { format: v })}
      />
      <div className="text-[9px] text-gray-500 mt-1 font-mono leading-tight">
        // @botics:export
        <br />
        // str(&quot;{d.prefix ?? "output_"}&quot;, var, &quot;.
        {d.format ?? "stl"}&quot;)
      </div>
    </BaseNode>
  );
}
