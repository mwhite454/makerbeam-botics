import { type NodeProps } from '@xyflow/react'
import { BaseNode, TextInput, ExpressionInput } from '../BaseNode'
import { useEditorStore } from '@/store/editorStore'
import type { ForLoopData, LoopVarData } from '@/types/nodes'

export function ForLoopNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ForLoopData
  const update = useEditorStore((s) => s.updateNodeData)
  const addTab = useEditorStore((s) => s.addTab)
  const setActiveTab = useEditorStore((s) => s.setActiveTab)
  const getActiveTab = useEditorStore((s) => s.getActiveTab)
  const updateNodeDataInTab = useEditorStore((s) => s.updateNodeDataInTab)
  const propagateForLoopVarName = useEditorStore((s) => s.propagateForLoopVarName)
  const addNode = useEditorStore((s) => s.addNode)
  const tabs = useEditorStore((s) => s.tabs)

  const hasBody = Boolean(d.bodyTabId)

  // When a body tab exists, drop the legacy inline 'body' handle
  const inputHandles = hasBody
    ? [{ id: 'in-1', label: 'start' }, { id: 'in-2', label: 'end' }, { id: 'in-3', label: 'step' }]
    : [{ id: 'in-0', label: 'body' }, { id: 'in-1', label: 'start' }, { id: 'in-2', label: 'end' }, { id: 'in-3', label: 'step' }]

  const handleEditBody = () => {
    if (d.bodyTabId) {
      setActiveTab(d.bodyTabId)
      return
    }

    // Derive a default label from varName, avoid collisions
    const baseLabel = `for_${d.varName || 'i'}`
    const existingLabels = tabs.map((t) => t.label)
    let label = baseLabel
    let suffix = 2
    while (existingLabels.includes(label)) {
      label = `${baseLabel}_${suffix++}`
    }

    // Capture caller tab ID before addTab switches away
    const callerTabId = getActiveTab()?.id ?? ''

    // Create the loop body tab (saves current tab & switches to new one)
    const newTabId = addTab(label, 'loop')

    // Record bodyTabId on the ForLoop node in its (now saved) tab
    updateNodeDataInTab(callerTabId, id, { bodyTabId: newTabId })

    // Seed the new body tab with a LoopVarNode
    addNode({
      id: `loop_var-${Date.now()}`,
      type: 'loop_var',
      position: { x: 80, y: 120 },
      data: { varName: d.varName || 'i' } as unknown as Record<string, unknown>,
    })
  }

  return (
    <BaseNode
      id={id}
      category="control"
      label="for"
      selected={selected}
      inputHandles={inputHandles}
    >
      <TextInput
        label="variable"
        value={d.varName}
        onChange={(v) => propagateForLoopVarName(id, v)}
      />
      <ExpressionInput label="start" value={d.start} step={1} onChange={(v) => update(id, { start: v })} />
      <ExpressionInput label="end"   value={d.end}   step={1} onChange={(v) => update(id, { end:   v })} />
      <ExpressionInput label="step"  value={d.step}  step={1} onChange={(v) => update(id, { step:  v })} />
      <button
        className="mt-1 text-[10px] px-2 py-0.5 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors w-full"
        onClick={handleEditBody}
      >
        {hasBody ? '↗ Edit Body' : '+ Create Body'}
      </button>
    </BaseNode>
  )
}
