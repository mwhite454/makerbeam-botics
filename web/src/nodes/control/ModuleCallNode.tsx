import { type NodeProps } from '@xyflow/react'
import { BaseNode, SelectInput, TextInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ModuleCallData } from '@/types/nodes'

export function ModuleCallNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ModuleCallData
  const update = useEditorStore((s) => s.updateNodeData)
  const moduleNames = useEditorStore((s) =>
    s.tabs
      .filter((t) => t.isModule)
      .map((t) => t.moduleName)
      .filter((name) => name.trim().length > 0)
  )

  const activeModuleName = moduleNames.includes(d.moduleName)
    ? d.moduleName
    : (moduleNames[0] ?? '')

  return (
    <BaseNode
      id={id}
      category="control"
      label="module_call"
      selected={selected}
      inputHandles={[{ id: 'in-0', label: 'children' }]}
    >
      <SelectInput
        label="module"
        value={activeModuleName}
        options={moduleNames.length > 0 ? moduleNames : ['']}
        onChange={(v) => update(id, { moduleName: v })}
      />
      <TextInput label="args" value={d.args} onChange={(v) => update(id, { args: v })} />
    </BaseNode>
  )
}
