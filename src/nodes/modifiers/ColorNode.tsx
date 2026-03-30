import { type NodeProps } from '@xyflow/react'
import { BlockPicker, SwatchesPicker } from 'react-color'
import { BaseNode, NumberInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ColorData } from '@/types/nodes'

function clampUnit(v: number): number {
  if (Number.isNaN(v)) return 0
  return Math.max(0, Math.min(1, v))
}

function hexToRgbUnit(hex: string): { r: number; g: number; b: number } {
  const normalized = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#8080cc'
  return {
    r: parseInt(normalized.slice(1, 3), 16) / 255,
    g: parseInt(normalized.slice(3, 5), 16) / 255,
    b: parseInt(normalized.slice(5, 7), 16) / 255,
  }
}

function rgbUnitToHex(r: number, g: number, b: number): string {
  const rr = Math.round(clampUnit(r) * 255).toString(16).padStart(2, '0')
  const gg = Math.round(clampUnit(g) * 255).toString(16).padStart(2, '0')
  const bb = Math.round(clampUnit(b) * 255).toString(16).padStart(2, '0')
  return `#${rr}${gg}${bb}`
}

export function ColorNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ColorData
  const update = useEditorStore((s) => s.updateNodeData)

  const hexColor = /^#[0-9a-fA-F]{6}$/.test(d.hex)
    ? d.hex
    : rgbUnitToHex(d.r, d.g, d.b)

  const setHexColor = (hex: string) => {
    const { r, g, b } = hexToRgbUnit(hex)
    update(id, { hex, r, g, b })
  }

  const setRgb = (r: number, g: number, b: number) => {
    update(id, {
      r: clampUnit(r),
      g: clampUnit(g),
      b: clampUnit(b),
      hex: rgbUnitToHex(r, g, b),
    })
  }

  return (
    <BaseNode id={id} category="modifier" label="color" selected={selected}
      inputHandles={[{ id: 'in-0', label: 'child' }, { id: 'in-1', label: 'color' }, { id: 'in-2', label: 'alpha' }]}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">pick</span>
          <input
            type="color"
            className="w-8 h-6 rounded cursor-pointer bg-transparent border-0"
            value={hexColor}
            onChange={(e) => setHexColor(e.target.value)}
          />
          <input
            type="text"
            value={hexColor}
            onChange={(e) => setHexColor(e.target.value.trim())}
            className="w-[86px] bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none focus:border-blue-500 nodrag"
            placeholder="#RRGGBB"
          />
          <button
            type="button"
            onClick={() => update(id, { advanced: !d.advanced })}
            className="nodrag rounded border border-gray-600 px-2 py-0.5 text-[10px] text-gray-300 hover:border-blue-400 hover:text-blue-300"
            title="Toggle advanced picker"
          >
            {d.advanced ? 'Basic' : 'Advanced'}
          </button>
        </div>

        {d.advanced && (
          <div className="space-y-2">
            <div className="rounded border border-gray-700 bg-gray-900 p-1">
              <BlockPicker
                color={hexColor}
                onChange={(c) => setHexColor(c.hex)}
                triangle="hide"
              />
            </div>
            <div className="rounded border border-gray-700 bg-gray-900 p-1">
              <SwatchesPicker
                color={hexColor}
                onChange={(c) => setHexColor(c.hex)}
              />
            </div>
          </div>
        )}
      </div>

      <NumberInput label="R" value={parseFloat(d.r.toFixed(3))} min={0} max={1} step={0.05} onChange={(v) => setRgb(v, d.g, d.b)} />
      <NumberInput label="G" value={parseFloat(d.g.toFixed(3))} min={0} max={1} step={0.05} onChange={(v) => setRgb(d.r, v, d.b)} />
      <NumberInput label="B" value={parseFloat(d.b.toFixed(3))} min={0} max={1} step={0.05} onChange={(v) => setRgb(d.r, d.g, v)} />
      <NumberInput label="A" value={parseFloat(Number(d.alpha).toFixed(3))} min={0} max={1} step={0.05} onChange={(v) => update(id, { alpha: clampUnit(v) })} />

      <div className="text-[10px] text-gray-500 leading-snug">
        Colors can be hex (`#RRGGBB`) or a variable via `color` input.
      </div>
    </BaseNode>
  )
}
