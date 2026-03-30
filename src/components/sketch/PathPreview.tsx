import React from 'react'

export function PathPreview({ anchorsJson, closed }: { anchorsJson: string; closed?: boolean }) {
  let anchors: Array<{ pos: [number, number] }> = []
  try { anchors = JSON.parse(anchorsJson || '[]') } catch { anchors = [] }

  if (anchors.length === 0) return <div className="text-xs text-gray-500">No anchors</div>

  // Normalize to viewBox
  const pts = anchors.map((a) => a.pos)
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)
  const w = Math.max(1, maxX - minX)
  const h = Math.max(1, maxY - minY)
  const scale = 1

  const pointsAttr = pts.map((p) => `${(p[0] - minX) * scale},${(p[1] - minY) * scale}`).join(' ')

  return (
    <div className="w-full h-28 bg-gray-800 rounded p-1">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        <polyline points={pointsAttr} fill="none" stroke="#f472b6" strokeWidth={0.5} strokeLinejoin="round" strokeLinecap="round" />
        {closed && <polygon points={pointsAttr} fill="none" stroke="#f472b6" strokeWidth={0.5} opacity={0.6} />}
        {pts.map((p, i) => (
          <circle key={i} cx={(p[0] - minX) * scale} cy={(p[1] - minY) * scale} r={1.2} fill="#fb7185" />
        ))}
      </svg>
    </div>
  )
}

export default PathPreview
