import { Archive, Gamepad2, Search, FolderOpen, Plus, Settings } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";

interface ToolbarProps {
  mode: "archive" | "table";
  onModeChange: (mode: "archive" | "table") => void;
}

export function Toolbar({ mode, onModeChange }: ToolbarProps) {
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  return (
    <header className="h-12 bg-surface border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
      {/* Logo / Başlık */}
      <div className="flex items-center gap-2 mr-4">
        <Archive className="w-5 h-5 text-accent" />
        <span className="font-bold text-text text-sm tracking-wide">MASAL HARİTASI</span>
      </div>

      {/* Mod Geçişi */}
      <div className="flex bg-background-secondary rounded-md p-0.5">
        <button
          onClick={() => onModeChange("archive")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            mode === "archive"
              ? "bg-surface-active text-text"
              : "text-text-muted hover:text-text"
          }`}
        >
          <Archive className="w-4 h-4" />
          Arşiv
        </button>
        <button
          onClick={() => onModeChange("table")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            mode === "table"
              ? "bg-surface-active text-text"
              : "text-text-muted hover:text-text"
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          Masa
        </button>
      </div>

      <div className="flex-1" />

      {/* Araçlar */}
      <button
        onClick={() => setSearchOpen(true)}
        className="btn-ghost flex items-center gap-1.5"
        title="Ara (Ctrl+K)"
      >
        <Search className="w-4 h-4" />
        <span className="text-xs text-text-muted hidden sm:inline">Ctrl+K</span>
      </button>

      <button className="btn-ghost" title="Kampanya Aç">
        <FolderOpen className="w-4 h-4" />
      </button>

      <button className="btn-primary flex items-center gap-1.5" title="Yeni Kayıt">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Yeni</span>
      </button>

      <button className="btn-ghost" title="Ayarlar">
        <Settings className="w-4 h-4" />
      </button>
    </header>
  );
}
