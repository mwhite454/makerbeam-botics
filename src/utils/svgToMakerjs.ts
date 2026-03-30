import makerjs from 'makerjs'

// Flip SVG y-axis to MakerJS coordinate system (SVG y increases downward, MakerJS upward)
function flipY(y: number): number {
  return -y
}

// Parse a simple SVG transform attribute — supports translate(x,y) and matrix(a,b,c,d,e,f)
function parseTransform(transform: string | null): { tx: number; ty: number; scaleX: number; scaleY: number } {
  const result = { tx: 0, ty: 0, scaleX: 1, scaleY: 1 }
  if (!transform) return result

  const translate = transform.match(/translate\(\s*([+-]?\d*\.?\d+)(?:[,\s]+([+-]?\d*\.?\d+))?\s*\)/)
  if (translate) {
    result.tx = parseFloat(translate[1]) || 0
    result.ty = parseFloat(translate[2] ?? '0') || 0
  }

  const scale = transform.match(/scale\(\s*([+-]?\d*\.?\d+)(?:[,\s]+([+-]?\d*\.?\d+))?\s*\)/)
  if (scale) {
    result.scaleX = parseFloat(scale[1]) || 1
    result.scaleY = parseFloat(scale[2] ?? scale[1]) || 1
  }

  // matrix(a,b,c,d,e,f) — only extract translation (e,f) and uniform scale
  const matrix = transform.match(/matrix\(\s*([+-]?\d*\.?\d+)[,\s]+([+-]?\d*\.?\d+)[,\s]+([+-]?\d*\.?\d+)[,\s]+([+-]?\d*\.?\d+)[,\s]+([+-]?\d*\.?\d+)[,\s]+([+-]?\d*\.?\d+)\s*\)/)
  if (matrix) {
    const a = parseFloat(matrix[1])
    const d = parseFloat(matrix[4])
    const e = parseFloat(matrix[5])
    const f = parseFloat(matrix[6])
    result.tx = e
    result.ty = f
    result.scaleX = a
    result.scaleY = d
  }

  return result
}

function attr(el: Element, name: string, fallback = 0): number {
  const v = el.getAttribute(name)
  return v !== null ? parseFloat(v) || fallback : fallback
}

function parsePointsList(points: string): Array<[number, number]> {
  const nums = points.trim().split(/[\s,]+/).map(Number).filter((n) => !isNaN(n))
  const result: Array<[number, number]> = []
  for (let i = 0; i + 1 < nums.length; i += 2) {
    result.push([nums[i], nums[i + 1]])
  }
  return result
}

/**
 * Convert an SVG string to a MakerJS IModel.
 * Handles <path>, <circle>, <ellipse>, <rect>, <line>, <polyline>, and <polygon> elements.
 * Applies y-axis flip to convert SVG coordinates to MakerJS coordinates.
 */
export function svgToMakerjsModel(svgContent: string): makerjs.IModel {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  const combined: makerjs.IModel = { models: {}, paths: {} }
  let idx = 0

  function addModel(m: makerjs.IModel) {
    combined.models![`el_${idx++}`] = m
  }
  function addPath(p: makerjs.IPath) {
    combined.paths![`el_${idx++}`] = p
  }

  // Collect all relevant SVG elements anywhere in the tree
  const tags = ['path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon']
  for (const tag of tags) {
    const elements = doc.querySelectorAll(tag)
    for (const el of elements) {
      const t = parseTransform(el.getAttribute('transform'))

      if (tag === 'path') {
        const d = el.getAttribute('d')
        if (!d) continue
        // fromSVGPathData already flips y internally
        const m = makerjs.importer.fromSVGPathData(d)
        if (t.tx !== 0 || t.ty !== 0) {
          makerjs.model.move(m, [t.tx, flipY(t.ty)])
        }
        addModel(m)

      } else if (tag === 'circle') {
        const cx = attr(el, 'cx')
        const cy = attr(el, 'cy')
        const r = attr(el, 'r')
        if (r <= 0) continue
        const m: makerjs.IModel = new (makerjs.models as Record<string, new (...a: unknown[]) => makerjs.IModel>).Ellipse(r, r)
        makerjs.model.move(m, [cx + t.tx, flipY(cy) + flipY(t.ty)])
        addModel(m)

      } else if (tag === 'ellipse') {
        const cx = attr(el, 'cx')
        const cy = attr(el, 'cy')
        const rx = attr(el, 'rx')
        const ry = attr(el, 'ry')
        if (rx <= 0 || ry <= 0) continue
        const m: makerjs.IModel = new (makerjs.models as Record<string, new (...a: unknown[]) => makerjs.IModel>).Ellipse(rx, ry)
        makerjs.model.move(m, [cx + t.tx, flipY(cy) + flipY(t.ty)])
        addModel(m)

      } else if (tag === 'rect') {
        const x = attr(el, 'x')
        const y = attr(el, 'y')
        const w = attr(el, 'width')
        const h = attr(el, 'height')
        if (w <= 0 || h <= 0) continue
        // Build 4 lines (ignore rounded corners for now)
        const x1 = x + t.tx, y1 = flipY(y) + flipY(t.ty)
        const x2 = x + w + t.tx, y2 = flipY(y + h) + flipY(t.ty)
        const rectModel: makerjs.IModel = {
          paths: {
            top:    new makerjs.paths.Line([x1, y2], [x2, y2]),
            right:  new makerjs.paths.Line([x2, y2], [x2, y1]),
            bottom: new makerjs.paths.Line([x2, y1], [x1, y1]),
            left:   new makerjs.paths.Line([x1, y1], [x1, y2]),
          },
        }
        addModel(rectModel)

      } else if (tag === 'line') {
        const x1 = attr(el, 'x1'), y1 = attr(el, 'y1')
        const x2 = attr(el, 'x2'), y2 = attr(el, 'y2')
        addPath(new makerjs.paths.Line(
          [x1 + t.tx, flipY(y1) + flipY(t.ty)],
          [x2 + t.tx, flipY(y2) + flipY(t.ty)],
        ))

      } else if (tag === 'polyline' || tag === 'polygon') {
        const pointsStr = el.getAttribute('points')
        if (!pointsStr) continue
        const pts = parsePointsList(pointsStr)
        if (pts.length < 2) continue
        const lineModel: makerjs.IModel = { paths: {} }
        const last = tag === 'polygon' ? pts.length : pts.length - 1
        for (let i = 0; i < last; i++) {
          const [ax, ay] = pts[i]
          const [bx, by] = pts[(i + 1) % pts.length]
          lineModel.paths![`seg_${i}`] = new makerjs.paths.Line(
            [ax + t.tx, flipY(ay) + flipY(t.ty)],
            [bx + t.tx, flipY(by) + flipY(t.ty)],
          )
        }
        addModel(lineModel)
      }
    }
  }

  return combined
}
