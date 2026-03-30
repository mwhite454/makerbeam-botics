// ─── Node Category ────────────────────────────────────────────────────────────

export type NodeCategory =
  | 'primitive3d'
  | 'primitive2d'
  | 'transform'
  | 'boolean'
  | 'extrusion'
  | 'modifier'
  | 'control'
  | 'import'

// ─── Category styling ─────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<string, string> = {
  primitive3d: 'bg-blue-600',
  primitive2d: 'bg-cyan-600',
  transform:   'bg-orange-500',
  boolean:     'bg-red-600',
  extrusion:   'bg-purple-600',
  modifier:    'bg-green-600',
  control:     'bg-amber-600',
  import:      'bg-gray-600',
}

export const CATEGORY_TEXT: Record<string, string> = {
  primitive3d: 'text-white',
  primitive2d: 'text-white',
  transform:   'text-white',
  boolean:     'text-white',
  extrusion:   'text-white',
  modifier:    'text-white',
  control:     'text-white',
  import:      'text-white',
}

export const CATEGORY_LABELS: Record<string, string> = {
  primitive3d: '3D Primitives',
  primitive2d: '2D Primitives',
  transform:   'Transforms',
  boolean:     'Booleans',
  extrusion:   'Extrusions',
  modifier:    'Modifiers',
  control:     'Control Flow',
  import:      'Import / Export',
}

// ─── Expression type ──────────────────────────────────────────────────────────
// A field value that is either a literal number or a freeform OpenSCAD expression
export type Expr = number | string

// ─── Node data types ──────────────────────────────────────────────────────────

// 3D Primitives
export interface SphereData       { r: Expr; fn: Expr }
export interface CubeData         { x: Expr; y: Expr; z: Expr; center: boolean }
export interface CylinderData     { h: Expr; r1: Expr; r2: Expr; center: boolean; fn: Expr }
export interface PolyhedronData   { points: string; faces: string }

// 2D Primitives
export interface CircleData       { r: Expr; fn: Expr }
export interface SquareData       { x: Expr; y: Expr; center: boolean }
export interface PolygonData      { points: string }
export interface TextData         { text: string; size: Expr; font: string; halign: string; valign: string }

// Transforms
export interface TranslateData    { x: Expr; y: Expr; z: Expr }
export interface RotateData       { x: Expr; y: Expr; z: Expr }
export interface ScaleData        { x: Expr; y: Expr; z: Expr }
export interface MirrorData       { x: Expr; y: Expr; z: Expr }
export interface ResizeData       { x: Expr; y: Expr; z: Expr; auto: boolean }
export interface MultmatrixData   { matrix: string }
export interface OffsetData       { r: Expr; delta: Expr; useR: boolean; chamfer: boolean }

// Booleans
export interface BooleanData      { childCount: number }

// Extrusions
export interface LinearExtrudeData  { height: Expr; center: boolean; twist: Expr; slices: Expr; scale: Expr; fn: Expr }
export interface RotateExtrudeData  { angle: Expr; fn: Expr }

// Modifiers
export interface ColorData        { r: number; g: number; b: number; alpha: Expr; hex: string; advanced: boolean }
export interface ProjectionData   { cut: boolean }

// Control Flow
export interface ForLoopData      { varName: string; start: Expr; end: Expr; step: Expr; bodyTabId?: string }
export interface LoopVarData      { varName: string }
export interface IfCondData        { condition: string }
export interface EchoData          { message: string }
export interface IntersectionForData { varName: string; start: Expr; end: Expr; step: Expr }
export interface AssertData        { condition: string; message: string }
export interface ModuleCallData    {
  moduleName: string
  args: string
  argValues?: Record<string, string>
  argOrder?: string[]
  argTypes?: Record<string, string>
}
export interface ModuleArgData     { argName: string; dataType: string; defaultValue: string }
export interface ExpressionNodeData { parameterName: string; expression: string }

// Sketch Profile (bridge from 2D sketch to 3D editor)
export interface SketchProfileData { sketchName: string }

// Import
export interface ImportSTLData     { filename: string }
export interface SurfaceData       { filename: string; center: boolean }
export interface ImportSketchData  { filename: string }

// ─── Node metadata (shared by all node types) ───────────────────────────────

export interface NodeMeta {
  nodeName?: string
  nodeTags?: string[]
  _searchMatch?: boolean
}

// ─── Group node data ─────────────────────────────────────────────────────────

export interface GroupNodeData {
  label: string
  notes: string
  color: string
  width: number
  height: number
}

// ─── Union type ───────────────────────────────────────────────────────────────

export type AllNodeData =
  (| SphereData
  | CubeData
  | CylinderData
  | PolyhedronData
  | CircleData
  | SquareData
  | PolygonData
  | TextData
  | TranslateData
  | RotateData
  | ScaleData
  | MirrorData
  | ResizeData
  | MultmatrixData
  | OffsetData
  | BooleanData
  | LinearExtrudeData
  | RotateExtrudeData
  | ColorData
  | ProjectionData
  | ForLoopData
  | IfCondData
  | EchoData
  | IntersectionForData
  | AssertData
  | ModuleCallData
  | ModuleArgData
  | LoopVarData
  | ExpressionNodeData
  | SketchProfileData
  | ImportSTLData
  | SurfaceData
  | ImportSketchData
  | GroupNodeData
  ) & NodeMeta

// ─── Palette definition ───────────────────────────────────────────────────────

export interface PaletteItem {
  type: string
  label: string
  // Built-in nodes use NodeCategory; pack nodes may use any string category.
  category: string
  // Widened to Record<string, unknown> so pack nodes can supply their own data
  // shapes without being in AllNodeData.
  defaultData: AllNodeData | Record<string, unknown>
  description?: string
  inputs?: string
}

export const PALETTE_ITEMS: PaletteItem[] = [
  // 3D Primitives
  { type: 'sphere',     label: 'sphere',     category: 'primitive3d', defaultData: { r: 10, fn: 32 } as SphereData,
    description: 'Creates a sphere centered at the origin.', inputs: 'r — radius · $fn — resolution' },
  { type: 'cube',       label: 'cube',       category: 'primitive3d', defaultData: { x: 10, y: 10, z: 10, center: false } as CubeData,
    description: 'Creates a rectangular box.', inputs: 'x / y / z — dimensions · center — origin at center' },
  { type: 'cylinder',   label: 'cylinder',   category: 'primitive3d', defaultData: { h: 10, r1: 5, r2: 5, center: false, fn: 32 } as CylinderData,
    description: 'Creates a cylinder or cone. Setting r1 ≠ r2 produces a frustum.', inputs: 'h — height · r1 / r2 — bottom/top radii · center · $fn' },
  { type: 'polyhedron', label: 'polyhedron', category: 'primitive3d', defaultData: { points: '[[0,0,0],[10,0,0],[0,10,0],[0,0,10]]', faces: '[[0,1,2],[0,1,3],[0,2,3],[1,2,3]]' } as PolyhedronData,
    description: 'Creates an arbitrary solid from a vertex list and face indices.', inputs: 'points — [[x,y,z]…] · faces — [[i,j,k]…]' },

  // 2D Primitives
  { type: 'circle',   label: 'circle',   category: 'primitive2d', defaultData: { r: 10, fn: 32 } as CircleData,
    description: 'Creates a 2D circle in the XY plane.', inputs: 'r — radius · $fn — resolution' },
  { type: 'square',   label: 'square',   category: 'primitive2d', defaultData: { x: 10, y: 10, center: false } as SquareData,
    description: 'Creates a 2D rectangle in the XY plane.', inputs: 'x / y — dimensions · center — origin at center' },
  { type: 'polygon',  label: 'polygon',  category: 'primitive2d', defaultData: { points: '[[0,0],[10,0],[5,10]]' } as PolygonData,
    description: 'Creates a 2D polygon from an explicit list of vertices.', inputs: 'points — [[x,y]…] as a JSON array' },
  { type: 'scadtext', label: 'text',     category: 'primitive2d', defaultData: { text: 'Hello', size: 10, font: 'Liberation Sans', halign: 'left', valign: 'baseline' } as TextData,
    description: 'Generates 2D text geometry from a string using a system font.', inputs: 'text · size · font · halign · valign' },
  { type: 'sketch_profile', label: 'sketch profile', category: 'primitive2d', defaultData: { sketchName: '' } as SketchProfileData,
    description: 'Uses a 2D profile from a Sketch tab as geometry. The sketch is converted to an OpenSCAD polygon.', inputs: 'sketch — select a sketch tab to use' },

  // Transforms
  { type: 'translate',  label: 'translate',  category: 'transform', defaultData: { x: 0, y: 0, z: 0 } as TranslateData,
    description: 'Moves all child nodes by an offset vector.', inputs: 'x / y / z — offset · connects to: child nodes' },
  { type: 'rotate',     label: 'rotate',     category: 'transform', defaultData: { x: 0, y: 0, z: 0 } as RotateData,
    description: 'Rotates all child nodes around the X, Y, and Z axes (degrees).', inputs: 'x / y / z — rotation angles · connects to: child nodes' },
  { type: 'scale',      label: 'scale',      category: 'transform', defaultData: { x: 1, y: 1, z: 1 } as ScaleData,
    description: 'Scales all child nodes by per-axis factors.', inputs: 'x / y / z — scale factors · connects to: child nodes' },
  { type: 'mirror',     label: 'mirror',     category: 'transform', defaultData: { x: 1, y: 0, z: 0 } as MirrorData,
    description: 'Mirrors child nodes across a plane defined by a normal vector.', inputs: 'x / y / z — plane normal · connects to: child nodes' },
  { type: 'resize',     label: 'resize',     category: 'transform', defaultData: { x: 10, y: 10, z: 10, auto: false } as ResizeData,
    description: 'Resizes child nodes to exact absolute dimensions.', inputs: 'x / y / z — target sizes · auto — auto-scale remaining axes' },
  { type: 'multmatrix', label: 'multmatrix', category: 'transform', defaultData: { matrix: '[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]' } as MultmatrixData,
    description: 'Applies an arbitrary 4×4 affine transformation matrix to child nodes.', inputs: 'matrix — 4×4 array as a JSON string' },
  { type: 'offset',     label: 'offset',     category: 'transform', defaultData: { r: 1, delta: 1, useR: true, chamfer: false } as OffsetData,
    description: 'Expands or contracts a 2D shape outward or inward.', inputs: 'r — round offset · delta — sharp offset · chamfer · connects to: 2D child' },

  // Booleans
  { type: 'union',        label: 'union',        category: 'boolean', defaultData: { childCount: 2 } as BooleanData,
    description: 'Merges all child shapes into a single solid (logical OR).', inputs: 'connects to: 2+ child nodes' },
  { type: 'difference',   label: 'difference',   category: 'boolean', defaultData: { childCount: 2 } as BooleanData,
    description: 'Subtracts subsequent child shapes from the first child (logical NOT).', inputs: 'connects to: 2+ child nodes (first is the base)' },
  { type: 'intersection', label: 'intersection', category: 'boolean', defaultData: { childCount: 2 } as BooleanData,
    description: 'Keeps only the volume shared by all child shapes (logical AND).', inputs: 'connects to: 2+ child nodes' },

  // Extrusions
  { type: 'linear_extrude', label: 'linear_extrude', category: 'extrusion', defaultData: { height: 10, center: false, twist: 0, slices: 20, scale: 1, fn: 0 } as LinearExtrudeData,
    description: 'Extrudes a 2D profile upward along the Z axis into a 3D solid.', inputs: 'height · center · twist (°) · slices · scale · $fn · connects to: 2D child' },
  { type: 'rotate_extrude', label: 'rotate_extrude', category: 'extrusion', defaultData: { angle: 360, fn: 32 } as RotateExtrudeData,
    description: 'Revolves a 2D profile around the Z axis to create a solid of revolution.', inputs: 'angle (°) · $fn · connects to: 2D child (must be in positive X half-plane)' },

  // Modifiers
  { type: 'hull',        label: 'hull',        category: 'modifier', defaultData: { childCount: 2 } as BooleanData,
    description: 'Creates the convex hull enclosing all child shapes.', inputs: 'connects to: 2+ child nodes' },
  { type: 'minkowski',   label: 'minkowski',   category: 'modifier', defaultData: { childCount: 2 } as BooleanData,
    description: 'Computes the Minkowski sum — sweeps one shape along the surface of another.', inputs: 'connects to: 2 child nodes' },
  { type: 'color',       label: 'color',       category: 'modifier', defaultData: { r: 0.5, g: 0.5, b: 0.8, alpha: 1, hex: '#8080cc', advanced: false } as ColorData,
    description: 'Applies a display color to child geometry (preview only, not exported).', inputs: 'r / g / b — 0–1 · alpha · connects to: child nodes' },
  { type: 'projection',  label: 'projection',  category: 'modifier', defaultData: { cut: false } as ProjectionData,
    description: 'Flattens 3D geometry onto the XY plane to produce a 2D outline or cross-section.', inputs: 'cut — true for cross-section at z=0 · connects to: 3D child' },
  { type: 'render_node', label: 'render',      category: 'modifier', defaultData: { childCount: 1 } as BooleanData,
    description: 'Forces full CGAL evaluation of child geometry. Speeds up complex models during design.', inputs: 'connects to: child nodes' },

  // Control Flow
  { type: 'for_loop',  label: 'for',      category: 'control', defaultData: { varName: 'i', start: 0, end: 5, step: 1 } as ForLoopData,
    description: 'Iterates over a numeric range, instantiating child nodes once per step.', inputs: 'var — loop variable name · start / end / step' },
  { type: 'if_cond',   label: 'if',       category: 'control', defaultData: { condition: 'true' } as IfCondData,
    description: 'Includes child nodes only when the condition expression evaluates to true.', inputs: 'condition — any OpenSCAD boolean expression' },
  { type: 'echo_node', label: 'echo',     category: 'control', defaultData: { message: 'debug' } as EchoData,
    description: 'Prints a message or value to the OpenSCAD console for debugging.', inputs: 'message — string or expression' },
  { type: 'intersection_for', label: 'intersection_for', category: 'control', defaultData: { varName: 'i', start: 0, end: 5, step: 1 } as IntersectionForData,
    description: 'Intersects child geometry across all loop iterations (intersection of instances).', inputs: 'var · start / end / step' },
  { type: 'assert_node', label: 'assert', category: 'control', defaultData: { condition: 'true', message: '' } as AssertData,
    description: 'Halts rendering with an error if the condition is false. Useful for parameter validation.', inputs: 'condition — expression · message — optional error text' },
  { type: 'module_call', label: 'module_call', category: 'control', defaultData: { moduleName: '', args: '', argValues: {} } as ModuleCallData,
    description: 'Calls a named OpenSCAD module defined in another tab or the current file.', inputs: 'module name · arguments (name=value pairs)' },
  { type: 'module_arg', label: 'module_arg', category: 'control', defaultData: { argName: 'param', dataType: 'number', defaultValue: '0' } as ModuleArgData,
    description: 'Declares a parameter for the current module tab. Only available on module tabs.', inputs: 'arg name · data type · default value' },
  { type: 'expression_node', label: 'expression', category: 'control', defaultData: { parameterName: '', expression: '{param}' } as ExpressionNodeData,
    description: 'Evaluates an OpenSCAD expression and exposes the result as a named value for use downstream.', inputs: 'parameter name · expression (use {varName} to reference upstream values)' },
  { type: 'loop_var', label: 'loop var', category: 'control', defaultData: { varName: 'i' } as LoopVarData,
    description: 'Exposes the loop variable from the parent ForLoop as a wirable output. Auto-placed when creating a loop body tab.', inputs: '(none) · output: loop variable identifier' },

  // Import
  { type: 'import_stl',   label: 'import',  category: 'import', defaultData: { filename: 'model.stl' } as ImportSTLData,
    description: 'Imports an external geometry file (STL, OBJ, etc.) into the model.', inputs: 'filename — path relative to the project' },
  { type: 'surface_node', label: 'surface', category: 'import', defaultData: { filename: 'heightmap.dat', center: false } as SurfaceData,
    description: 'Generates a 3D surface from a 2D heightmap data file (.dat or .png).', inputs: 'filename · center — origin at center of surface' },

]
