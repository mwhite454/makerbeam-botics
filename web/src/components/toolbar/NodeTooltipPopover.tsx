interface NodeTooltipPopoverProps {
  label: string
  description: string
  inputs?: string
  anchorRect: DOMRect
}

export function NodeTooltipPopover({ label, description, inputs, anchorRect }: NodeTooltipPopoverProps) {
  const top = Math.min(anchorRect.top, window.innerHeight - 120)

  return (
    <div
      className="fixed z-[9999] w-56 pointer-events-none"
      style={{ left: anchorRect.right + 10, top }}
    >
      <div className="bg-gray-800 border border-white/10 rounded-xl shadow-2xl p-3 flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-white leading-tight">{label}</span>
        <p className="text-[11px] text-gray-300 leading-relaxed">{description}</p>
        {inputs && (
          <p className="text-[10px] text-gray-500 leading-relaxed border-t border-white/5 pt-1.5">
            {inputs}
          </p>
        )}
      </div>
    </div>
  )
}
