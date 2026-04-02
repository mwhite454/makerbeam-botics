/**
 * LoopFileNode — "Current File"
 *
 * Placed inside a File Loop body tab. Emits the `file` iteration variable,
 * which resolves to the path of the current iteration's file. Wire its
 * output into a param_import or other import node.
 *
 * No inputs; one output (out-0 → `file`).
 */
import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "../BaseNode";

export function LoopFileNode({ id, data, selected }: NodeProps) {
  void data; // no editable fields
  return (
    <BaseNode
      id={id}
      category="import"
      label="current file"
      selected={selected}
      inputHandles={[]}
    />
  );
}
