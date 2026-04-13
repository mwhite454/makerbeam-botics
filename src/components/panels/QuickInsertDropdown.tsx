import { useState, useEffect, useRef, useCallback } from "react";
import type { PaletteItem } from "@/types/nodes";
import { CATEGORY_COLORS, CATEGORY_TEXT } from "@/types/nodes";
import {
  PACK_CATEGORY_COLORS,
  PACK_CATEGORY_TEXT,
} from "@/nodepacks";

// Merge core + pack category styling (same pattern as NodePalette)
const ALL_CATEGORY_COLORS: Record<string, string> = {
  ...CATEGORY_COLORS,
  ...PACK_CATEGORY_COLORS,
};
const ALL_CATEGORY_TEXT: Record<string, string> = {
  ...CATEGORY_TEXT,
  ...PACK_CATEGORY_TEXT,
};

interface QuickInsertDropdownProps {
  /** Screen-space X coordinate (left edge of popup). */
  screenX: number;
  /** Screen-space Y coordinate (top edge of popup). */
  screenY: number;
  /** Full list of palette items to search against. */
  paletteItems: PaletteItem[];
  /** Called when the user selects a node type to insert. */
  onInsert: (item: PaletteItem) => void;
  /** Called when the dropdown should close without inserting. */
  onClose: () => void;
}

/**
 * F-005 R5: Filterable quick-insert dropdown.
 *
 * Opened by pressing SPACE on a focused output edge. Shows a searchable list
 * of all palette node types. Keyboard-navigable with arrow keys, Enter to
 * confirm, Escape to cancel.
 *
 * Positioning: placed at the supplied screen coordinates, clamped to stay
 * within the viewport.
 */
export function QuickInsertDropdown({
  screenX,
  screenY,
  paletteItems,
  onInsert,
  onClose,
}: QuickInsertDropdownProps) {
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = paletteItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase()),
  );

  // Reset keyboard highlight when the filter changes
  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  // Auto-focus the search input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the highlighted list item scrolled into view
  useEffect(() => {
    const el = listRef.current?.children[highlightIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex]);

  // Close when the user clicks outside the dropdown
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[highlightIndex];
        if (item) onInsert(item);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      // Stop propagation so the canvas onKeyDown doesn't also fire
      e.stopPropagation();
    },
    [filtered, highlightIndex, onInsert, onClose],
  );

  // Clamp position so the dropdown stays within the viewport
  const POPUP_W = 224; // w-56
  const POPUP_H = 320; // approx max-h
  const left = Math.min(screenX, window.innerWidth - POPUP_W - 8);
  const top = Math.min(screenY, window.innerHeight - POPUP_H - 8);

  return (
    <div
      ref={containerRef}
      style={{ left, top }}
      className="fixed z-50 w-56 bg-gray-900 border border-white/20 rounded-lg shadow-2xl overflow-hidden"
      // Prevent mouse-down from blurring the canvas or triggering edge/node
      // deselect inside ReactFlow
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Search input */}
      <div className="p-2 border-b border-white/10">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Insert node..."
          className="w-full bg-gray-800 text-white text-xs rounded px-2 py-1.5 outline-none placeholder-gray-500 font-mono"
        />
      </div>

      {/* Node list */}
      <ul ref={listRef} className="max-h-60 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <li className="px-3 py-2 text-xs text-gray-500 text-center">
            No matches
          </li>
        ) : (
          filtered.map((item, i) => (
            <li
              key={item.type}
              className={`
                px-3 py-1.5 text-xs cursor-pointer flex items-center gap-2
                transition-colors
                ${i === highlightIndex ? "bg-gray-700" : "hover:bg-gray-800"}
              `}
              onMouseEnter={() => setHighlightIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                onInsert(item);
              }}
            >
              <span
                className={`
                  ${ALL_CATEGORY_COLORS[item.category] ?? "bg-gray-600"}
                  ${ALL_CATEGORY_TEXT[item.category] ?? "text-white"}
                  rounded px-1.5 py-0.5 text-[9px] font-medium shrink-0
                `}
              >
                {item.label}
              </span>
            </li>
          ))
        )}
      </ul>

      {/* Keyboard hint */}
      <div className="px-3 py-1.5 border-t border-white/10 flex gap-3 text-[9px] text-gray-600">
        <span>
          <kbd className="font-mono">↑↓</kbd> navigate
        </span>
        <span>
          <kbd className="font-mono">↵</kbd> insert
        </span>
        <span>
          <kbd className="font-mono">Esc</kbd> cancel
        </span>
      </div>
    </div>
  );
}
