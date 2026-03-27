import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useSketchStore } from '@/store/sketchStore'

type SketchPreviewMode = '2d' | '3d'

// ─── SVG 2D Viewer ────────────────────────────────────────────────────────────

function SvgViewer({ svg }: { svg: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-950 overflow-auto p-4">
      <div
        className="sketch-svg-container"
        dangerouslySetInnerHTML={{ __html: svg }}
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
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
  const previewSvg = useSketchStore((s) => s.previewSvg)
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
