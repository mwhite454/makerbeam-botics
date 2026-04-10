import React, { useRef, useCallback, useContext } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { CATEGORY_COLORS, CATEGORY_TEXT } from "@/types/nodes";
import { NodeMetaFields } from "@/components/NodeMetaFields";
import { useEditorStore } from "@/store/editorStore";
import { HaltDimmedContext } from "@/contexts/HaltDimmedContext";

// Shared universal expression builder (F-001) — re-export so existing
// `import { ExpressionInput } from '../BaseNode'` sites keep working.
export {
  ExpressionInput,
  ExpressionVectorInput,
} from "@/components/inputs/ExpressionInput";

interface HandleConfig {
  id: string;
  label: string;
}

interface BaseNodeProps {
  id: string;
  // Core nodes pass a NodeCategory; pack nodes may pass any string category.
  category: string;
  label: string;
  selected?: boolean;
  inputHandles?: HandleConfig[];
  hasOutput?: boolean;
  children?: React.ReactNode;
}

export function BaseNode({
  id,
  category,
  label,
  selected,
  inputHandles = [],
  hasOutput = true,
  children,
}: BaseNodeProps) {
  const headerColor = CATEGORY_COLORS[category];
  const textColor = CATEGORY_TEXT[category];
  const { deleteElements } = useReactFlow();
  const updateNodeData = useEditorStore((s) => s.updateNodeData);

  // Read meta fields individually to avoid creating new object references (prevents infinite re-render)
  const nodeName = useEditorStore(
    (s) =>
      (
        s.nodes.find((n) => n.id === id)?.data as
          | Record<string, unknown>
          | undefined
      )?.nodeName as string | undefined,
  );
  const nodeTags = useEditorStore(
    (s) =>
      (
        s.nodes.find((n) => n.id === id)?.data as
          | Record<string, unknown>
          | undefined
      )?.nodeTags as string[] | undefined,
  );
  const searchMatch = useEditorStore(
    (s) =>
      (
        s.nodes.find((n) => n.id === id)?.data as
          | Record<string, unknown>
          | undefined
      )?._searchMatch as boolean | undefined,
  );
  const isHalted = useEditorStore(
    (s) =>
      (
        s.nodes.find((n) => n.id === id)?.data as
          | Record<string, unknown>
          | undefined
      )?._halted as boolean | undefined,
  );
  const toggleNodeHalted = useEditorStore((s) => s.toggleNodeHalted);
  const dimmedNodeIds = useContext(HaltDimmedContext);
  const isDimmed = dimmedNodeIds.has(id);

  const nodeRef = useRef<HTMLDivElement>(null);

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const onToggleHalt = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeHalted(id);
  };

  // Tab: cycle through inputs within this node; Shift+Tab goes backward
  const handleNodeKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const target = e.target as HTMLElement;
    if (target.tagName !== "INPUT") return;
    const node = nodeRef.current;
    if (!node) return;
    const inputs = Array.from(
      node.querySelectorAll<HTMLInputElement>('input:not([tabindex="-1"])'),
    );
    const idx = inputs.indexOf(target as HTMLInputElement);
    if (idx === -1) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
      if (idx > 0) inputs[idx - 1].focus();
      else target.blur();
    } else {
      if (idx < inputs.length - 1) inputs[idx + 1].focus();
      else target.blur();
    }
  }, []);

  const handleRowGap = 34;
  const handleBottomReserve = 40;
  const inputLabelLaneWidth = inputHandles.length > 0 ? 72 : 0;
  const bodyMinHeight =
    inputHandles.length > 0
      ? inputHandles.length * handleRowGap + handleBottomReserve
      : 96;

  return (
    <div
      ref={nodeRef}
      onKeyDown={handleNodeKeyDown}
      className={`
        rounded-lg shadow-xl border transition-all
        ${
          isHalted
            ? "border-red-500/70 shadow-red-500/20 ring-1 ring-red-500/40"
            : searchMatch
              ? "border-yellow-400 shadow-yellow-400/30 ring-2 ring-yellow-400/60"
              : selected
                ? "border-white/60 shadow-white/20 ring-1 ring-blue-400/50"
                : "border-white/10 shadow-black/40"
        }
        bg-gray-900/95 backdrop-blur-sm
        ${isDimmed ? "opacity-40" : ""}
      `}
      style={{ minWidth: 210 }}
    >
      {/* Header */}
      <div
        className={`${headerColor} ${textColor} px-3 py-1.5 text-xs font-bold tracking-wide uppercase select-none rounded-t-lg flex items-center justify-between`}
      >
        <span>{nodeName || label}</span>
        <div className="flex items-center">
          <button
            onClick={onToggleHalt}
            className={`transition-opacity text-sm leading-none nodrag nopan ${
              isHalted
                ? "opacity-100 text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.6)]"
                : "opacity-30 hover:opacity-60"
            }`}
            title={
              isHalted
                ? "Release halt (render resumes past this node)"
                : "Halt here (render stops at this node)"
            }
          >
            ⏸
          </button>
          <button
            onClick={onDelete}
            className="ml-2 opacity-50 hover:opacity-100 transition-opacity text-sm leading-none nodrag nopan"
            title="Remove node"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Name / Tags */}
      <div className="px-3 pt-1">
        <NodeMetaFields
          id={id}
          nodeName={nodeName}
          nodeTags={nodeTags}
          updateNodeData={
            updateNodeData as (
              id: string,
              data: Record<string, unknown>,
            ) => void
          }
          accentColor="blue"
        />
      </div>

      {/* Body */}
      <div
        className="px-4 pt-2 pb-6 space-y-3 relative"
        style={{ minHeight: bodyMinHeight }}
      >
        {/* Input handles — positioned in the body area */}
        {inputHandles.map((handle, i) => {
          const topOffset =
            inputHandles.length === 1 ? 24 : 14 + i * handleRowGap;
          return (
            <React.Fragment key={handle.id}>
              <Handle
                type="target"
                position={Position.Left}
                id={handle.id}
                style={{ top: `${topOffset + 34}px`, background: "#93c5fd" }}
                className="!w-3.5 !h-3.5 !border-2 !border-slate-300/70 hover:!border-blue-300 !-left-2"
              />
              <div
                className="text-[10px] text-gray-400 absolute left-5 pointer-events-none font-medium tracking-wide"
                style={{ top: `${topOffset + 27}px` }}
              >
                {handle.label}
              </div>
            </React.Fragment>
          );
        })}

        {/* Field content */}
        <div style={{ marginLeft: inputLabelLaneWidth }}>{children}</div>
      </div>

      {/* Output handle */}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          style={{ background: "#60a5fa", top: "50%" }}
          className="!w-3.5 !h-3.5 !border-2 !border-slate-300/70 hover:!border-blue-300 !-right-2"
        />
      )}
    </div>
  );
}

// ─── Shared form widgets ──────────────────────────────────────────────────────

// ─── Number input (pure numeric, no expression) ───────────────────────────────

interface NumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}

export function NumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: NumberInputProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-gray-300 py-0.5">
      <span className="shrink-0 text-gray-400 min-w-[50px]">{label}</span>
      <input
        type="number"
        className="w-[72px] bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 nodrag"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        onFocus={(e) => e.target.select()}
      />
    </label>
  );
}


// ─── Pure number vector input (no expression, for non-OpenSCAD contexts) ─────

interface VectorInputProps {
  label: string;
  value: [number, number, number];
  step?: number;
  onChange: (v: [number, number, number]) => void;
}

export function VectorInput({
  label,
  value,
  step = 1,
  onChange,
}: VectorInputProps) {
  return (
    <div className="text-xs text-gray-300 space-y-1">
      <span className="text-gray-400 text-[10px]">{label}</span>
      <div className="flex gap-1.5">
        {(["x", "y", "z"] as const).map((axis, i) => (
          <label key={axis} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-gray-500 uppercase font-medium">
              {axis}
            </span>
            <input
              type="number"
              className="w-[52px] bg-gray-800 border border-gray-700 rounded px-1 py-1 text-xs text-white text-center focus:outline-none focus:border-blue-500 nodrag"
              value={value[i]}
              step={step}
              onChange={(e) => {
                const next = [...value] as [number, number, number];
                next[i] = parseFloat(e.target.value) || 0;
                onChange(next);
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Checkbox input ───────────────────────────────────────────────────────────

interface CheckboxInputProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function CheckboxInput({ label, value, onChange }: CheckboxInputProps) {
  return (
    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer py-0.5 nodrag">
      <input
        type="checkbox"
        className="accent-blue-500 w-3.5 h-3.5"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-gray-400">{label}</span>
    </label>
  );
}

// ─── Text input ───────────────────────────────────────────────────────────────

interface TextInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function TextInput({ label, value, onChange }: TextInputProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-gray-300 py-0.5">
      <span className="text-gray-400">{label}</span>
      <input
        type="text"
        className="w-full bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 nodrag"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

// ─── File picker input ────────────────────────────────────────────────────────

interface FilePickerInputProps {
  label: string;
  accept: string;
  filename: string;
  onFile: (filename: string, data: ArrayBuffer) => void;
}

export function FilePickerInput({
  label,
  accept,
  filename,
  onFile,
}: FilePickerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        onFile(file.name, reader.result);
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset so the same file can be re-selected if needed
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-1 py-0.5">
      <span className="text-[10px] text-gray-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="flex-1 truncate text-[10px] text-gray-500 bg-gray-800 border border-gray-700 rounded px-1.5 py-1 nodrag">
          {filename || "no file selected"}
        </span>
        <button
          className="shrink-0 text-[10px] bg-gray-700 hover:bg-gray-600 text-gray-200 rounded px-1.5 py-1 nodrag"
          onClick={() => inputRef.current?.click()}
        >
          Browse
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

// ─── Select input ─────────────────────────────────────────────────────────────

interface SelectInputProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

export function SelectInput({
  label,
  value,
  options,
  onChange,
}: SelectInputProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-gray-300 py-0.5">
      <span className="shrink-0 text-gray-400 min-w-[50px]">{label}</span>
      <select
        className="bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 nodrag"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
