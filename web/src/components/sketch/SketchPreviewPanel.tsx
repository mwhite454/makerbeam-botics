import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useEditorStore } from '@/store/editorStore'

type SketchPreviewMode = '2d' | '3d'

// ─── SVG 2D Viewer with Zoom & Pan ──────────────────────────────────────────

const MIN_ZOOM = 0.1
const MAX_ZOOM = 10
const ZOOM_STEP = 0.1

function SvgViewer({ svg }: { svg: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  // Wheel zoom (zoom toward cursor)
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const cursorX = e.clientX - rect.left
    const cursorY = e.clientY - rect.top

    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale + delta * scale))
    const ratio = newScale / scale

    // Adjust translate so zoom centers on cursor position
    setTranslate((prev) => ({
      x: cursorX - ratio * (cursorX - prev.x),
      y: cursorY - ratio * (cursorY - prev.y),
    }))
    setScale(newScale)
  }, [scale])

  // Pan via mouse drag
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsPanning(true)
    panStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y }
  }, [translate])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    setTranslate({
      x: panStart.current.tx + (e.clientX - panStart.current.x),
      y: panStart.current.ty + (e.clientY - panStart.current.y),
    })
  }, [isPanning])

  const onMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Fit to view
  const fitToView = useCallback(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const svgEl = content.querySelector('svg')
    if (!svgEl) {
      setScale(1)
      setTranslate({ x: 0, y: 0 })
      return
    }

    const cw = container.clientWidth
    const ch = container.clientHeight
    const sw = svgEl.getBoundingClientRect().width / scale
    const sh = svgEl.getBoundingClientRect().height / scale

    if (sw === 0 || sh === 0) return

    const fitScale = Math.min(cw / sw, ch / sh) * 0.85
    const clampedScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, fitScale))
    const newW = sw * clampedScale
    const newH = sh * clampedScale

    setScale(clampedScale)
    setTranslate({ x: (cw - newW) / 2, y: (ch - newH) / 2 })
  }, [scale])

  // Reset to 1:1
  const resetZoom = useCallback(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }, [])

  // Auto-fit on first SVG load
  const prevSvg = useRef('')
  useEffect(() => {
    if (svg && svg !== prevSvg.current) {
      prevSvg.current = svg
      // Delay slightly so DOM has rendered
      requestAnimationFrame(fitToView)
    }
  }, [svg, fitToView])

  return (
    <div className="w-full h-full relative bg-gray-950 overflow-hidden">
      {/* Zoomable/pannable area */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div
          ref={contentRef}
          className="sketch-svg-container"
          dangerouslySetInnerHTML={{ __html: svg }}
          style={{
            transformOrigin: '0 0',
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            willChange: 'transform',
          }}
        />
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
        <button
          onClick={() => setScale((s) => Math.min(MAX_ZOOM, s + ZOOM_STEP * s))}
          className="w-7 h-7 bg-gray-800/90 border border-gray-700 rounded text-gray-300 hover:bg-gray-700 text-sm flex items-center justify-center"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setScale((s) => Math.max(MIN_ZOOM, s - ZOOM_STEP * s))}
          className="w-7 h-7 bg-gray-800/90 border border-gray-700 rounded text-gray-300 hover:bg-gray-700 text-sm flex items-center justify-center"
          title="Zoom out"
        >
          -
        </button>
        <button
          onClick={fitToView}
          className="w-7 h-7 bg-gray-800/90 border border-gray-700 rounded text-gray-300 hover:bg-gray-700 flex items-center justify-center"
          title="Fit to view"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </button>
        <button
          onClick={resetZoom}
          className="w-7 h-7 bg-gray-800/90 border border-gray-700 rounded text-gray-400 hover:bg-gray-700 text-[9px] font-bold flex items-center justify-center"
          title="Reset to 1:1"
        >
          1:1
        </button>
        <span className="text-[9px] text-gray-500 text-center mt-0.5">
          {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  )
}

// ─── SVG-on-3D-Plane Viewer ───────────────────────────────────────────────────

function Svg3DViewer({ svg }: { svg: string }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const textureUrl = useMemo(() => {
    // Convert SVG string to data URL for use as texture
    const encoded = encodeURIComponent(svg)
    return `data:image/svg+xml;charset=utf-8,${encoded}`
  }, [svg])

  useEffect(() => {
    const container = mountRef.current
    if (!container || !svg) return

    const width  = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111827)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000)
    camera.position.set(0, -100, 80)
    camera.up.set(0, 0, 1)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambient)
    const dir1 = new THREE.DirectionalLight(0xffffff, 0.5)
    dir1.position.set(1, 1, 2)
    scene.add(dir1)

    // Load SVG as texture on a plane
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(textureUrl, () => {
      renderer.render(scene, camera)
    })
    texture.colorSpace = THREE.SRGBColorSpace

    const planeSize = 80
    const geometry = new THREE.PlaneGeometry(planeSize, planeSize)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    })
    const plane = new THREE.Mesh(geometry, material)
    scene.add(plane)

    // Grid on the XY plane
    const grid = new THREE.GridHelper(100, 20, 0x374151, 0x1f2937)
    grid.rotation.x = Math.PI / 2
    grid.position.z = -0.1
    scene.add(grid)

    // Axis helper
    const axesHelper = new THREE.AxesHelper(30)
    scene.add(axesHelper)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      controls.dispose()
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      texture.dispose()
      ro.disconnect()
      container.removeChild(renderer.domElement)
    }
  }, [svg, textureUrl])

  return <div ref={mountRef} className="w-full h-full" />
}

// ─── Main Sketch Preview Panel ────────────────────────────────────────────────

export function SketchPreviewPanel() {
  const previewSvg = useEditorStore((s) => s.sketchPreviewSvg)
  const [mode, setMode] = useState<SketchPreviewMode>('2d')

  return (
    <div className="h-full bg-gray-900 border-l border-white/10 flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sketch Preview</span>
        <div className="flex rounded overflow-hidden border border-white/10 text-[11px]">
          {([['2d', '2D'], ['3d', '3D']] as const).map(([m, label]) => (
            <button
              key={m}
              className={`px-2 py-0.5 transition-colors ${mode === m ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              onClick={() => setMode(m)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {!previewSvg && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 text-center px-6">
            <div className="text-5xl mb-4 opacity-30">✏️</div>
            <p className="text-xs text-gray-500">Add and connect sketch nodes to see a preview</p>
          </div>
        )}

        {previewSvg && mode === '2d' && (
          <SvgViewer svg={previewSvg} />
        )}

        {previewSvg && mode === '3d' && (
          <Svg3DViewer svg={previewSvg} />
        )}
      </div>
    </div>
  )
}
