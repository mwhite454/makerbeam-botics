import { useMemo } from 'react'
import { type NodeProps } from '@xyflow/react'
import { BaseNode, SelectInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { SketchProfileData } from '@/types/nodes'

export function SketchProfileNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchProfileData
  const update = useEditorStore((s) => s.updateNodeData)
  const tabs = useEditorStore((s) => s.tabs)
  const addTab = useEditorStore((s) => s.addTab)

  const sketchNames = useMemo(
    () =>
      tabs
        .filter((t) => t.tabType === 'sketch')
        .map((t) => t.sketchName)
        .filter((name) => name.trim().length > 0),
    [tabs],
  )

  const activeSketchName = sketchNames.includes(d.sketchName)
    ? d.sketchName
    : (sketchNames[0] ?? '')

  const handleCreateSketch = () => {
    const name = `sketch_${tabs.filter((t) => t.tabType === 'sketch').length + 1}`
    update(id, { sketchName: name.toLowerCase().replace(/[^a-z0-9_]/g, '_') })
    addTab(name, 'sketch')
  }

  return (
    <BaseNode
      id={id}
      category="primitive2d"
      label="sketch profile"
      selected={selected}
      inputHandles={[]}
    >
      {sketchNames.length > 0 ? (
        <SelectInput
          label="sketch"
          value={activeSketchName}
          options={sketchNames}
          onChange={(v) => update(id, { sketchName: v })}
        />
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400">No sketches defined</span>
          <button
            className="text-[10px] px-2 py-0.5 rounded bg-pink-600 hover:bg-pink-500 text-white transition-colors"
            onClick={handleCreateSketch}
          >
            + Create Sketch
          </button>
        </div>
      )}
    </BaseNode>
  )
}
