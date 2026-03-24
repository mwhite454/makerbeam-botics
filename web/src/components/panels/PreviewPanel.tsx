import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useEditorStore } from '@/store/editorStore'

// ─── Three.js STL viewer ──────────────────────────────────────────────────────

function STLViewer({ data }: { data: ArrayBuffer }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width  = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene    = new THREE.Scene()
    scene.background = new THREE.Color(0x111827)

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000)
    camera.position.set(0, -150, 100)
    camera.up.set(0, 0, 1)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambient)
    const dir1 = new THREE.DirectionalLight(0xffffff, 0.8)
    dir1.position.set(1, 1, 2)
    scene.add(dir1)
    const dir2 = new THREE.DirectionalLight(0x8888ff, 0.3)
    dir2.position.set(-1, -1, -1)
    scene.add(dir2)

    // Load STL
    const loader   = new STLLoader()
    const geometry = loader.parse(data)
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()

    const material = new THREE.MeshStandardMaterial({
      color:     0x4488cc,
      metalness: 0.2,
      roughness: 0.6,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Center the model
    const box    = new THREE.Box3().setFromObject(mesh)
    const center = box.getCenter(new THREE.Vector3())
    mesh.position.sub(center)

    const size   = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    camera.position.set(0, -maxDim * 1.8, maxDim * 0.8)
    camera.lookAt(0, 0, 0)

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.screenSpacePanning = false

    // Grid helper
    const grid = new THREE.GridHelper(maxDim * 2, 10, 0x374151, 0x1f2937)
    grid.position.z = box.min.z - center.z
    grid.rotation.x = Math.PI / 2
    scene.add(grid)

    // Animation loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize observer
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
      ro.disconnect()
      container.removeChild(renderer.domElement)
    }
  }, [data])

  return <div ref={mountRef} className="w-full h-full" />
}

// ─── PNG viewer ───────────────────────────────────────────────────────────────

function PNGViewer({ data }: { data: Uint8Array }) {
  const [url] = useState(() => {
    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'image/png' })
    return URL.createObjectURL(blob)
  })

  useEffect(() => {
    return () => URL.revokeObjectURL(url)
  }, [url])

  return (
    <img
      src={url}
      alt="OpenSCAD render"
      className="w-full h-full object-contain p-2"
    />
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function PreviewPanel() {
  const { renderStatus, renderError, renderResultSTL, renderResultPNG, previewMode } = useEditorStore()

  return (
    <div className="w-80 shrink-0 bg-gray-900 border-l border-white/10 flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Preview</span>
        <div className="flex items-center gap-1.5">
          {renderStatus === 'rendering' && (
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          )}
          <span className="text-[10px] text-gray-500">
            {renderStatus === 'rendering' ? 'Rendering…' :
             renderStatus === 'done'      ? previewMode.toUpperCase() :
             renderStatus === 'error'     ? 'Error' :
             'Idle'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {renderStatus === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 text-center px-6">
            <div className="text-5xl mb-4 opacity-30">◈</div>
            <p className="text-xs text-gray-500">Click <span className="text-white font-semibold">Render</span> or enable auto-render</p>
          </div>
        )}

        {renderStatus === 'rendering' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500">Compiling with OpenSCAD WASM…</p>
          </div>
        )}

        {renderStatus === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 gap-2">
            <div className="text-red-400 text-sm font-semibold">Render failed</div>
            <pre className="text-[10px] text-red-300 bg-red-900/20 rounded p-2 overflow-auto max-h-40 w-full">
              {renderError}
            </pre>
          </div>
        )}

        {renderStatus === 'done' && previewMode === 'stl' && renderResultSTL && (
          <STLViewer data={renderResultSTL} />
        )}

        {renderStatus === 'done' && previewMode === 'png' && renderResultPNG && (
          <PNGViewer data={renderResultPNG} />
        )}
      </div>
    </div>
  )
}
