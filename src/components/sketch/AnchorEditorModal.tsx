import React, { useState } from 'react'
import type { Expr } from '@/types/nodes'
import { ExpressionInput } from '@/nodes/sketch/SketchBaseNode'

type AnchorPos = [Expr, Expr]

type Anchor = {
  id?: string
  pos: AnchorPos
  handleIn?: [number, number] | null
  handleOut?: [number, number] | null
  kind?: string
}

export function AnchorEditorModal({
  anchorsJson,
  onClose,
  onSave,
}: {
  anchorsJson: string
  onClose: () => void
  onSave: (newJson: string) => void
}) {
  let parsed: Anchor[] = []
  try { parsed = JSON.parse(anchorsJson || '[]') } catch { parsed = [] }
  const [anchors, setAnchors] = useState<Anchor[]>(parsed)

  const updatePos = (i: number, axis: 0 | 1, value: Expr) => {
    const next = anchors.slice()
    const pos: AnchorPos = [next[i].pos[0], next[i].pos[1]]
    pos[axis] = value
    next[i] = { ...next[i], pos }
    setAnchors(next)
  }

  const addAnchor = () =>
    setAnchors([...anchors, { id: `a${anchors.length}`, pos: [0, 0], handleIn: null, handleOut: null, kind: 'corner' }])

  const removeAnchor = (i: number) => setAnchors(anchors.filter((_, idx) => idx !== i))

  const moveUp = (i: number) => {
    if (i === 0) return
    const next = anchors.slice()
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    setAnchors(next)
  }

  const moveDown = (i: number) => {
    if (i === anchors.length - 1) return
    const next = anchors.slice()
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    setAnchors(next)
  }

  return (
    // Full-screen backdrop — click outside the drawer to close
    <div className="fixed inset-0 z-50 flex pointer-events-auto" onClick={onClose}>
      {/* Left-side drawer — stops click propagation so backdrop doesn't fire */}
      <div
        className="relative w-72 h-full bg-gray-900 border-r border-white/10 flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold text-white">Anchor Editor</span>
          <div className="flex gap-2">
            <button
              className="text-[11px] px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded transition-colors"
              onClick={() => onSave(JSON.stringify(anchors))}
            >
              Save
            </button>
            <button
              className="text-[11px] px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Anchor list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {anchors.length === 0 && (
            <p className="text-xs text-gray-500 text-center pt-6">No anchors yet. Click "Add Anchor" below.</p>
          )}
          {anchors.map((a, i) => (
            <div key={i} className="bg-gray-800 rounded p-2">
              {/* Row header */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-gray-400 font-medium">
                  Anchor {i}{a.id ? ` · ${a.id}` : ''}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    className="text-[10px] w-5 h-5 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-30"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    title="Move up"
                  >▲</button>
                  <button
                    className="text-[10px] w-5 h-5 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-30"
                    onClick={() => moveDown(i)}
                    disabled={i === anchors.length - 1}
                    title="Move down"
                  >▼</button>
                  <button
                    className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/40 hover:bg-red-800/60 text-red-400 hover:text-red-300 transition-colors"
                    onClick={() => removeAnchor(i)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* X / Y inputs using the shared ExpressionInput */}
              <div className="space-y-0.5">
                <ExpressionInput
                  label="X"
                  value={a.pos[0]}
                  onChange={(v) => updatePos(i, 0, v)}
                />
                <ExpressionInput
                  label="Y"
                  value={a.pos[1]}
                  onChange={(v) => updatePos(i, 1, v)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-white/10 shrink-0">
          <button
            className="w-full text-[11px] py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded transition-colors"
            onClick={addAnchor}
          >
            + Add Anchor
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnchorEditorModal
