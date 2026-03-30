import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useEditorStore } from '@/store/editorStore'
import { parseOFF } from '@/utils/parseOFF'

// ─── Shared Three.js scene setup ─────────────────────────────────────────────

function useThreeScene(
  mountRef: React.RefObject<HTMLDivElement | null>,
  buildMesh: () => THREE.Mesh | THREE.Group | null,
  deps: unknown[],
) {
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const mesh = buildMesh()
    if (!mesh) return

    const width  = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111827)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000)
    camera.position.set(0, -150, 100)
    camera.up.set(0, 0, 1)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambient)
    const dir1 = new THREE.DirectionalLight(0xffffff, 0.8)
    dir1.position.set(1, 1, 2)
    scene.add(dir1)
    const dir2 = new THREE.DirectionalLight(0x8888ff, 0.3)
    dir2.position.set(-1, -1, -1)
    scene.add(dir2)

    scene.add(mesh)

    const box    = new THREE.Box3().setFromObject(mesh)
    const center = box.getCenter(new THREE.Vector3())
    mesh.position.sub(center)

    const size   = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    camera.position.set(0, -maxDim * 1.8, maxDim * 0.8)
    camera.lookAt(0, 0, 0)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.screenSpacePanning = false

    const grid = new THREE.GridHelper(maxDim * 2, 10, 0x374151, 0x1f2937)
    grid.position.z = box.min.z - center.z
    grid.rotation.x = Math.PI / 2
    scene.add(grid)

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

    // Collect disposables
    const disposables: THREE.BufferGeometry[] = []
    const materials: THREE.Material[] = []
    mesh.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        disposables.push(obj.geometry)
        if (Array.isArray(obj.material)) materials.push(...obj.material)
        else materials.push(obj.material)
      }
    })

    return () => {
      cancelAnimationFrame(animId)
      controls.dispose()
      renderer.dispose()
      disposables.forEach((g) => g.dispose())
      materials.forEach((m) => m.dispose())
      ro.disconnect()
      container.removeChild(renderer.domElement)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// ─── Three.js STL viewer ──────────────────────────────────────────────────────

function STLViewer({ data }: { data: ArrayBuffer }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useThreeScene(mountRef, () => {
    const loader   = new STLLoader()
    const geometry = loader.parse(data)
    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color:     0x4488cc,
      metalness: 0.2,
      roughness: 0.6,
    })
    return new THREE.Mesh(geometry, material)
  }, [data])

  return <div ref={mountRef} className="w-full h-full" />
}

// ─── Three.js OFF viewer (with color support) ────────────────────────────────

function OFFViewer({ data }: { data: ArrayBuffer }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useThreeScene(mountRef, () => {
    try {
      const parsed = parseOFF(data)

      const numVerts = parsed.positions.length / 3
      console.log(`[OFFViewer] parsed: ${numVerts} vertices, hasColors=${parsed.colors !== null}`)
      if (parsed.colors) {
        console.log('[OFFViewer] first 12 RGBA color values:', Array.from(parsed.colors.slice(0, 12)))
      }

      if (parsed.positions.length === 0) {
        console.warn('[OFFViewer] parseOFF returned 0 vertices')
        return null
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(parsed.positions, 3))
      geometry.setAttribute('normal', new THREE.BufferAttribute(parsed.normals, 3))

      if (parsed.colors) {
        // Use RGB (3 components) for vertex colors — Three.js handles vec3 vertex
        // colors more reliably than vec4 across material types.
        const rgb = new Float32Array(numVerts * 3)
        for (let i = 0; i < numVerts; i++) {
          rgb[i * 3]     = parsed.colors[i * 4]
          rgb[i * 3 + 1] = parsed.colors[i * 4 + 1]
          rgb[i * 3 + 2] = parsed.colors[i * 4 + 2]
        }
        geometry.setAttribute('color', new THREE.BufferAttribute(rgb, 3))
      }

      // Check if any face has alpha < 1
      const hasTransparency = parsed.colors
        ? parsed.colors.some((v, i) => i % 4 === 3 && v < 0.99)
        : false

      // For transparency, compute a min alpha to set material opacity
      let minAlpha = 1.0
      if (hasTransparency && parsed.colors) {
        for (let i = 3; i < parsed.colors.length; i += 4) {
          if (parsed.colors[i] < minAlpha) minAlpha = parsed.colors[i]
        }
      }

      const material = parsed.colors
        ? new THREE.MeshStandardMaterial({
            vertexColors: true,
            metalness: 0.2,
            roughness: 0.6,
            side: THREE.DoubleSide,
            transparent: hasTransparency,
            opacity: hasTransparency ? minAlpha : 1.0,
            depthWrite: !hasTransparency,
          })
        : new THREE.MeshStandardMaterial({
            color: 0x4488cc,
            metalness: 0.2,
            roughness: 0.6,
            side: THREE.DoubleSide,
          })

      return new THREE.Mesh(geometry, material)
    } catch (err) {
      console.error('[OFFViewer] Failed to parse OFF data:', err)
      try {
        const text = new TextDecoder().decode(data.slice(0, 500))
        console.error('[OFFViewer] Raw OFF content (first 500 chars):', text)
      } catch { /* ignore */ }
      return null
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

// ─── Error display ────────────────────────────────────────────────────────────

function ErrorDisplay({ message, logs }: { message: string; logs: string | null }) {
  const [showLogs, setShowLogs] = useState(false)
  return (
    <div className="absolute inset-0 flex flex-col px-3 py-3 gap-2 overflow-auto">
      <div className="text-red-400 text-xs font-semibold">Render Error</div>

      {/* Main error message */}
      <pre className="text-[11px] text-red-300 bg-red-900/20 rounded p-2 whitespace-pre-wrap break-words font-mono leading-relaxed">
        {message}
      </pre>

      {/* Expand logs */}
      {logs && logs.trim().length > 0 && (
        <>
          <button
            className="text-[10px] text-gray-400 hover:text-white transition-colors text-left"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? '▼ Hide full log' : '▶ Show full log'}
          </button>
          {showLogs && (
            <pre className="text-[10px] text-gray-400 bg-gray-800/50 rounded p-2 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-60 overflow-auto">
              {logs}
            </pre>
          )}
        </>
      )}

      <p className="text-[10px] text-gray-500 mt-1">
        Tip: Check the generated code in the bottom panel. Copy it into
        OpenSCAD to diagnose syntax issues. 2D shapes need linear_extrude for STL output.
      </p>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function PreviewPanel() {
  const { renderStatus, renderError, renderLogs, renderResultSTL, renderResultPNG, renderResultOFF, previewMode, generatedCode } = useEditorStore()
  const hasColorHints = /\bcolor\s*\(/.test(generatedCode)

  return (
    <div className="h-full bg-gray-900 border-l border-white/10 flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Preview</span>
        <div className="flex items-center gap-1.5">
          {renderStatus === 'rendering' && (
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          )}
          <span className="text-[10px] text-gray-500">
            {renderStatus === 'rendering' ? 'Rendering…' :
             renderStatus === 'done'      ? (previewMode === 'off' ? '3D' : previewMode.toUpperCase()) :
             renderStatus === 'error'     ? 'Error' :
             'Idle'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {previewMode === 'stl' && hasColorHints && (
          <div className="absolute top-2 left-2 right-2 z-10 rounded border border-amber-500/40 bg-amber-900/30 px-2 py-1 text-[10px] text-amber-200">
            STL preview is geometry-only. Switch to 3D mode for color preview.
          </div>
        )}

        {renderStatus === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 text-center px-6">
            <div className="text-5xl mb-4 opacity-30">◈</div>
            <p className="text-xs text-gray-500">Click <span className="text-white font-semibold">Render</span> or enable auto-render</p>
          </div>
        )}

        {renderStatus === 'error' && renderError && (
          <ErrorDisplay message={renderError} logs={renderLogs} />
        )}

        {/* Only show viewers when render succeeded — hide stale geometry on error */}
        {renderStatus !== 'error' && previewMode === 'off' && renderResultOFF && (
          <OFFViewer data={renderResultOFF} />
        )}

        {renderStatus !== 'error' && previewMode === 'stl' && renderResultSTL && (
          <STLViewer data={renderResultSTL} />
        )}

        {renderStatus !== 'error' && previewMode === 'png' && renderResultPNG && (
          <PNGViewer data={renderResultPNG} />
        )}

        {renderStatus === 'rendering' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900/60">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500">Compiling with OpenSCAD WASM…</p>
          </div>
        )}
      </div>
    </div>
  )
}
