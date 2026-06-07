import { useState, useEffect, useMemo, useCallback } from "react";
import { useUIStore } from "../../stores/uiStore";
import { useArchiveStore } from "../../stores/archiveStore";
import { WorldRecord, RecordType, RecordTypeLabels } from "../../types";
import {
  Search,
  X,
  Globe,
  User,
  Flag,
  BookOpen,
  Package,
  Scroll,
  MapPin,
  FileText,
  Star,
  HelpCircle,
} from "lucide-react";

const TypeIcons: Record<RecordType, React.ElementType> = {
  location: MapPin,
  npc: User,
  faction: Flag,
  religion: BookOpen,
  culture: Globe,
  item: Package,
  quest: Scroll,
  rumor: HelpCircle,
  event: Star,
  lore: BookOpen,
  map: MapPin,
  handout: FileText,
};

export function SearchPalette(): React.ReactElement | null {
  const isOpen = useUIStore((s) => s.isSearchOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const records = useArchiveStore((s) => s.records);
  const setSelectedRecord = useArchiveStore((s) => s.setSelectedRecord);
  const addRecentRecord = useUIStore((s) => s.addRecentRecord);

  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setSearchOpen]);

  // Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return records
      .filter((r) => {
        const nameMatch = r.name.toLowerCase().includes(lower);
        const descMatch = r.description.toLowerCase().includes(lower);
        const tagMatch = r.tags.some((t) => t.toLowerCase().includes(lower));
        return nameMatch || descMatch || tagMatch;
      })
      .slice(0, 50);
  }, [records, query]);

  const handleSelect = useCallback(
    (record: WorldRecord) => {
      setSelectedRecord(record.id, record.type);
      addRecentRecord(record.id);
      setSearchOpen(false);
      setQuery("");
    },
    [setSelectedRecord, addRecentRecord, setSearchOpen]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[60vh]">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
          <Search className="w-5 h-5 text-text-muted" />
          <input
            type="text"
            autoFocus
            placeholder="Kayıt, etiket veya açıklama ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-text placeholder-text-muted focus:outline-none text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-text-muted hover:text-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-border text-xs text-text-muted font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 p-2">
          {results.length === 0 ? (
            <div className="text-text-muted text-sm text-center py-8">
              {query.trim()
                ? "Sonuç bulunamadı"
                : "Aramaya başlamak için yazın..."}
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {results.map((record) => {
                const Icon = TypeIcons[record.type];
                return (
                  <button
                    key={record.id}
                    onClick={() => handleSelect(record)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-left hover:bg-surface-hover transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-md bg-background-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-text-muted group-hover:text-text" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text truncate">
                        {record.name}
                      </div>
                      <div className="text-xs text-text-muted truncate">
                        {RecordTypeLabels[record.type]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-background-secondary/50 flex items-center justify-between text-xs text-text-muted flex-shrink-0">
          <span>{results.length} sonuç</span>
        </div>
      </div>
    </div>
  );
}
