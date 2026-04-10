import { type NodeProps } from '@xyflow/react'
import { BaseNode, SelectInput, ExpressionInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ExpressionNodeData } from '@/types/nodes'

function asIdentifier(raw: string): string {
  const sanitized = raw.trim().replace(/[^a-zA-Z0-9_]/g, '_')
  return /^[a-zA-Z_]/.test(sanitized) ? sanitized : ''
}

export function ExpressionNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ExpressionNodeData
  const update = useEditorStore((s) => s.updateNodeData)
  const globalParameters = useEditorStore((s) => s.globalParameters)

  const options = globalParameters.map((p) => p.name)
  const selectedParam = d.parameterName || options[0] || ''
  const expression = d.expression || '{param}'
  const preview = expression.replaceAll('{param}', asIdentifier(selectedParam) || 'param')

  return (
    <BaseNode id={id} category="control" label="expression" selected={selected} hasOutput>
      <SelectInput
        label="parameter"
        value={selectedParam}
        options={options.length > 0 ? options : ['']}
        onChange={(v) => update(id, { parameterName: v })}
      />
      <ExpressionInput
        label="math"
        value={expression}
        forceFormula
        widthClass="w-[180px]"
        onChange={(v) => update(id, { expression: String(v) })}
      />
      <div className="text-[10px] text-gray-500 leading-snug">
        Use {'{param}'} in math. Preview: <span className="text-amber-300 font-mono">{preview}</span>
      </div>
    </BaseNode>
  )
}
