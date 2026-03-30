/**
 * Parse an OFF (Object File Format) file into typed arrays suitable for Three.js.
 *
 * OFF files may include per-face RGBA colors (as produced by OpenSCAD's color()
 * function). When colors are present the geometry is expanded to non-indexed
 * form so that each triangle vertex carries its face color.
 */

export interface OFFResult {
  /** Flat xyz positions – 3 floats per vertex, already triangulated & expanded */
  positions: Float32Array
  /** Flat xyz face normals – 3 floats per vertex (one normal per triangle, repeated for each vertex) */
  normals: Float32Array
  /** Flat RGBA colors – 4 floats per vertex, or null when the file has no color data */
  colors: Float32Array | null
}

export function parseOFF(buffer: ArrayBuffer): OFFResult {
  const text = new TextDecoder().decode(buffer)
  const lines = text.split(/\r?\n/)

  let cursor = 0

  // Skip comments and blank lines, find header
  const skipEmpty = () => {
    while (cursor < lines.length) {
      const trimmed = lines[cursor].trim()
      if (trimmed === '' || trimmed.startsWith('#')) { cursor++; continue }
      break
    }
  }

  skipEmpty()

  // Header: OFF, COFF, or nOFF etc.
  // OpenSCAD may put counts on the same line: "OFF 8 6 0"
  const headerLine = lines[cursor].trim()
  const headerMatch = headerLine.match(/^(C?N?OFF)\s*(.*)/i)
  if (!headerMatch) {
    throw new Error(`Not a valid OFF file (header: "${headerLine}")`)
  }
  cursor++

  // Counts may be on the header line or the next non-empty line
  let countsStr = headerMatch[2].trim()
  if (!countsStr) {
    skipEmpty()
    countsStr = lines[cursor].trim()
    cursor++
  }

  const counts = countsStr.split(/\s+/).map(Number)
  const numVertices = counts[0]
  const numFaces = counts[1]

  // Parse vertices
  const verts: number[][] = []
  for (let i = 0; i < numVertices; i++) {
    skipEmpty()
    const parts = lines[cursor].trim().split(/\s+/).map(Number)
    verts.push([parts[0], parts[1], parts[2]])
    cursor++
  }

  // Parse faces and collect triangles + optional colors
  const triPositions: number[] = []
  const triColors: number[] = []
  let hasColors = false

  for (let i = 0; i < numFaces; i++) {
    skipEmpty()
    const rawLine = lines[cursor].trim()
    const parts = rawLine.split(/\s+/).map(Number)
    cursor++

    const n = parts[0] // number of vertices in this face
    const indices = parts.slice(1, 1 + n)

    // Color data follows the vertex indices (if present)
    const colorParts = parts.slice(1 + n)
    let r = 0, g = 0, b = 0, a = 1
    if (colorParts.length >= 3) {
      hasColors = true
      r = colorParts[0]
      g = colorParts[1]
      b = colorParts[2]
      a = colorParts.length >= 4 ? colorParts[3] : 1
    }

    // Log first 3 faces for debugging
    if (i < 3) {
      console.log(`[parseOFF] face ${i}: raw="${rawLine}", n=${n}, indices=[${indices}], colorParts=[${colorParts}], rgba=[${r},${g},${b},${a}]`)
    }

    // Fan-triangulate: (v0, v1, v2), (v0, v2, v3), ...
    for (let t = 1; t < n - 1; t++) {
      const i0 = indices[0], i1 = indices[t], i2 = indices[t + 1]
      for (const vi of [i0, i1, i2]) {
        const v = verts[vi]
        triPositions.push(v[0], v[1], v[2])
        triColors.push(r, g, b, a)
      }
    }
  }

  // Normalise color range: OpenSCAD uses 0-1 floats, but some exporters use 0-255
  if (hasColors) {
    // Only check RGB values for range detection (skip alpha at every 4th index)
    let maxRGB = 0
    for (let i = 0; i < triColors.length; i++) {
      if (i % 4 !== 3) maxRGB = Math.max(maxRGB, triColors[i])
    }
    console.log(`[parseOFF] color stats: hasColors=${hasColors}, maxRGB=${maxRGB}, totalColorValues=${triColors.length}`)
    if (maxRGB > 1.0) {
      for (let i = 0; i < triColors.length; i++) {
        if (i % 4 !== 3) triColors[i] /= 255  // normalise RGB but keep alpha as-is
      }
    }
  }

  const positions = new Float32Array(triPositions)

  // Compute face normals
  const normals = new Float32Array(positions.length)
  for (let i = 0; i < positions.length; i += 9) {
    const ax = positions[i], ay = positions[i + 1], az = positions[i + 2]
    const bx = positions[i + 3], by = positions[i + 4], bz = positions[i + 5]
    const cx = positions[i + 6], cy = positions[i + 7], cz = positions[i + 8]

    const e1x = bx - ax, e1y = by - ay, e1z = bz - az
    const e2x = cx - ax, e2y = cy - ay, e2z = cz - az

    let nx = e1y * e2z - e1z * e2y
    let ny = e1z * e2x - e1x * e2z
    let nz = e1x * e2y - e1y * e2x
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
    nx /= len; ny /= len; nz /= len

    // Same normal for all 3 vertices of the triangle
    for (let v = 0; v < 3; v++) {
      normals[i + v * 3]     = nx
      normals[i + v * 3 + 1] = ny
      normals[i + v * 3 + 2] = nz
    }
  }

  return {
    positions,
    normals,
    colors: hasColors ? new Float32Array(triColors) : null,
  }
}
