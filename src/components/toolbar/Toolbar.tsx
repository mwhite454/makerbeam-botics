import { useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { ExportDropdown } from "./ExportDropdown";
import { useOpenSCAD } from "@/wasm/useOpenSCAD";
import { clearSavedProject } from "@/hooks/useAutoSave";
import {
  usePreferencesStore,
  type AutoSaveInterval,
} from "@/store/preferencesStore";
import type { WasmStatus } from "@/wasm/useOpenSCAD";

interface ToolbarProps {
  onRender: () => void;
}

function WasmIndicator({ status }: { status: WasmStatus }) {
  const colors: Record<WasmStatus, string> = {
    loading: "bg-yellow-400",
    ready: "bg-green-400",
    unavailable: "bg-red-500",
  };
  const labels: Record<WasmStatus, string> = {
    loading: "WASM loading…",
    ready: "WASM ready",
    unavailable: "WASM unavailable",
  };
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
      <div
        className={`w-2 h-2 rounded-full ${colors[status]} ${status === "loading" ? "animate-pulse" : ""}`}
      />
      {labels[status]}
    </div>
  );
}

function sanitizeFilename(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project"
  );
}

export function Toolbar({ onRender }: ToolbarProps) {
  const { wasmStatus } = useOpenSCAD();
  const {
    renderStatus,
    previewMode,
    autoRender,
    codePanelOpen,
    setPreviewMode,
    setAutoRender,
    toggleCodePanel,
    exportProject,
    importProject,
    projectName,
    setProjectName,
    resetProject,
    clearAllHalts,
  } = useEditorStore();
  const hasHalts = useEditorStore((s) =>
    s.nodes.some((n) => (n.data as Record<string, unknown>)._halted),
  );

  const autoSaveEnabled = usePreferencesStore((s) => s.autoSaveEnabled);
  const autoSaveIntervalMs = usePreferencesStore((s) => s.autoSaveIntervalMs);
  const setAutoSaveEnabled = usePreferencesStore((s) => s.setAutoSaveEnabled);
  const setAutoSaveIntervalMs = usePreferencesStore(
    (s) => s.setAutoSaveIntervalMs,
  );
  const stripHaltsOnExport = usePreferencesStore((s) => s.stripHaltsOnExport);
  const setStripHaltsOnExport = usePreferencesStore(
    (s) => s.setStripHaltsOnExport,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const json = exportProject(stripHaltsOnExport);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(projectName)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    fileInputRef.current?.click();
  };

  const handleNew = () => {
    if (
      !window.confirm(
        "Start a new project? Your current project will be downloaded first.",
      )
    )
      return;
    handleSave();
    resetProject();
    clearSavedProject();
    usePreferencesStore.getState().setLastViewport({ x: 0, y: 0, zoom: 1 });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        importProject(reader.result);
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be loaded again
    e.target.value = "";
  };

  return (
    <header className="h-10 bg-gray-950 border-b border-white/10 flex items-center gap-3 px-4 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center text-[10px] font-black text-gray-900">
          MB
        </div>
        <input
          type="text"
          className="text-sm font-semibold text-white bg-transparent border-none outline-none w-36 hover:bg-gray-800 focus:bg-gray-800 rounded px-1 -ml-1 transition-colors placeholder:text-gray-500"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Untitled Project"
          title="Project name (click to edit)"
        />
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-gray-700" />

      {/* Save/Load/New */}
      <button
        className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
        onClick={handleSave}
        title="Save project to file"
      >
        Save
      </button>
      <button
        className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
        onClick={handleLoad}
        title="Load project from file"
      >
        Load
      </button>
      <button
        className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
        onClick={handleNew}
        title="Start a new project (current project will be saved first)"
      >
        New +
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Separator */}
      <div className="w-px h-5 bg-gray-700" />

      <ExportDropdown />

      {/* Separator */}
      <div className="w-px h-5 bg-gray-700" />

      {/* Auto-save controls */}
      <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          className="accent-blue-500"
          checked={autoSaveEnabled}
          onChange={(e) => setAutoSaveEnabled(e.target.checked)}
        />
        Auto-save
      </label>
      {autoSaveEnabled && (
        <select
          className="text-[11px] bg-gray-800 text-gray-400 border border-gray-700 rounded px-1 py-0.5"
          value={String(autoSaveIntervalMs)}
          onChange={(e) => {
            const v = e.target.value;
            setAutoSaveIntervalMs(
              v === "off" ? "off" : (Number(v) as AutoSaveInterval),
            );
          }}
        >
          <option value="10000">10s</option>
          <option value="30000">30s</option>
          <option value="60000">1 min</option>
          <option value="300000">5 min</option>
        </select>
      )}

      <div className="flex-1" />

      {/* Auto-render toggle */}
      <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          className="accent-blue-500"
          checked={autoRender}
          onChange={(e) => setAutoRender(e.target.checked)}
        />
        Auto-render
      </label>

      {/* Halt controls */}
      {hasHalts && (
        <button
          className="px-2 py-1 rounded text-[11px] font-semibold bg-red-600/80 hover:bg-red-500 text-white transition-colors"
          onClick={clearAllHalts}
          title="Remove all halt breakpoints"
        >
          Clear Halts
        </button>
      )}

      {/* Strip halts on export */}
      <label
        className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer"
        title="Remove halt debug flags when saving to file"
      >
        <input
          type="checkbox"
          className="accent-red-400"
          checked={stripHaltsOnExport}
          onChange={(e) => setStripHaltsOnExport(e.target.checked)}
        />
        Strip halts
      </label>

      {/* Manual render button */}
      <button
        className={`
          px-3 py-1 rounded text-xs font-semibold transition-all
          ${
            renderStatus === "rendering"
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }
        `}
        onClick={onRender}
        disabled={renderStatus === "rendering"}
      >
        {renderStatus === "rendering" ? "Rendering…" : "Render"}
      </button>

      {/* Preview mode */}
      <div className="flex rounded overflow-hidden border border-white/10 text-[11px]">
        {(
          [
            ["off", "3D"],
            ["stl", "STL"],
            ["png", "PNG"],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            className={`px-2 py-1 transition-colors ${previewMode === mode ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
            onClick={() => setPreviewMode(mode)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Code panel toggle */}
      <button
        className="text-[11px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
        onClick={toggleCodePanel}
      >
        {codePanelOpen ? "▼ Code" : "▲ Code"}
      </button>

      <WasmIndicator status={wasmStatus} />
    </header>
  );
}
