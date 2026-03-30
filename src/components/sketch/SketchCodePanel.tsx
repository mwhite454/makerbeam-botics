import { useEditorStore } from '@/store/editorStore'
import { useState } from 'react'

export function SketchCodePanel() {
  const generatedCode = useEditorStore((s) => s.sketchGeneratedCode)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="h-full bg-gray-950 border-t border-white/10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 shrink-0">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Generated Maker.js</span>
        <button
          className="text-[10px] px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          onClick={copy}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Code */}
      <pre className="flex-1 overflow-auto px-4 py-2 text-[11px] font-mono text-pink-400 leading-relaxed">
        {generatedCode || '// Add sketch nodes to the canvas…'}
      </pre>
    </div>
  )
}
