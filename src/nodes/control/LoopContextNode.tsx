import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import type { LoopContextData } from "@/types/nodes";

const OUTPUTS = [
  {
    id: "out-0",
    key: "varName",
    sublabelKey: "varName",
    labelSuffix: " (current)",
  },
  { id: "out-1", key: "start", label: "start" },
  { id: "out-2", key: "end", label: "end" },
  { id: "out-3", key: "step", label: "step" },
] as const;

export function LoopContextNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as LoopContextData;
  const { deleteElements } = useReactFlow();

  const varName = d.varName || "i";
  const startVal = String(d.start ?? 0);
  const endVal = String(d.end ?? 5);
  const stepVal = String(d.step ?? 1);

  const rows: { id: string; label: string; value: string }[] = [
    { id: "out-0", label: `${varName}`, value: "current" },
    { id: "out-1", label: "start", value: startVal },
    { id: "out-2", label: "end", value: endVal },
    { id: "out-3", label: "step", value: stepVal },
  ];

  return (
    <div
      className={`rounded-lg shadow-xl border transition-all
        ${
          selected
            ? "border-amber-400/80 shadow-amber-400/20 ring-1 ring-amber-400/40"
            : "border-amber-600/40"
        }
        bg-gray-900/95 backdrop-blur-sm`}
      style={{ minWidth: 200 }}
    >
      {/* Header */}
      <div className="bg-amber-600 text-white px-3 py-1.5 text-xs font-bold tracking-wide uppercase select-none rounded-t-lg flex items-center justify-between">
        <span>Loop Context</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteElements({ nodes: [{ id }] });
          }}
          className="ml-2 opacity-50 hover:opacity-100 transition-opacity text-sm leading-none nodrag nopan"
          title="Remove node"
        >
          ✕
        </button>
      </div>

      {/* Range info */}
      <div className="px-3 pt-2 pb-1.5 border-b border-white/5">
        <div className="text-[10px] text-amber-300 font-mono">
          for {varName} = [{startVal}&nbsp;:&nbsp;{stepVal}&nbsp;:&nbsp;{endVal}
          ]
        </div>
        <div className="text-[9px] text-gray-500 italic mt-0.5">
          Driven by FOR node · read-only
        </div>
      </div>

      {/* Output rows — each row is position:relative so Handle's top:50% is relative to the row */}
      <div className="py-2">
        {rows.map(({ id: hId, label, value }) => (
          <div
            key={hId}
            className="relative flex items-center justify-end pr-6 pl-3 text-[10px]"
            style={{ height: 26 }}
          >
            <span className="text-amber-300 font-mono mr-1.5">{value}</span>
            <span className="text-gray-400">{label}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={hId}
              style={{
                position: "absolute",
                right: "-7px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "#f59e0b",
                width: 14,
                height: 14,
                border: "2px solid rgba(253,230,138,0.7)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
