import { useViewport } from '@xyflow/react'
import { useEditorStore } from '@/store/editorStore'
import { useSketchStore } from '@/store/sketchStore'
import type { SketchPathData } from '@/types/sketchNodes'

type Anchor = { id?: string; pos: [number, number] }

export function AnchorOverlay() {
  const { x: vpX, y: vpY, zoom } = useViewport()
  const addAnchorMode = useSketchStore((s) => s.addAnchorMode)
  const nodes = useEditorStore((s) => s.nodes)

  const selectedPath = nodes.find((n) => n.selected && n.type === 'sketch_path')
  if (!selectedPath) return null

  const data = selectedPath.data as unknown as SketchPathData
  let anchors: Anchor[] = []
  try { anchors = JSON.parse(String(data.anchorsJson || '[]')) } catch { return null }

  // Convert a flow-space point to the SVG/screen coordinate inside the RF container
  const toScreen = (pos: [number, number]) => ({
    x: pos[0] * zoom + vpX,
    y: pos[1] * zoom + vpY,
  })

  const pts = anchors.map((a) => toScreen(a.pos))
  const polyPts = pts.map((p) => `${p.x},${p.y}`).join(' ')

  const dotColor = addAnchorMode ? '#10b981' : '#f472b6'

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 5,
      }}
    >
      {pts.length > 1 && (
        <polyline
          points={polyPts}
          fill="none"
          stroke="#f472b6"
          strokeWidth={1.5 / zoom}
          strokeDasharray={`${6 / zoom} ${3 / zoom}`}
          strokeLinecap="round"
          opacity={0.75}
        />
      )}
      {data.closed && pts.length > 1 && (
        <line
          x1={pts[pts.length - 1].x}
          y1={pts[pts.length - 1].y}
          x2={pts[0].x}
          y2={pts[0].y}
          stroke="#f472b6"
          strokeWidth={1.5 / zoom}
          strokeDasharray={`${6 / zoom} ${3 / zoom}`}
          opacity={0.4}
        />
      )}
      {pts.map((p, i) => (
        <circle
          key={anchors[i].id ?? i}
          cx={p.x}
          cy={p.y}
          r={5}
          fill={dotColor}
          stroke="white"
          strokeWidth={1.5}
          opacity={0.9}
        />
      ))}
    </svg>
  )
}
