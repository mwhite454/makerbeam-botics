import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "../BaseNode";

export function LoopInputNode({ id, data, selected }: NodeProps) {
  void data;
  return (
    <BaseNode
      id={id}
      category="control"
      label="Body Input"
      selected={selected}
      hasOutput={true}
    >
      <div className="px-1 py-0.5 text-center">
        <span className="text-[9px] text-amber-400/70 italic">
          ← body edge geometry
        </span>
      </div>
    </BaseNode>
  );
}
