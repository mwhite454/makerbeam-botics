interface SketchTabBarProps {
  showParameters: boolean
  onToggleParameters: (v: boolean) => void
}

export function SketchTabBar({ showParameters, onToggleParameters }: SketchTabBarProps) {
  return (
    <div className="h-8 bg-gray-900 border-t border-white/10 flex items-stretch shrink-0 overflow-x-auto">
      <button
        className={`px-3 text-[11px] font-medium transition-colors border-t-2 ${
          !showParameters
            ? 'bg-gray-800 text-white border-t-pink-400'
            : 'bg-gray-900 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 border-t-transparent'
        }`}
        onClick={() => onToggleParameters(false)}
      >
        Canvas
      </button>

      <div className="my-1.5 mx-1 w-px bg-white/10 shrink-0" />

      <button
        className={`px-3 text-[11px] font-medium transition-colors border-t-2 ${
          showParameters
            ? 'bg-gray-800 text-amber-300 border-t-amber-400'
            : 'bg-gray-900 text-gray-500 hover:text-amber-300 hover:bg-gray-800/50 border-t-transparent'
        }`}
        onClick={() => onToggleParameters(true)}
      >
        Parameters
      </button>
    </div>
  )
}
