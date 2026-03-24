import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { NodeCategory, CATEGORY_COLORS, CATEGORY_TEXT } from '@/types/nodes'

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

  return (
    <div
      className={`
        rounded-lg overflow-hidden shadow-xl border transition-all min-w-[180px]
        ${selected
          ? 'border-white/60 shadow-white/20'
          : 'border-white/10 shadow-black/40'}
        bg-gray-900/95 backdrop-blur-sm
      `}
    >
      {/* Header */}
      <div className={`${headerColor} ${textColor} px-3 py-1.5 text-xs font-bold tracking-wide uppercase`}>
        {label}
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5 relative">
        {/* Input handles */}
        {inputHandles.map((handle, i) => {
          const topPct = inputHandles.length === 1
            ? 50
            : 20 + (i / (inputHandles.length - 1)) * 60
          return (
            <React.Fragment key={handle.id}>
              <Handle
                type="target"
                position={Position.Left}
                id={handle.id}
                style={{ top: `${topPct}%`, background: '#94a3b8' }}
                className="!w-2.5 !h-2.5 !border-2 !border-gray-700"
              />
              <div
                className="text-[10px] text-gray-400 absolute left-3"
                style={{ top: `calc(${topPct}% - 7px)` }}
              >
                {handle.label}
              </div>
            </React.Fragment>
          )
        })}

        {/* Field content — push left to avoid handle overlap */}
        <div className={inputHandles.length > 0 ? 'ml-2' : ''}>
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
          className="!w-2.5 !h-2.5 !border-2 !border-gray-700"
        />
      )}
    </div>
  )
}

// ─── Shared form widgets ──────────────────────────────────────────────────────

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
    <label className="flex items-center gap-2 text-xs text-gray-300">
      <span className="w-14 shrink-0 text-gray-400">{label}</span>
      <input
        type="number"
        className="w-20 bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-blue-500"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </label>
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
    <div className="text-xs text-gray-300 space-y-0.5">
      <span className="text-gray-400 text-[10px]">{label}</span>
      <div className="flex gap-1">
        {(['x', 'y', 'z'] as const).map((axis, i) => (
          <label key={axis} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-gray-500 uppercase">{axis}</span>
            <input
              type="number"
              className="w-14 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
      <input
        type="checkbox"
        className="accent-blue-500"
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
    <label className="flex flex-col gap-0.5 text-xs text-gray-300">
      <span className="text-gray-400">{label}</span>
      <input
        type="text"
        className="bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
    <label className="flex items-center gap-2 text-xs text-gray-300">
      <span className="w-14 shrink-0 text-gray-400">{label}</span>
      <select
        className="bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}
