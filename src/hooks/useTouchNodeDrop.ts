import { useCallback, useRef } from 'react'
import { useReactFlow, type Node } from '@xyflow/react'
import { useEditorStore } from '@/store/editorStore'

interface TouchDragState {
  nodeType: string
  defaultData: Record<string, unknown>
  label: string
  ghost: HTMLDivElement | null
  touchId: number
}

/**
 * Provides touch drag-and-drop for node palette chips.
 * HTML5 drag-and-drop is unsupported on iOS/iPadOS, so this hook
 * simulates the same interaction using touch events:
 *   touchstart → create ghost  →  touchmove → follow finger
 *   touchend → drop on canvas → addNode at flow position
 */
export function useTouchNodeDrop() {
  const { screenToFlowPosition } = useReactFlow()
  const addNode = useEditorStore((s) => s.addNode)
  const dragState = useRef<TouchDragState | null>(null)

  const cleanup = useCallback(() => {
    const state = dragState.current
    if (!state) return
    if (state.ghost && state.ghost.parentNode) {
      state.ghost.parentNode.removeChild(state.ghost)
    }
    dragState.current = null
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const state = dragState.current
    if (!state || !state.ghost) return
    const touch = Array.from(e.changedTouches).find((t) => t.identifier === state.touchId)
    if (!touch) return

    // Prevent page scroll/zoom during the drag
    e.preventDefault()

    state.ghost.style.left = `${touch.clientX - 30}px`
    state.ghost.style.top = `${touch.clientY - 16}px`
  }, [])

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const state = dragState.current
      if (!state) return

      const touch = Array.from(e.changedTouches).find((t) => t.identifier === state.touchId)

      // Remove ghost before hit-testing so it doesn't intercept elementFromPoint
      cleanup()

      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)

      if (!touch) return

      // Check whether the finger lifted inside the ReactFlow canvas
      const canvasEl = document.querySelector('.react-flow__renderer')
      if (!canvasEl) return

      const rect = canvasEl.getBoundingClientRect()
      const { clientX, clientY } = touch
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return
      }

      const position = screenToFlowPosition({ x: clientX, y: clientY })

      const newNode: Node = {
        id: `${state.nodeType}-touch-${Date.now()}`,
        type: state.nodeType,
        position,
        data: { ...state.defaultData },
      }

      addNode(newNode)
    },
    [cleanup, handleTouchMove, screenToFlowPosition, addNode],
  )

  const handleTouchStart = useCallback(
    (
      e: React.TouchEvent,
      nodeType: string,
      defaultData: Record<string, unknown>,
      label: string,
    ) => {
      // Only act on the first touch point
      const touch = e.touches[0]
      if (!touch) return

      // Build ghost element — identical chip style to palette items
      const ghost = document.createElement('div')
      ghost.textContent = label
      Object.assign(ghost.style, {
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: '9999',
        left: `${touch.clientX - 30}px`,
        top: `${touch.clientY - 16}px`,
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: '500',
        background: 'rgba(55,65,81,0.95)',
        color: '#e5e7eb',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        opacity: '0.92',
      })
      document.body.appendChild(ghost)

      dragState.current = {
        nodeType,
        defaultData,
        label,
        ghost,
        touchId: touch.identifier,
      }

      // Passive:false so touchmove can call preventDefault and block scroll
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    },
    [handleTouchMove, handleTouchEnd],
  )

  return { handleTouchStart }
}
