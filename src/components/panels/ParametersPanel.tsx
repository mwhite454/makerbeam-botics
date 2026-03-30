import { useState, useRef, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table'
import { useEditorStore, type GlobalParameter, type GlobalParamType } from '@/store/editorStore'

const DATA_TYPES: GlobalParamType[] = ['number', 'string', 'boolean', 'vector2', 'vector3', 'expression']

const TYPE_LABELS: Record<GlobalParamType, string> = {
  number:     'Number',
  string:     'String',
  boolean:    'Boolean',
  vector2:    'Vector2',
  vector3:    'Vector3',
  expression: 'Expression',
}

// ─── Editable cell components ─────────────────────────────────────────────────

function EditableNameCell({ row, value }: { row: GlobalParameter; value: string }) {
  const updateGlobalParameter = useEditorStore((s) => s.updateGlobalParameter)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commit = () => {
    const sanitized = draft.trim().replace(/[^a-zA-Z0-9_]/g, '_') || value
    updateGlobalParameter(row.id, { name: sanitized })
    setDraft(sanitized)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="w-full bg-gray-700 border border-blue-500 rounded px-2 py-1 text-xs text-white focus:outline-none font-mono"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
      />
    )
  }

  return (
    <button
      className="w-full text-left px-2 py-1 text-xs text-green-300 font-mono hover:bg-gray-700 rounded truncate"
      onDoubleClick={() => setEditing(true)}
      title="Double-click to rename"
    >
      {value}
    </button>
  )
}

function TypeSelectCell({ row, value }: { row: GlobalParameter; value: GlobalParamType }) {
  const updateGlobalParameter = useEditorStore((s) => s.updateGlobalParameter)
  return (
    <select
      className="w-full bg-gray-800 border border-gray-700 rounded px-1 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
      value={value}
      onChange={(e) => updateGlobalParameter(row.id, { dataType: e.target.value as GlobalParamType })}
    >
      {DATA_TYPES.map((t) => (
        <option key={t} value={t}>{TYPE_LABELS[t]}</option>
      ))}
    </select>
  )
}

function EditableValueCell({ row, value }: { row: GlobalParameter; value: string }) {
  const updateGlobalParameter = useEditorStore((s) => s.updateGlobalParameter)
  const [draft, setDraft] = useState(value)

  // Sync draft when external value changes (e.g. type switch resets value)
  useEffect(() => { setDraft(value) }, [value])

  const commit = () => {
    updateGlobalParameter(row.id, { value: draft })
  }

  if (row.dataType === 'boolean') {
    return (
      <select
        className="w-full bg-gray-800 border border-gray-700 rounded px-1 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => updateGlobalParameter(row.id, { value: e.target.value })}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    )
  }

  return (
    <input
      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-amber-200 font-mono focus:outline-none focus:border-blue-500"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { commit(); (e.target as HTMLInputElement).blur() }
      }}
      placeholder={row.dataType === 'vector2' ? '[0, 0]' : row.dataType === 'vector3' ? '[0, 0, 0]' : '0'}
    />
  )
}

// ─── Column definition ────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<GlobalParameter>()

// ─── Main panel ──────────────────────────────────────────────────────────────

export function ParametersPanel() {
  const globalParameters   = useEditorStore((s) => s.globalParameters)
  const addGlobalParameter = useEditorStore((s) => s.addGlobalParameter)
  const removeGlobalParameter = useEditorStore((s) => s.removeGlobalParameter)

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      size: 180,
      cell: ({ row }) => <EditableNameCell row={row.original} value={row.original.name} />,
    }),
    columnHelper.accessor('dataType', {
      header: 'Type',
      size: 110,
      cell: ({ row }) => <TypeSelectCell row={row.original} value={row.original.dataType} />,
    }),
    columnHelper.accessor('value', {
      header: 'Value',
      cell: ({ row }) => <EditableValueCell row={row.original} value={row.original.value} />,
    }),
    columnHelper.display({
      id: 'actions',
      size: 40,
      cell: ({ row }) => (
        <button
          className="text-gray-600 hover:text-red-400 transition-colors text-sm px-1 py-0.5 rounded"
          title="Delete parameter"
          onClick={() => removeGlobalParameter(row.original.id)}
        >
          ×
        </button>
      ),
    }),
  ]

  const table = useReactTable({
    data: globalParameters,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  return (
    <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-white">Global Parameters</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Variables available at the top level of generated code. Type their names in expression inputs to autocomplete.
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors shrink-0"
          onClick={addGlobalParameter}
        >
          <span className="text-base leading-none">+</span>
          Add Parameter
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {globalParameters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-3">
            <div className="text-4xl opacity-20">⚙</div>
            <p className="text-sm text-gray-500">No global parameters yet.</p>
            <p className="text-xs text-gray-600 max-w-xs">
              Parameters are emitted at the top of generated OpenSCAD code and can be referenced from any expression input.
            </p>
            <button
              className="mt-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded transition-colors"
              onClick={addGlobalParameter}
            >
              + Add your first parameter
            </button>
          </div>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-white/10 bg-gray-900/60">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
                      style={{ width: header.column.getSize() !== 150 ? header.column.getSize() : undefined }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 hover:bg-gray-900/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-2 py-1.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {globalParameters.length > 0 && (
        <div className="px-4 py-2 border-t border-white/10 text-[10px] text-gray-600 shrink-0">
          {globalParameters.length} parameter{globalParameters.length !== 1 ? 's' : ''} — double-click names to rename
        </div>
      )}
    </div>
  )
}
