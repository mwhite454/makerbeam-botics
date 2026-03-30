import { type NodeProps } from '@xyflow/react'
import { BaseNode, CheckboxInput, SelectInput, TextInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'

// Local minimal VarData type to avoid depending on missing export
type VarData = { varName?: string; dataType?: string; value?: string }

const DATA_TYPES = ['number', 'string', 'boolean', 'vector', 'range', 'list']

function ValueWidget({ dataType, value, onChange }: { dataType: string; value: string; onChange: (v: string) => void }) {
  switch (dataType) {
    case 'boolean':
      return <CheckboxInput label="value" value={value === 'true'} onChange={(v) => onChange(v ? 'true' : 'false')} />
    default:
      return <TextInput label="value" value={value} onChange={onChange} />
  }
}

export function VarNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as VarData
  const update = useEditorStore((s) => s.updateNodeData)
  const dataType = d.dataType || 'number'
  return (
    <BaseNode id={id} category="control" label="variable" selected={selected} hasOutput={true}>
      <TextInput label="name" value={d.varName ?? ''} onChange={(v) => update(id, { varName: v } as any)} />
      <SelectInput label="type" value={dataType} options={DATA_TYPES} onChange={(v) => update(id, { dataType: v } as any)} />
      <ValueWidget dataType={dataType} value={String(d.value ?? '')} onChange={(v) => update(id, { value: v } as any)} />
    </BaseNode>
  )
}
