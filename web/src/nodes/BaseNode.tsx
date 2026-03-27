import React, { useState, useMemo, useRef } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { NodeCategory, CATEGORY_COLORS, CATEGORY_TEXT } from '@/types/nodes'
import { NodeMetaFields } from '@/components/NodeMetaFields'
import { useEditorStore } from '@/store/editorStore'

interface HandleConfig {
  id: string
  label: string
}

interface BaseNodeProps {
  id: string
  category: NodeCategory
  label: string
  selected?: boolean
  inputHandles?: HandleConfig[]
  hasOutput?: boolean
  children?: React.ReactNode
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
  const headerColor = CATEGORY_COLORS[category]
  const textColor   = CATEGORY_TEXT[category]
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
            ? 'border-white/60 shadow-white/20 ring-1 ring-blue-400/50'
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
          accentColor="blue"
        />
      </div>

      {/* Body */}
      <div className="px-4 pt-2 pb-6 space-y-3 relative" style={{ minHeight: bodyMinHeight }}>
        {/* Input handles — positioned in the body area */}
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
                style={{ top: `${topOffset + 34}px`, background: '#93c5fd' }}
                className="!w-3.5 !h-3.5 !border-2 !border-slate-300/70 hover:!border-blue-300 !-left-2"
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
          style={{ background: '#60a5fa', top: '50%' }}
          className="!w-3.5 !h-3.5 !border-2 !border-slate-300/70 hover:!border-blue-300 !-right-2"
        />
      )}
    </div>
  )
}

// ─── Shared form widgets ──────────────────────────────────────────────────────

// Expr = a raw number OR a freeform OpenSCAD expression string
export type Expr = number | string

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
        className="w-[72px] bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 nodrag"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </label>
  )
}

// ─── Expression-capable inputs ──────────────────────────────────────────────

interface ExpressionInputProps {
  label: string
  value: Expr
  step?: number
  onChange: (v: Expr) => void
}

export function ExpressionInput({ label, value, step = 1, onChange }: ExpressionInputProps) {
  const globalParameters = useEditorStore((s) => s.globalParameters)
  const expr = isExpr(value)
  const inputStr = String(value)

  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const suggestions = useMemo(() => {
    if (!inputStr.trim()) return globalParameters
    const lower = inputStr.toLowerCase()
    return globalParameters.filter((p) => p.name.toLowerCase().includes(lower))
  }, [inputStr, globalParameters])

  const applySuggestion = (name: string) => {
    onChange(name)
    setOpen(false)
    setActiveIdx(-1)
  }

  const handleFocus = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    if (globalParameters.length > 0) setOpen(true)
  }

  const handleBlur = () => {
    hideTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      applySuggestion(suggestions[activeIdx].name)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-gray-300 py-0.5 relative">
      <span className="shrink-0 text-gray-400 min-w-[50px]">{label}</span>
      <div className="relative">
        <input
          type="text"
          className={`w-[72px] bg-gray-800 border rounded px-1.5 py-1 text-xs text-white focus:outline-none nodrag ${
            expr ? 'border-amber-500/60 text-amber-200 focus:border-amber-400' : 'border-gray-700 focus:border-blue-500'
          }`}
          value={inputStr}
          step={step}
          onChange={(e) => { onChange(parseExprChange(e.target.value)); setActiveIdx(-1) }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          title={expr ? 'Expression mode' : 'Number (type an expression for expression mode)'}
        />
        {open && suggestions.length > 0 && (
          <div className="absolute left-0 top-full mt-0.5 z-50 bg-gray-800 border border-gray-600 rounded shadow-xl min-w-[120px] max-h-40 overflow-y-auto nodrag nopan">
            {suggestions.map((p, i) => (
              <div
                key={p.id}
                className={`px-2 py-1 text-[11px] cursor-pointer font-mono flex items-center justify-between gap-2 ${
                  i === activeIdx ? 'bg-blue-600 text-white' : 'text-green-300 hover:bg-gray-700'
                }`}
                onMouseDown={(e) => { e.preventDefault(); applySuggestion(p.name) }}
              >
                <span>{p.name}</span>
                <span className={`text-[9px] ${i === activeIdx ? 'text-blue-200' : 'text-gray-500'}`}>{p.dataType}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </label>
  )
}

interface ExpressionVectorInputProps {
  label: string
  value: [Expr, Expr, Expr]
  step?: number
  onChange: (v: [Expr, Expr, Expr]) => void
}

export function ExpressionVectorInput({ label, value, step = 1, onChange }: ExpressionVectorInputProps) {
  return (
    <div className="text-xs text-gray-300 space-y-1">
      <span className="text-gray-400 text-[10px]">{label}</span>
      <div className="flex gap-1.5">
        {(['x', 'y', 'z'] as const).map((axis, i) => {
          const expr = isExpr(value[i])
          return (
            <label key={axis} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-gray-500 uppercase font-medium">{axis}</span>
              <input
                type="text"
                className={`w-[52px] bg-gray-800 border rounded px-1 py-1 text-xs text-white text-center focus:outline-none nodrag ${
                  expr ? 'border-amber-500/60 text-amber-200 focus:border-amber-400' : 'border-gray-700 focus:border-blue-500'
                }`}
                value={String(value[i])}
                step={step}
                onChange={(e) => {
                  const next = [...value] as [Expr, Expr, Expr]
                  next[i] = parseExprChange(e.target.value)
                  onChange(next)
                }}
                title={expr ? 'Expression mode' : 'Number or expression'}
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}

interface VectorInputProps {
  label: string
  value: [number, number, number]
  step?: number
  onChange: (v: [number, number, number]) => void
}

export function VectorInput({ label, value, step = 1, onChange }: VectorInputProps) {
  return (
    <div className="text-xs text-gray-300 space-y-1">
      <span className="text-gray-400 text-[10px]">{label}</span>
      <div className="flex gap-1.5">
        {(['x', 'y', 'z'] as const).map((axis, i) => (
          <label key={axis} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-gray-500 uppercase font-medium">{axis}</span>
            <input
              type="number"
              className="w-[52px] bg-gray-800 border border-gray-700 rounded px-1 py-1 text-xs text-white text-center focus:outline-none focus:border-blue-500 nodrag"
              value={value[i]}
              step={step}
              onChange={(e) => {
                const next = [...value] as [number, number, number]
                next[i] = parseFloat(e.target.value) || 0
                onChange(next)
              }}
            />
          </label>
        ))}
      </div>
    </div>
  )
}

interface CheckboxInputProps {
  label: string
  value: boolean
  onChange: (v: boolean) => void
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
  )
}

interface TextInputProps {
  label: string
  value: string
  onChange: (v: string) => void
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
  )
}

interface SelectInputProps {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}

export function SelectInput({ label, value, options, onChange }: SelectInputProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-gray-300 py-0.5">
      <span className="shrink-0 text-gray-400 min-w-[50px]">{label}</span>
      <select
        className="bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 nodrag"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}
