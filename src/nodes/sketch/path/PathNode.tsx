import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode } from '../SketchBaseNode'
import type { SketchPathData } from '@/types/sketchNodes'
import { useEditorStore } from '@/store/editorStore'
import React, { useState } from 'react'
import AnchorEditorModal from '@/components/sketch/AnchorEditorModal'
import PathPreview from '@/components/sketch/PathPreview'

export function PathNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchPathData
  const update = useEditorStore((s) => s.updateNodeData)
  const [editing, setEditing] = useState(false)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_primitive"
      label="path"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'anchors' }]}
    >
      <div className="text-xs text-gray-300 mb-2">Anchors (JSON)</div>
      <div className="flex gap-2">
        <button className="px-2 py-1 bg-gray-800 rounded" onClick={() => setEditing(true)}>Edit anchors</button>
        <button className="px-2 py-1 bg-gray-800 rounded" onClick={() => update(id, { anchorsJson: '[]' })}>Clear</button>
      </div>
      <div className="mt-2">
        <PathPreview anchorsJson={d.anchorsJson} closed={d.closed} />
      </div>
      {editing && (
        <AnchorEditorModal
          anchorsJson={d.anchorsJson}
          onClose={() => setEditing(false)}
          onSave={(newJson) => { update(id, { anchorsJson: newJson }); setEditing(false) }}
        />
      )}
      <div className="flex items-center gap-2 mt-2">
        <label className="text-xs text-gray-300">Closed</label>
        <input type="checkbox" checked={!!d.closed} onChange={(e) => update(id, { closed: e.target.checked })} />
      </div>
    </SketchBaseNode>
  )
}
