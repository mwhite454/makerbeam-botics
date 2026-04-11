import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, ExpressionInput } from '../SketchBaseNode'
import type { SketchPathLayoutData } from '@/types/sketchNodes'
import { useEditorStore } from '@/store/editorStore'

export function PathLayoutNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchPathLayoutData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <SketchBaseNode
      id={id}
      category="sketch_control"
      label="layout"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'template' }, { id: 'in-1', label: 'path' }]}
    >
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-300">Mode</label>
        <select value={d.mode} onChange={(e) => update(id, { mode: e.target.value as any })} className="bg-gray-800 text-sm text-gray-200 rounded p-1">
          <option value="count">count</option>
          <option value="distance">distance</option>
        </select>
      </div>

      {d.mode === 'count' ? (
        <ExpressionInput
          label="count"
          value={d.count}
          step={1}
          min={1}
          onChange={(v) => update(id, { count: v })}
        />
      ) : (
        <ExpressionInput
          label="distance"
          value={d.distance}
          step={0.5}
          min={0}
          onChange={(v) => update(id, { distance: v })}
        />
      )}

      <div className="mt-2">
        <label className="text-xs text-gray-300">Orientation</label>
        <select value={d.orientation} onChange={(e) => update(id, { orientation: e.target.value as any })} className="ml-2 bg-gray-800 text-sm text-gray-200 rounded p-1">
          <option value="tangent">tangent</option>
          <option value="normal">normal</option>
          <option value="fixed">fixed</option>
        </select>
      </div>

      <ExpressionInput
        label="offset"
        value={d.offset}
        step={0.5}
        min={-1000}
        onChange={(v) => update(id, { offset: v })}
      />
    </SketchBaseNode>
  )
}
