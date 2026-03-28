import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Handle, Position, useReactFlow, useEdges } from '@xyflow/react'
import type { Expr } from '@/types/nodes'
import { type SketchNodeCategory, SKETCH_CATEGORY_COLORS, SKETCH_CATEGORY_TEXT } from '@/types/sketchNodes'
import { NodeMetaFields } from '@/components/NodeMetaFields'
import { useEditorStore } from '@/store/editorStore'

interface HandleConfig {
  id: string
  label: string
}

interface SketchBaseNodeProps {
  id: string
  category: SketchNodeCategory
  label: string
  selected?: boolean
  inputHandles?: HandleConfig[]
  hasOutput?: boolean
  children?: React.ReactNode
}

export function SketchBaseNode({
  id,
  category,
  label,
  selected,
  inputHandles = [],
  hasOutput = true,
  children,
}: SketchBaseNodeProps) {
  const headerColor = SKETCH_CATEGORY_COLORS[category]
  const textColor   = SKETCH_CATEGORY_TEXT[category]
  const { deleteElements } = useReactFlow()
  const updateNodeData = useEditorStore((s) => s.updateNodeData)

  // Read meta fields individually to avoid creating new object references (prevents infinite re-render)
  const nodeName = useEditorStore((s) => (s.nodes.find((n) => n.id === id)?.data as Record<string, unknown> | undefined)?.nodeName as string | undefined)
  const nodeTags = useEditorStore((s) => (s.nodes.find((n) => n.id === id)?.data as Record<string, unknown> | undefined)?.nodeTags as string[] | undefined)
  const searchMatch = useEditorStore((s) => (s.nodes.find((n) => n.id === id)?.data as Record<string, unknown> | undefined)?._searchMatch as boolean | undefined)

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElements({ nodes: [{ id }] })
  }

  const handleRowGap = 34
  const handleBottomReserve = 40
  const inputLabelLaneWidth = inputHandles.length > 0 ? 72 : 0
  const bodyMinHeight = inputHandles.length > 0
    ? inputHandles.length * handleRowGap + handleBottomReserve
    : 96

  return (
    <div
      className={`
        rounded-lg shadow-xl border transition-all
        ${searchMatch
          ? 'border-yellow-400 shadow-yellow-400/30 ring-2 ring-yellow-400/60'
          : selected
            ? 'border-white/60 shadow-white/20 ring-1 ring-pink-400/50'
            : 'border-white/10 shadow-black/40'}
        bg-gray-900/95 backdrop-blur-sm
      `}
      style={{ minWidth: 210 }}
    >
      {/* Header */}
      <div className={`${headerColor} ${textColor} px-3 py-1.5 text-xs font-bold tracking-wide uppercase select-none rounded-t-lg flex items-center justify-between`}>
        <span>{nodeName || label}</span>
        <button
          onClick={onDelete}
          className="ml-2 opacity-50 hover:opacity-100 transition-opacity text-sm leading-none nodrag nopan"
          title="Remove node"
        >
          ✕
        </button>
      </div>

      {/* Name / Tags */}
      <div className="px-3 pt-1">
        <NodeMetaFields
          id={id}
          nodeName={nodeName}
          nodeTags={nodeTags}
          updateNodeData={updateNodeData as (id: string, data: Record<string, unknown>) => void}
          accentColor="pink"
        />
      </div>

      {/* Body */}
      <div className="px-4 pt-2 pb-6 space-y-3 relative" style={{ minHeight: bodyMinHeight }}>
        {/* Input handles */}
        {inputHandles.map((handle, i) => {
          const topOffset = inputHandles.length === 1
            ? 24
            : 14 + i * handleRowGap
          return (
            <React.Fragment key={handle.id}>
              <Handle
                type="target"
                position={Position.Left}
                id={handle.id}
                style={{ top: `${topOffset + 34}px`, background: '#f9a8d4' }}
                className="!w-3.5 !h-3.5 !border-2 !border-slate-300/70 hover:!border-pink-300 !-left-2"
              />
              <div
                className="text-[10px] text-gray-400 absolute left-5 pointer-events-none font-medium tracking-wide"
                style={{ top: `${topOffset + 27}px` }}
              >
                {handle.label}
              </div>
            </React.Fragment>
          )
        })}

        {/* Field content */}
        <div style={{ marginLeft: inputLabelLaneWidth }}>
          {children}
        </div>
      </div>

      {/* Output handle */}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          style={{ background: '#f472b6', top: '50%' }}
          className="!w-3.5 !h-3.5 !border-2 !border-slate-300/70 hover:!border-pink-300 !-right-2"
        />
      )}
    </div>
  )
}

// ─── Shared form widgets ─────────────────────────────────────────────────────

// Pure-integer fields (sides, segments) keep this component
interface NumberInputProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
}

export function NumberInput({ label, value, min, max, step = 1, onChange }: NumberInputProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-gray-300 py-0.5">
      <span className="shrink-0 text-gray-400 min-w-[50px]">{label}</span>
      <input
        type="number"
        className="w-[72px] bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-pink-500 nodrag"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </label>
  )
}

// ─── Expression input helpers ─────────────────────────────────────────────────

function isExpr(v: Expr): boolean {
  if (typeof v === 'string') {
    const trimmed = v.trim()
    return trimmed !== '' && isNaN(Number(trimmed))
  }
  return false
}

function parseExprChange(raw: string): Expr {
  const n = Number(raw)
  return raw.trim() === '' ? 0 : isNaN(n) ? raw : n
}

function useHandleSource(nodeId: string, handleId: string) {
  const { getNode } = useReactFlow()
  const edges = useEdges()

  if (!nodeId || !handleId) return { connected: false, varName: null }

  const edge = edges.find((e) => e.target === nodeId && e.targetHandle === handleId)
  if (!edge) return { connected: false, varName: null }

  const src = getNode(edge.source)
  if (!src) return { connected: true, varName: null }

  const d = src.data as Record<string, unknown>
  const varName = (d.varName ?? d.parameterName ?? d.argName ?? d.name) as string | undefined
  return { connected: true, varName: varName ?? null }
}

// ─── Dual-mode expression input (number ↔ formula) ───────────────────────────

interface ExpressionInputProps {
  label: string
  value: Expr
  step?: number
  onChange: (v: Expr) => void
  nodeId?: string
  handleId?: string
  min?: number
  max?: number
}

export function ExpressionInput({ label, value, step = 1, onChange, nodeId, handleId, min, max }: ExpressionInputProps) {
  const globalParameters = useEditorStore((s) => s.globalParameters)

  const [localStr, setLocalStr] = useState(String(value))
  const [formulaMode, setFormulaMode] = useState(() => isExpr(value))
  const [isFocused, setIsFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevConnected = useRef(false)

  useEffect(() => {
    if (!isFocused) {
      setLocalStr(String(value))
      if (isExpr(value)) setFormulaMode(true)
    }
  }, [value, isFocused])

  const { connected, varName } = useHandleSource(nodeId ?? '', handleId ?? '')
  useEffect(() => {
    if (connected && varName && !prevConnected.current) {
      setFormulaMode(true)
      setLocalStr(varName)
      onChange(varName)
    }
    prevConnected.current = connected
  }, [connected, varName]) // eslint-disable-line react-hooks/exhaustive-deps

  const flush = () => onChange(parseExprChange(localStr))

  const suggestions = useMemo(() => {
    if (!localStr.trim()) return globalParameters
    const lower = localStr.toLowerCase()
    return globalParameters.filter((p) => p.name.toLowerCase().includes(lower))
  }, [localStr, globalParameters])

  const applySuggestion = (name: string) => {
    setLocalStr(name)
    onChange(name)
    setOpen(false)
    setActiveIdx(-1)
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    if (formulaMode && globalParameters.length > 0) setOpen(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    flush()
    hideTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const handleFormulaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (open && activeIdx >= 0) {
        e.preventDefault()
        applySuggestion(suggestions[activeIdx].name)
      } else {
        flush()
      }
      return
    }
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const toggleFormula = () => {
    if (formulaMode) {
      const n = parseExprChange(localStr)
      setLocalStr(String(n))
      setFormulaMode(false)
      onChange(n)
    } else {
      setFormulaMode(true)
    }
  }

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-gray-300 py-0.5 relative">
      <span className="shrink-0 text-gray-400 min-w-[50px]">{label}</span>
      <div className="flex items-center gap-1">
        <button
          className={`text-[9px] w-4 h-4 rounded flex items-center justify-center transition-colors nodrag nopan font-mono leading-none
            ${formulaMode
              ? 'bg-amber-700/40 text-amber-300 hover:bg-amber-700/60'
              : 'bg-gray-700 text-gray-500 hover:text-amber-300 hover:bg-gray-600'
            }`}
          onClick={(e) => { e.preventDefault(); toggleFormula() }}
          title={formulaMode ? 'Switch to number mode' : 'Switch to formula/expression mode'}
          tabIndex={-1}
        >
          {formulaMode ? '×' : 'ƒ'}
        </button>

        <div className="relative">
          {formulaMode ? (
            <input
              type="text"
              className={`w-[64px] bg-gray-800 rounded px-1.5 py-1 text-xs text-amber-200 focus:outline-none nodrag ${
                connected
                  ? 'border border-gray-700 border-l-2 border-l-pink-400 focus:border-l-pink-300'
                  : 'border border-amber-500/60 focus:border-amber-400'
              }`}
              value={localStr}
              placeholder="expression"
              onChange={(e) => { setLocalStr(e.target.value); setActiveIdx(-1) }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleFormulaKeyDown}
            />
          ) : (
            <input
              type="number"
              className="w-[64px] bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-pink-500 nodrag"
              value={localStr}
              min={min}
              max={max}
              step={step}
              onChange={(e) => {
                const str = e.target.value
                setLocalStr(str)
                if (str.trim() !== '') onChange(parseExprChange(str))
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') flush() }}
            />
          )}

          {formulaMode && open && suggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-0.5 z-50 bg-gray-800 border border-gray-600 rounded shadow-xl min-w-[120px] max-h-40 overflow-y-auto nodrag nopan">
              {suggestions.map((p, i) => (
                <div
                  key={p.id}
                  className={`px-2 py-1 text-[11px] cursor-pointer font-mono flex items-center justify-between gap-2 ${
                    i === activeIdx ? 'bg-pink-700 text-white' : 'text-green-300 hover:bg-gray-700'
                  }`}
                  onMouseDown={(e) => { e.preventDefault(); applySuggestion(p.name) }}
                >
                  <span>{p.name}</span>
                  <span className={`text-[9px] ${i === activeIdx ? 'text-pink-200' : 'text-gray-500'}`}>{p.dataType}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </label>
  )
}

interface CheckboxInputProps {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}

export function CheckboxInput({ label, value, onChange }: CheckboxInputProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-gray-300 py-0.5 cursor-pointer">
      <span className="text-gray-400">{label}</span>
      <input
        type="checkbox"
        className="accent-pink-500 nodrag"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}

interface TextInputProps {
  label: string
  value: string
  onChange: (v: string) => void
}

export function TextInput({ label, value, onChange }: TextInputProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-gray-300 py-0.5">
      <span className="shrink-0 text-gray-400 min-w-[50px]">{label}</span>
      <input
        type="text"
        className="w-[100px] bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-pink-500 nodrag"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
