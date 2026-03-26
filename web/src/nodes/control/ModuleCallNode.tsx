import { useMemo } from 'react'
import { type NodeProps } from '@xyflow/react'
import { BaseNode, SelectInput, TextInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ModuleCallData } from '@/types/nodes'

export function ModuleCallNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ModuleCallData
  const update = useEditorStore((s) => s.updateNodeData)
  const addTab = useEditorStore((s) => s.addTab)
  const tabs = useEditorStore((s) => s.tabs)

  const moduleNames = useMemo(
    () =>
      tabs
        .filter((t) => t.isModule)
        .map((t) => t.moduleName)
        .filter((name) => name.trim().length > 0),
    [tabs],
  )

  const activeModuleName = moduleNames.includes(d.moduleName)
    ? d.moduleName
    : (moduleNames[0] ?? '')

  // Extract module_arg nodes from the selected module's tab
  const moduleArgs = useMemo(() => {
    const moduleTab = tabs.find(
      (t) => t.isModule && t.moduleName === activeModuleName,
    )
    if (!moduleTab) return []
    return moduleTab.nodes
      .filter((n) => n.type === 'module_arg')
      .map((n) => {
        const nd = n.data as Record<string, unknown>
        return {
          argName: String(nd.argName || 'param'),
          dataType: String(nd.dataType || 'number'),
          defaultValue: String(nd.defaultValue ?? '0'),
        }
      })
  }, [tabs, activeModuleName])

  // Build input handles: 0 = children, 1..N = module args
  const inputHandles = useMemo(() => {
    const handles = [{ id: 'in-0', label: 'children' }]
    moduleArgs.forEach((arg, i) => {
      handles.push({ id: `in-${i + 1}`, label: arg.argName })
    })
    return handles
  }, [moduleArgs])

  const argValues = d.argValues ?? {}

  const handleArgChange = (argName: string, value: string) => {
    update(id, { argValues: { ...argValues, [argName]: value } })
  }

  const handleCreateModule = () => {
    const name = `module_${tabs.filter((t) => t.isModule).length + 1}`
    // Set moduleName BEFORE addTab so it's saved with the current tab
    update(id, { moduleName: name.toLowerCase().replace(/[^a-z0-9_]/g, '_') })
    addTab(name, true)
  }

  return (
    <BaseNode
      id={id}
      category="control"
      label="module_call"
      selected={selected}
      inputHandles={inputHandles}
    >
      {moduleNames.length > 0 ? (
        <SelectInput
          label="module"
          value={activeModuleName}
          options={moduleNames}
          onChange={(v) => update(id, { moduleName: v })}
        />
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400">No modules defined</span>
          <button
            className="text-[10px] px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            onClick={handleCreateModule}
          >
            + Create Module
          </button>
        </div>
      )}
      {moduleArgs.map((arg) => (
        <TextInput
          key={arg.argName}
          label={arg.argName}
          value={argValues[arg.argName] ?? arg.defaultValue}
          onChange={(v) => handleArgChange(arg.argName, v)}
        />
      ))}
      {moduleArgs.length === 0 && (
        <TextInput label="args" value={d.args} onChange={(v) => update(id, { args: v })} />
      )}
    </BaseNode>
  )
}
