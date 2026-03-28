import React, { useState } from 'react'

export function AnchorEditorModal({
  anchorsJson,
  onClose,
  onSave,
}: {
  anchorsJson: string
  onClose: () => void
  onSave: (newJson: string) => void
}) {
  let parsed: Array<{ id?: string; pos: [number, number]; handleIn?: [number, number] | null; handleOut?: [number, number] | null; kind?: string }> = []
  try { parsed = JSON.parse(anchorsJson || '[]') } catch { parsed = [] }
  const [anchors, setAnchors] = useState(parsed)

  const updateAnchor = (i: number, key: string, value: any) => {
    const next = anchors.slice()
    // @ts-ignore
    next[i][key] = value
    setAnchors(next)
  }

  const addAnchor = () => setAnchors([...anchors, { id: `a${anchors.length}`, pos: [0, 0], handleIn: null, handleOut: null, kind: 'corner' }])
  const removeAnchor = (i: number) => setAnchors(anchors.filter((_, idx) => idx !== i))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-white/10 rounded p-4 w-[560px] max-h-[80vh] overflow-auto text-sm text-gray-200">
        <div className="flex items-center justify-between mb-3">
          <strong>Anchor Editor</strong>
          <div className="flex gap-2">
            <button className="px-2 py-1 bg-gray-800 rounded" onClick={() => onSave(JSON.stringify(anchors))}>Save</button>
            <button className="px-2 py-1 bg-gray-800 rounded" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="space-y-3">
          {anchors.map((a, i) => (
            <div key={i} className="bg-gray-800 p-2 rounded">
              <div className="flex items-center justify-between">
                <div className="text-xs">Anchor {i} ({a.id ?? ''})</div>
                <button className="text-xs text-red-400" onClick={() => removeAnchor(i)}>Delete</button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400">X</label>
                  <input className="w-full bg-gray-700 rounded p-1 text-sm" value={String(a.pos[0])} onChange={(e) => updateAnchor(i, 'pos', [Number(e.target.value || 0), a.pos[1]])} />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400">Y</label>
                  <input className="w-full bg-gray-700 rounded p-1 text-sm" value={String(a.pos[1])} onChange={(e) => updateAnchor(i, 'pos', [a.pos[0], Number(e.target.value || 0)])} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <button className="px-3 py-1 bg-teal-600 rounded" onClick={addAnchor}>Add Anchor</button>
        </div>
      </div>
    </div>
  )
}

export default AnchorEditorModal
