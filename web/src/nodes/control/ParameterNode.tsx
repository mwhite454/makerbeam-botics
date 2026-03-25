import { type NodeProps } from '@xyflow/react'
import { useMemo } from 'react'
import { BaseNode, TextInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ParameterData } from '@/types/nodes'

interface ParameterListNodeData extends ParameterData {
  items?: string[]
}

export function ParameterNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ParameterData
  const update = useEditorStore((s) => s.updateNodeData)

  return (
    <BaseNode id={id} category="control" label="parameter" selected={selected}>
      <TextInput label="name" value={d.varName} onChange={(v) => update(id, { varName: v })} />
      <TextInput label="value" value={d.value} onChange={(v) => update(id, { value: v })} />
    </BaseNode>
  )
}

function toListLiteral(items: string[]): string {
  return `[${items.map((item) => item.trim()).filter((item) => item.length > 0).join(', ')}]`
}

export function ParameterListNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ParameterListNodeData
  const update = useEditorStore((s) => s.updateNodeData)

  const items: string[] = useMemo(() => {
    if (Array.isArray(d.items) && d.items.length > 0) return d.items
    return ['0']
  }, [d.items])

  const setItems = (nextItems: string[]) => {
    update(id, {
      items: nextItems,
      value: toListLiteral(nextItems),
    } as unknown as Partial<ParameterData>)
  }

  const addValue = () => {
    setItems([...items, '0'])
  }

  const removeValue = (idx: number) => {
    if (items.length <= 1) {
      setItems(['0'])
      return
    }
    setItems(items.filter((_: string, i: number) => i !== idx))
  }

  const updateValueAt = (idx: number, value: string) => {
    const next = [...items]
    next[idx] = value
    setItems(next)
  }

  return (
    <BaseNode id={id} category="control" label="parameter_list" selected={selected}>
      <TextInput label="name" value={d.varName} onChange={(v) => update(id, { varName: v })} />

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>list values</span>
        <button
          type="button"
          onClick={addValue}
          className="nodrag rounded border border-gray-600 px-2 py-0.5 text-[10px] text-gray-300 hover:border-blue-400 hover:text-blue-300"
          title="Add list item"
        >
          + Add
        </button>
      </div>

      <div className="space-y-1.5">
        {items.map((val: string, idx: number) => (
          <div key={`${id}-item-${idx}`} className="flex items-center gap-2">
            <TextInput
              label={`${idx}`}
              value={val}
              onChange={(v) => updateValueAt(idx, v)}
            />
            <button
              type="button"
              onClick={() => removeValue(idx)}
              className="nodrag mt-4 rounded border border-gray-600 px-2 py-1 text-[10px] text-gray-300 hover:border-red-400 hover:text-red-300"
              title="Remove list item"
            >
              -
            </button>
          </div>
        ))}
      </div>

      <TextInput
        label="preview"
        value={toListLiteral(items)}
        onChange={() => {}}
      />
    </BaseNode>
  )
}
