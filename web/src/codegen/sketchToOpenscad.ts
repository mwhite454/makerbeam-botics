import type { Node, Edge } from '@xyflow/react'
import makerjs from 'makerjs'
import type { GlobalParameter } from '@/store/editorStore'
import { buildSketchModel } from './sketchCodegen'

/**
 * Convert a sketch tab's nodes/edges into OpenSCAD polygon code.
 *
 * Pipeline:
 * 1. Build MakerJS IModel from the sketch node graph
 * 2. Find chains (closed paths) with containment hierarchy
 * 3. Discretize curves into point arrays
 * 4. Emit OpenSCAD polygon(points, paths) with proper winding for holes
 */
export function sketchToOpenscad(
  nodes: Node[],
  edges: Edge[],
  globalParameters: GlobalParameter[] = [],
  maxArcFacet?: number,
): string {
  const model = buildSketchModel(nodes, edges, globalParameters)
  if (!model) return '// Empty sketch\n'
  return modelToOpenscad(model, maxArcFacet)
}

/**
 * Convert a MakerJS IModel to OpenSCAD polygon code.
 */
export function modelToOpenscad(
  model: makerjs.IModel,
  maxArcFacet: number = 1,
): string {
  // Find all chains with containment hierarchy
  const chains = makerjs.model.findChains(model, {
    contain: { alternateDirection: true },
  }) as makerjs.IChain[]

  if (!chains || chains.length === 0) {
    return '// No closed paths found in sketch\n'
  }

  // Group chains into top-level profiles (each with their holes)
  const profiles: { outer: makerjs.IChain; holes: makerjs.IChain[] }[] = []

  for (const chain of chains) {
    profiles.push({
      outer: chain,
      holes: collectHoles(chain),
    })
  }

  if (profiles.length === 0) {
    return '// No closed paths found in sketch\n'
  }

  // Generate polygon code for each profile
  const polygonCodes = profiles.map((profile) => emitPolygon(profile.outer, profile.holes, maxArcFacet))

  if (polygonCodes.length === 1) {
    return polygonCodes[0]
  }

  // Multiple disconnected profiles: wrap in union
  const inner = polygonCodes.map((c) => '  ' + c.trim()).join('\n')
  return `union() {\n${inner}\n}\n`
}

/**
 * Recursively collect all contained (hole) chains from a parent chain.
 */
function collectHoles(chain: makerjs.IChain): makerjs.IChain[] {
  const holes: makerjs.IChain[] = []
  if (chain.contains) {
    for (const child of chain.contains) {
      holes.push(child)
      // Grandchildren are solids inside holes - they become separate profiles
      // For now, we only handle one level of containment (holes in outer)
    }
  }
  return holes
}

/**
 * Emit a single OpenSCAD polygon() call from an outer chain and its holes.
 */
function emitPolygon(
  outer: makerjs.IChain,
  holes: makerjs.IChain[],
  maxArcFacet: number,
): string {
  const allPoints: [number, number][] = []
  const paths: number[][] = []

  // Get outer chain points
  const outerPoints = chainToPoints(outer, maxArcFacet)
  // Ensure outer is counter-clockwise (OpenSCAD convention)
  if (isClockwise(outerPoints)) {
    outerPoints.reverse()
  }

  const outerPath: number[] = []
  for (const pt of outerPoints) {
    outerPath.push(allPoints.length)
    allPoints.push(pt)
  }
  paths.push(outerPath)

  // Get hole chain points
  for (const hole of holes) {
    const holePoints = chainToPoints(hole, maxArcFacet)
    // Ensure holes are clockwise (OpenSCAD convention)
    if (!isClockwise(holePoints)) {
      holePoints.reverse()
    }

    const holePath: number[] = []
    for (const pt of holePoints) {
      holePath.push(allPoints.length)
      allPoints.push(pt)
    }
    paths.push(holePath)
  }

  // Format points
  const pointsStr = allPoints
    .map(([x, y]) => `[${round(x)}, ${round(y)}]`)
    .join(', ')

  // Compute convexity: 2 * (1 + number of holes)
  const convexity = 2 * (1 + holes.length)

  if (paths.length === 1) {
    // Simple polygon, no holes
    return `polygon(points = [${pointsStr}]); // convexity = ${convexity}\n`
  }

  // Polygon with holes: need paths parameter
  const pathsStr = paths
    .map((p) => `[${p.join(', ')}]`)
    .join(', ')

  return `polygon(points = [${pointsStr}], paths = [${pathsStr}], convexity = ${convexity});\n`
}

/**
 * Convert a MakerJS chain to an array of [x, y] points by discretizing arcs/curves.
 */
function chainToPoints(chain: makerjs.IChain, maxArcFacet: number): [number, number][] {
  try {
    const keyPoints = makerjs.chain.toKeyPoints(chain, maxArcFacet)
    return keyPoints.map((pt) => [pt[0] ?? 0, pt[1] ?? 0] as [number, number])
  } catch {
    // Fallback: try to extract points from chain links
    const points: [number, number][] = []
    if (chain.links) {
      for (const link of chain.links) {
        const kp = makerjs.path.toKeyPoints(link.walkedPath.pathContext, maxArcFacet)
        for (const pt of kp) {
          points.push([pt[0] ?? 0, pt[1] ?? 0])
        }
      }
    }
    return deduplicatePoints(points)
  }
}

/**
 * Check if a polygon (array of points) is clockwise using the shoelace formula.
 */
function isClockwise(points: [number, number][]): boolean {
  if (points.length < 3) return false
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[(i + 1) % points.length]
    sum += (x2 - x1) * (y2 + y1)
  }
  return sum > 0
}

/**
 * Remove consecutive duplicate points (within tolerance).
 */
function deduplicatePoints(points: [number, number][], tolerance = 0.001): [number, number][] {
  if (points.length === 0) return points
  const result: [number, number][] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const [px, py] = result[result.length - 1]
    const [x, y] = points[i]
    if (Math.abs(x - px) > tolerance || Math.abs(y - py) > tolerance) {
      result.push(points[i])
    }
  }
  return result
}

/**
 * Round a number to reasonable precision for OpenSCAD output.
 */
function round(n: number): string {
  const r = Math.round(n * 10000) / 10000
  return String(r)
}
