// F-001: Universal Expression Builder
// Single, shared implementation used by every node input (core + sketch).
// Features: scope-aware autosuggest, live preview, Ctrl+M formula/number toggle,
// long-click cursor placement, Enter→Tab advance, edge auto-fill.

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useReactFlow, useEdges } from "@xyflow/react";
import type { Expr } from "@/types/nodes";
import { useScopeVariables } from "@/utils/scopeResolver";
import { evaluateExpression } from "@/utils/evaluateExpression";
import { usePreferencesStore } from "@/store/preferencesStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function isExpr(v: Expr): boolean {
  if (typeof v === "string") {
    const trimmed = v.trim();
    return trimmed !== "" && isNaN(Number(trimmed));
  }
  return false;
}

export function parseExprChange(raw: string): Expr {
  const n = Number(raw);
  return raw.trim() === "" ? 0 : isNaN(n) ? raw : n;
}

// Edge auto-detection: if a handle is wired, return the source node's variable name
export function useHandleSource(nodeId: string, handleId: string) {
  const { getNode } = useReactFlow();
  const edges = useEdges();

  if (!nodeId || !handleId) return { connected: false, varName: null };

  const edge = edges.find(
    (e) => e.target === nodeId && e.targetHandle === handleId,
  );
  if (!edge) return { connected: false, varName: null };

  const src = getNode(edge.source);
  if (!src) return { connected: true, varName: null };

  const d = src.data as Record<string, unknown>;
  const varName = (d.varName ?? d.parameterName ?? d.argName ?? d.name) as
    | string
    | undefined;
  return { connected: true, varName: varName ?? null };
}

// ─── Accent palette ──────────────────────────────────────────────────────────

export type ExpressionAccent = "blue" | "pink";

interface AccentClasses {
  connectedBorder: string;
  activeSuggestion: string;
  activeSuggestionDim: string;
  numberFocus: string;
}

const ACCENT: Record<ExpressionAccent, AccentClasses> = {
  blue: {
    connectedBorder:
      "border border-gray-700 border-l-2 border-l-blue-400 focus:border-l-blue-300",
    activeSuggestion: "bg-blue-600 text-white",
    activeSuggestionDim: "text-blue-200",
    numberFocus: "focus:border-blue-500",
  },
  pink: {
    connectedBorder:
      "border border-gray-700 border-l-2 border-l-pink-400 focus:border-l-pink-300",
    activeSuggestion: "bg-pink-700 text-white",
    activeSuggestionDim: "text-pink-200",
    numberFocus: "focus:border-pink-500",
  },
};

// ─── Universal Expression Builder ────────────────────────────────────────────

interface ExpressionInputProps {
  label: string;
  value: Expr;
  step?: number;
  onChange: (v: Expr) => void;
  nodeId?: string;
  handleId?: string;
  min?: number;
  max?: number;
  /** When true, always start in formula mode and hide the number toggle (e.g. for IF conditions). */
  forceFormula?: boolean;
  /** Input width class override */
  widthClass?: string;
  /** Visual accent — blue for core nodes, pink for sketch nodes. */
  accent?: ExpressionAccent;
}

export function ExpressionInput({
  label,
  value,
  step = 1,
  onChange,
  nodeId,
  handleId,
  min,
  max,
  forceFormula,
  widthClass = "w-[64px]",
  accent = "blue",
}: ExpressionInputProps) {
  const scopeVars = useScopeVariables();
  const longClickThreshold = usePreferencesStore((s) => s.longClickThresholdMs);
  const accentCls = ACCENT[accent];

  const [localStr, setLocalStr] = useState(String(value));
  // R1: expression builder is the default mode for every input.
  const [formulaMode, setFormulaMode] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [previewValue, setPreviewValue] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevConnected = useRef(false);
  const longClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongClick = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external changes (e.g., edge auto-fill) to local display — skip while focused
  useEffect(() => {
    if (!isFocused) {
      setLocalStr(String(value));
      if (isExpr(value)) setFormulaMode(true);
    }
  }, [value, isFocused]);

  // Edge auto-detection
  const { connected, varName } = useHandleSource(nodeId ?? "", handleId ?? "");
  useEffect(() => {
    if (connected && varName && !prevConnected.current) {
      setFormulaMode(true);
      setLocalStr(varName);
      onChange(varName);
    }
    prevConnected.current = connected;
  }, [connected, varName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live preview evaluation (debounced)
  useEffect(() => {
    if (!formulaMode || !isFocused) {
      setPreviewValue(null);
      return;
    }
    const timer = setTimeout(() => {
      const result = evaluateExpression(localStr, scopeVars);
      setPreviewValue(result);
    }, 200);
    return () => clearTimeout(timer);
  }, [localStr, formulaMode, isFocused, scopeVars]);

  const flush = () => onChange(parseExprChange(localStr));

  // Scope-aware suggestions: global params + loop vars + module args
  const suggestions = useMemo(() => {
    if (scopeVars.length === 0) return [];
    if (!localStr.trim()) return scopeVars;
    const lower = localStr.toLowerCase();
    return scopeVars.filter((v) => v.name.toLowerCase().includes(lower));
  }, [localStr, scopeVars]);

  const applySuggestion = (name: string) => {
    setLocalStr(name);
    onChange(name);
    setOpen(false);
    setActiveIdx(-1);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (formulaMode && scopeVars.length > 0) setOpen(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    flush();
    hideTimer.current = setTimeout(() => setOpen(false), 150);
  };

  // Long-click detection: mouseDown starts a timer; short click selects all
  const handleMouseDown = useCallback(() => {
    isLongClick.current = false;
    longClickTimer.current = setTimeout(() => {
      isLongClick.current = true;
    }, longClickThreshold);
  }, [longClickThreshold]);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (longClickTimer.current) {
        clearTimeout(longClickTimer.current);
        longClickTimer.current = null;
      }
      if (!isLongClick.current) {
        e.currentTarget.select();
      }
    },
    [],
  );

  const toggleFormula = () => {
    if (forceFormula) return;
    if (formulaMode) {
      const n = parseExprChange(localStr);
      setLocalStr(String(n));
      setFormulaMode(false);
      onChange(n);
    } else {
      setFormulaMode(true);
    }
  };

  const handleFormulaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key === "m" && !forceFormula) {
      e.preventDefault();
      toggleFormula();
      return;
    }
    if (e.key === "Enter") {
      if (open && activeIdx >= 0) {
        e.preventDefault();
        applySuggestion(suggestions[activeIdx].name);
      } else {
        flush();
        e.currentTarget.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
        );
      }
      return;
    }
    if (e.key === "Tab") {
      if (open && activeIdx >= 0) {
        e.preventDefault();
        applySuggestion(suggestions[activeIdx].name);
        return;
      }
    }
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const kindIcon = (kind: string) => {
    switch (kind) {
      case "global":
        return "G";
      case "loop":
        return "L";
      case "module_arg":
        return "A";
      default:
        return "";
    }
  };

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-gray-300 py-0.5 relative">
      <span className="shrink-0 text-gray-400 min-w-[50px]">{label}</span>
      <div className="flex items-center gap-1">
        {/* Formula/number mode toggle */}
        {!forceFormula && (
          <button
            className={`text-[9px] w-4 h-4 rounded flex items-center justify-center transition-colors nodrag nopan font-mono leading-none
              ${
                formulaMode
                  ? "bg-amber-700/40 text-amber-300 hover:bg-amber-700/60"
                  : "bg-gray-700 text-gray-500 hover:text-amber-300 hover:bg-gray-600"
              }`}
            onClick={(e) => {
              e.preventDefault();
              toggleFormula();
            }}
            title={
              formulaMode
                ? "Switch to number mode (Ctrl+M)"
                : "Switch to formula/expression mode (Ctrl+M)"
            }
            tabIndex={-1}
          >
            {formulaMode ? "×" : "ƒ"}
          </button>
        )}

        <div className="relative">
          {formulaMode ? (
            <input
              ref={inputRef}
              type="text"
              className={`${widthClass} bg-gray-800 rounded px-1.5 py-1 text-xs font-mono text-amber-200 focus:outline-none nodrag ${
                connected
                  ? accentCls.connectedBorder
                  : "border border-amber-500/60 focus:border-amber-400"
              }`}
              value={localStr}
              placeholder="e.g. i*2"
              title="OpenSCAD expression"
              onChange={(e) => {
                setLocalStr(e.target.value);
                setActiveIdx(-1);
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onKeyDown={handleFormulaKeyDown}
            />
          ) : (
            <input
              type="number"
              className={`${widthClass} bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-white focus:outline-none ${accentCls.numberFocus} nodrag`}
              value={localStr}
              min={min}
              max={max}
              step={step}
              onChange={(e) => {
                const str = e.target.value;
                setLocalStr(str);
                if (str.trim() !== "") onChange(parseExprChange(str));
              }}
              onFocus={(e) => {
                setIsFocused(true);
                e.target.select();
              }}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "m") {
                  e.preventDefault();
                  toggleFormula();
                  return;
                }
                if (e.key === "Enter") {
                  flush();
                  e.currentTarget.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
                  );
                }
              }}
            />
          )}

          {/* Value preview badge */}
          {formulaMode && isFocused && previewValue !== null && (
            <div className="absolute right-0 -top-5 z-50 bg-gray-700 border border-gray-600 rounded px-1.5 py-0.5 text-[10px] font-mono text-green-300 whitespace-nowrap pointer-events-none shadow-lg">
              = {previewValue}
            </div>
          )}

          {/* Autosuggest dropdown — scope-aware */}
          {formulaMode && open && suggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-0.5 z-50 bg-gray-800 border border-gray-600 rounded shadow-xl min-w-[140px] max-h-40 overflow-y-auto nodrag nopan">
              {suggestions.map((sv, i) => (
                <div
                  key={`${sv.kind}-${sv.name}`}
                  className={`px-2 py-1 text-[11px] cursor-pointer font-mono flex items-center justify-between gap-2 ${
                    i === activeIdx
                      ? accentCls.activeSuggestion
                      : "text-green-300 hover:bg-gray-700"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applySuggestion(sv.name);
                  }}
                  title={
                    sv.currentValue !== undefined
                      ? `Current value: ${sv.currentValue}`
                      : undefined
                  }
                >
                  <span className="flex items-center gap-1">
                    <span
                      className={`text-[8px] w-3 text-center ${
                        i === activeIdx
                          ? accentCls.activeSuggestionDim
                          : "text-gray-500"
                      }`}
                    >
                      {kindIcon(sv.kind)}
                    </span>
                    <span>{sv.name}</span>
                  </span>
                  <span
                    className={`text-[9px] ${
                      i === activeIdx
                        ? accentCls.activeSuggestionDim
                        : "text-gray-500"
                    }`}
                  >
                    {sv.dataType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </label>
  );
}

// ─── Per-axis field for vector inputs ────────────────────────────────────────

interface AxisFieldProps {
  axis: "x" | "y" | "z";
  value: Expr;
  step: number;
  nodeId?: string;
  handleId?: string;
  onChange: (v: Expr) => void;
  accent?: ExpressionAccent;
}

function AxisField({
  axis,
  value,
  step,
  nodeId,
  handleId,
  onChange,
  accent = "blue",
}: AxisFieldProps) {
  const accentCls = ACCENT[accent];
  const [localStr, setLocalStr] = useState(String(value));
  // R1: default to formula mode.
  const [formulaMode, setFormulaMode] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const prevConnected = useRef(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalStr(String(value));
      if (isExpr(value)) setFormulaMode(true);
    }
  }, [value, isFocused]);

  const { connected, varName } = useHandleSource(nodeId ?? "", handleId ?? "");
  useEffect(() => {
    if (connected && varName && !prevConnected.current) {
      setFormulaMode(true);
      setLocalStr(varName);
      onChange(varName);
    }
    prevConnected.current = connected;
  }, [connected, varName]); // eslint-disable-line react-hooks/exhaustive-deps

  const flush = () => onChange(parseExprChange(localStr));

  const toggleFormula = () => {
    if (formulaMode) {
      const n = parseExprChange(localStr);
      setLocalStr(String(n));
      setFormulaMode(false);
      onChange(n);
    } else {
      setFormulaMode(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-0.5">
        <span className="text-[9px] text-gray-500 uppercase font-medium">
          {axis}
        </span>
        <button
          className={`text-[8px] w-3 h-3 rounded flex items-center justify-center transition-colors nodrag nopan font-mono leading-none
            ${
              formulaMode
                ? "bg-amber-700/40 text-amber-300 hover:bg-amber-700/60"
                : "bg-gray-700/50 text-gray-600 hover:text-amber-300"
            }`}
          onClick={(e) => {
            e.preventDefault();
            toggleFormula();
          }}
          title={formulaMode ? "Number mode" : "Formula mode"}
          tabIndex={-1}
        >
          {formulaMode ? "×" : "ƒ"}
        </button>
      </div>
      {formulaMode ? (
        <input
          type="text"
          className={`w-[48px] bg-gray-800 rounded px-1 py-1 text-xs text-amber-200 text-center focus:outline-none nodrag border ${
            connected
              ? accentCls.connectedBorder
              : "border-amber-500/60 focus:border-amber-400"
          }`}
          value={localStr}
          placeholder="expr"
          onChange={(e) => setLocalStr(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            flush();
          }}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "m") {
              e.preventDefault();
              toggleFormula();
              return;
            }
            if (e.key === "Enter") {
              flush();
              e.currentTarget.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
              );
            }
          }}
        />
      ) : (
        <input
          type="number"
          className={`w-[48px] bg-gray-800 border border-gray-700 rounded px-1 py-1 text-xs text-white text-center focus:outline-none ${accentCls.numberFocus} nodrag`}
          value={localStr}
          step={step}
          onChange={(e) => {
            const str = e.target.value;
            setLocalStr(str);
            if (str.trim() !== "") onChange(parseExprChange(str));
          }}
          onFocus={(e) => {
            setIsFocused(true);
            e.target.select();
          }}
          onBlur={() => {
            setIsFocused(false);
            flush();
          }}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "m") {
              e.preventDefault();
              toggleFormula();
              return;
            }
            if (e.key === "Enter") {
              flush();
              e.currentTarget.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
              );
            }
          }}
        />
      )}
    </div>
  );
}

// ─── Vector expression input ─────────────────────────────────────────────────

interface ExpressionVectorInputProps {
  label: string;
  value: [Expr, Expr, Expr];
  step?: number;
  onChange: (v: [Expr, Expr, Expr]) => void;
  nodeId?: string;
  handleIds?: [string, string, string];
  accent?: ExpressionAccent;
}

export function ExpressionVectorInput({
  label,
  value,
  step = 1,
  onChange,
  nodeId,
  handleIds,
  accent = "blue",
}: ExpressionVectorInputProps) {
  return (
    <div className="text-xs text-gray-300 space-y-1">
      <span className="text-gray-400 text-[10px]">{label}</span>
      <div className="flex gap-1.5">
        {(["x", "y", "z"] as const).map((axis, i) => (
          <AxisField
            key={axis}
            axis={axis}
            value={value[i]}
            step={step}
            nodeId={nodeId}
            handleId={handleIds?.[i]}
            accent={accent}
            onChange={(v) => {
              const next = [...value] as [Expr, Expr, Expr];
              next[i] = v;
              onChange(next);
            }}
          />
        ))}
      </div>
    </div>
  );
}
