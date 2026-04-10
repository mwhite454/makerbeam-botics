import React, { useRef, useCallback } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { type SketchNodeCategory, SKETCH_CATEGORY_COLORS, SKETCH_CATEGORY_TEXT } from '@/types/sketchNodes'
import { NodeMetaFields } from '@/components/NodeMetaFields'
import { useEditorStore } from '@/store/editorStore'
import {
  ExpressionInput as BaseExpressionInput,
  ExpressionVectorInput as BaseExpressionVectorInput,
} from '@/components/inputs/ExpressionInput'

// Re-export shared universal expression builder with sketch's pink accent so
// existing `import { ExpressionInput } from '../SketchBaseNode'` sites keep working.
export function ExpressionInput(
  props: Omit<React.ComponentProps<typeof BaseExpressionInput>, 'accent'>,
) {
  return <BaseExpressionInput {...props} accent="pink" />
}

export function ExpressionVectorInput(
  props: Omit<React.ComponentProps<typeof BaseExpressionVectorInput>, 'accent'>,
) {
  return <BaseExpressionVectorInput {...props} accent="pink" />
}

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

  const nodeRef = useRef<HTMLDivElement>(null)

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElements({ nodes: [{ id }] })
  }

  // Tab: cycle through inputs within this node; Shift+Tab goes backward
  const handleNodeKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const target = e.target as HTMLElement
    if (target.tagName !== 'INPUT') return
    const node = nodeRef.current
    if (!node) return
    const inputs = Array.from(node.querySelectorAll<HTMLInputElement>('input:not([tabindex="-1"])'))
    const idx = inputs.indexOf(target as HTMLInputElement)
    if (idx === -1) return
    e.preventDefault()
    e.stopPropagation()
    if (e.shiftKey) {
      if (idx > 0) inputs[idx - 1].focus()
      else target.blur()
    } else {
      if (idx < inputs.length - 1) inputs[idx + 1].focus()
      else target.blur()
    }
  }, [])

  const handleRowGap = 34
  const handleBottomReserve = 40
  const inputLabelLaneWidth = inputHandles.length > 0 ? 72 : 0
  const bodyMinHeight = inputHandles.length > 0
    ? inputHandles.length * handleRowGap + handleBottomReserve
    : 96

  return (
    <div
      ref={nodeRef}
      onKeyDown={handleNodeKeyDown}
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
        onFocus={(e) => e.target.select()}
      />
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
