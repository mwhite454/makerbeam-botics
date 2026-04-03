import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
  type Edge,
} from '@xyflow/react'
import { useContext } from 'react'
import { HaltDimmedContext } from '@/components/panels/EditorPanel'

export function DeletableEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
}: EdgeProps<Edge>) {
  const { deleteElements } = useReactFlow()
  const dimmedNodeIds = useContext(HaltDimmedContext)
  const isDimmed = dimmedNodeIds.has(source) || dimmedNodeIds.has(target)
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      {/* Wider invisible path for easier mouse targeting */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
      />
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, ...(isDimmed ? { opacity: 0.25 } : {}) }} />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button
              onClick={() => deleteElements({ edges: [{ id }] })}
              className="w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs leading-none flex items-center justify-center shadow-lg border border-red-400/50"
              title="Remove connection"
            >
              ✕
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
