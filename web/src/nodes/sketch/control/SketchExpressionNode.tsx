import type { NodeProps } from '@xyflow/react'
import { SketchBaseNode, TextInput } from '../SketchBaseNode'
import type { SketchExpressionData } from '@/types/sketchNodes'
import { useSketchStore } from '@/store/sketchStore'
import { useEditorStore } from '@/store/editorStore'

function asIdentifier(raw: string): string {
  const sanitized = raw.trim().replace(/[^a-zA-Z0-9_]/g, '_')
  return /^[a-zA-Z_]/.test(sanitized) ? sanitized : ''
}

export function SketchExpressionNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as SketchExpressionData
  const update = useSketchStore((s) => s.updateNodeData)
  const globalParameters = useEditorStore((s) => s.globalParameters)

  const selectedParam = d.parameterName || globalParameters[0]?.name || ''
  const expression = d.expression || '{param}'
  const preview = expression.replaceAll('{param}', asIdentifier(selectedParam) || 'param')

  return (
    <SketchBaseNode id={id} category="sketch_control" label="expression" selected={selected} hasOutput>
      <label className="flex items-center justify-between gap-2 text-xs text-gray-300 py-0.5">
        <span className="shrink-0 text-gray-400 min-w-[50px]">param</span>
        <select
          className="w-[110px] bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-pink-500 nodrag"
          value={selectedParam}
          onChange={(e) => update(id, { parameterName: e.target.value })}
        >
          {globalParameters.length > 0 ? (
            globalParameters.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))
          ) : (
            <option value="">(no global params)</option>
          )}
        </select>
      </label>

      <TextInput label="math" value={expression} onChange={(v) => update(id, { expression: v })} />

      <div className="text-[10px] text-gray-500 leading-snug">
        Use {'{param}'} in math. Preview: <span className="text-amber-300 font-mono">{preview}</span>
      </div>
    </SketchBaseNode>
  )
}
