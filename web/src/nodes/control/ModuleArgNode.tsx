import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput, ExpressionInput, CheckboxInput, SelectInput, VectorInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ModuleArgData } from '@/types/nodes'

const DATA_TYPES = ['number', 'string', 'boolean', 'vector', 'range', 'list']

export function ModuleArgNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ModuleArgData
  const update = useEditorStore((s) => s.updateNodeData)
  const dataType = d.dataType || 'number'

  const handleTypeChange = (newType: string) => {
    const defaults: Record<string, string> = {
      number: '0',
      string: 'hello',
      boolean: 'true',
      vector: '[0, 0, 0]',
      range: '[0 : 1 : 10]',
      list: '[0, 1, 2]',
    }
    update(id, { dataType: newType, defaultValue: defaults[newType] ?? '0' } as Partial<ModuleArgData>)
  }

  return (
    <BaseNode id={id} category="control" label="module_arg" selected={selected} hasOutput={true}>
      <TextInput
        label="name"
        value={d.argName}
        onChange={(v) => update(id, { argName: v } as Partial<ModuleArgData>)}
      />
      <SelectInput
        label="type"
        value={dataType}
        options={DATA_TYPES}
        onChange={handleTypeChange}
      />
      <DefaultValueInput
        dataType={dataType}
        value={d.defaultValue}
        onChange={(v) => update(id, { defaultValue: v } as Partial<ModuleArgData>)}
      />
    </BaseNode>
  )
}

function DefaultValueInput({
  dataType,
  value,
  onChange,
}: {
  dataType: string
  value: string
  onChange: (v: string) => void
}) {
  switch (dataType) {
    case 'number':
      return (
        <ExpressionInput
          label="default"
          value={value}
          onChange={(v) => onChange(String(v))}
        />
      )
    case 'boolean':
      return (
        <CheckboxInput
          label="default"
          value={value === 'true'}
          onChange={(v) => onChange(v ? 'true' : 'false')}
        />
      )
    case 'vector': {
      let vec: [number, number, number] = [0, 0, 0]
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed) && parsed.length >= 3) {
          vec = [Number(parsed[0]) || 0, Number(parsed[1]) || 0, Number(parsed[2]) || 0]
        }
      } catch { /* keep default */ }
      return (
        <VectorInput
          label="default"
          value={vec}
          onChange={(v) => onChange(`[${v[0]}, ${v[1]}, ${v[2]}]`)}
        />
      )
    }
    default:
      return (
        <TextInput
          label="default"
          value={value}
          onChange={onChange}
        />
      )
  }
}
