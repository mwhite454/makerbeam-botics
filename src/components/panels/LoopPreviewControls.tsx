/**
 * F-002 R4: Iteration Slider UI
 *
 * Horizontal control bar rendered in the PreviewPanel header when the active
 * tab is a loop body. Lets the user choose a single iteration value or a range
 * to render, with a mode toggle and a bounded slider.
 */
import { useEditorStore } from '@/store/editorStore'

export function LoopPreviewControls() {
  const loopPreviewMode  = useEditorStore((s) => s.loopPreviewMode)
  const loopPreviewValue = useEditorStore((s) => s.loopPreviewValue)
  const loopPreviewRange = useEditorStore((s) => s.loopPreviewRange)
  const setLoopPreviewMode  = useEditorStore((s) => s.setLoopPreviewMode)
  const setLoopPreviewValue = useEditorStore((s) => s.setLoopPreviewValue)
  const setLoopPreviewRange = useEditorStore((s) => s.setLoopPreviewRange)

  const rangeStart = loopPreviewRange?.start ?? 0
  const rangeEnd   = loopPreviewRange?.end   ?? 5
  const rangeStep  = loopPreviewRange?.step  ?? 1

  return (
    <div className="px-3 py-1.5 border-b border-white/10 bg-amber-950/20 flex flex-col gap-1.5 shrink-0">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Loop Preview</span>
        <div className="flex rounded overflow-hidden border border-amber-700/40 ml-auto">
          <button
            className={`px-2 py-0.5 text-[9px] font-semibold transition-colors ${
              loopPreviewMode === 'single'
                ? 'bg-amber-700/60 text-amber-200'
                : 'bg-transparent text-amber-500 hover:bg-amber-900/40'
            }`}
            onClick={() => setLoopPreviewMode('single')}
          >
            Single
          </button>
          <button
            className={`px-2 py-0.5 text-[9px] font-semibold transition-colors ${
              loopPreviewMode === 'range'
                ? 'bg-amber-700/60 text-amber-200'
                : 'bg-transparent text-amber-500 hover:bg-amber-900/40'
            }`}
            onClick={() => setLoopPreviewMode('range')}
          >
            Range
          </button>
        </div>
      </div>

      {loopPreviewMode === 'single' ? (
        /* Single mode: slider + numeric input */
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={rangeStart}
            max={rangeEnd}
            step={rangeStep}
            value={loopPreviewValue}
            onChange={(e) => setLoopPreviewValue(Number(e.target.value))}
            className="flex-1 h-1.5 accent-amber-500 cursor-pointer"
          />
          <input
            type="number"
            min={rangeStart}
            max={rangeEnd}
            step={rangeStep}
            value={loopPreviewValue}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (!isNaN(v)) setLoopPreviewValue(v)
            }}
            className="w-14 text-[10px] text-center bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-amber-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      ) : (
        /* Range mode: start / end / step inputs */
        <div className="flex items-center gap-1.5">
          <label className="text-[9px] text-gray-400">start</label>
          <input
            type="number"
            value={rangeStart}
            step={1}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (!isNaN(v)) setLoopPreviewRange({ start: v, end: rangeEnd, step: rangeStep })
            }}
            className="w-14 text-[10px] text-center bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-amber-200 focus:outline-none focus:border-amber-500"
          />
          <label className="text-[9px] text-gray-400">end</label>
          <input
            type="number"
            value={rangeEnd}
            step={1}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (!isNaN(v)) setLoopPreviewRange({ start: rangeStart, end: v, step: rangeStep })
            }}
            className="w-14 text-[10px] text-center bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-amber-200 focus:outline-none focus:border-amber-500"
          />
          <label className="text-[9px] text-gray-400">step</label>
          <input
            type="number"
            value={rangeStep}
            step={0.1}
            min={0.01}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (!isNaN(v) && v > 0) setLoopPreviewRange({ start: rangeStart, end: rangeEnd, step: v })
            }}
            className="w-14 text-[10px] text-center bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-amber-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      )}

      {/* Iteration indicator */}
      <div className="text-[9px] text-amber-600/70 font-mono">
        {loopPreviewMode === 'single'
          ? `i = ${loopPreviewValue}`
          : `i = [${rangeStart} : ${rangeStep} : ${rangeEnd}]`
        }
      </div>
    </div>
  )
}
