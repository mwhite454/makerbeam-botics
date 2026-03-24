import { type NodeProps } from '@xyflow/react'
import { BaseNode, NumberInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ColorData } from '@/types/nodes'

export function ColorNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ColorData
  const update = useEditorStore((s) => s.updateNodeData)

  const hexColor = `#${Math.round(d.r * 255).toString(16).padStart(2, '0')}${Math.round(d.g * 255).toString(16).padStart(2, '0')}${Math.round(d.b * 255).toString(16).padStart(2, '0')}`

  return (
    <BaseNode id={id} category="modifier" label="color" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }]}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-gray-400">pick</span>
        <input
          type="color"
          className="w-8 h-6 rounded cursor-pointer bg-transparent border-0"
          value={hexColor}
          onChange={(e) => {
            const hex = e.target.value
            const r = parseInt(hex.slice(1, 3), 16) / 255
            const g = parseInt(hex.slice(3, 5), 16) / 255
            const b = parseInt(hex.slice(5, 7), 16) / 255
            update(id, { r, g, b })
          }}
        />
      </div>
      <NumberInput label="R" value={parseFloat(d.r.toFixed(3))} min={0} max={1} step={0.05} onChange={(v) => update(id, { r: v })} />
      <NumberInput label="G" value={parseFloat(d.g.toFixed(3))} min={0} max={1} step={0.05} onChange={(v) => update(id, { g: v })} />
      <NumberInput label="B" value={parseFloat(d.b.toFixed(3))} min={0} max={1} step={0.05} onChange={(v) => update(id, { b: v })} />
      <NumberInput label="A" value={parseFloat(d.alpha.toFixed(3))} min={0} max={1} step={0.05} onChange={(v) => update(id, { alpha: v })} />
    </BaseNode>
  )
}
