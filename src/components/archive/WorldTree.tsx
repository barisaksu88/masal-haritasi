import { useState, useMemo, useCallback } from "react";
import { useArchiveStore } from "../../stores/archiveStore";
import { WorldRecord, RecordType, RecordTypeLabels } from "../../types";
import {
  ChevronRight,
  ChevronDown,
  Globe,
  Users,
  Package,
  ScrollText,
  Flag,
  Church,
  Palette,
  MessageCircle,
  CalendarDays,
  BookOpen,
  Map as MapIcon,
  FileText,
  Search,
  Plus,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { NewRecordDialog } from "../common/NewRecordDialog";

const groupConfig: { type: RecordType; label: string; icon: React.ElementType }[] = [
  { type: "location", label: "Mekânlar", icon: Globe },
  { type: "npc", label: "NPC'ler", icon: Users },
  { type: "item", label: "Eşyalar", icon: Package },
  { type: "quest", label: "Görevler", icon: ScrollText },
  { type: "faction", label: "Fraksiyonlar", icon: Flag },
  { type: "religion", label: "Dinler", icon: Church },
  { type: "culture", label: "Kültürler", icon: Palette },
  { type: "rumor", label: "Söylentiler", icon: MessageCircle },
  { type: "event", label: "Olaylar", icon: CalendarDays },
  { type: "lore", label: "Lore", icon: BookOpen },
  { type: "map", label: "Haritalar", icon: MapIcon },
  { type: "handout", label: "El Notları", icon: FileText },
];

export function WorldTree(): React.ReactElement {
  const records = useArchiveStore((s) => s.records);
  const selectedRecordId = useArchiveStore((s) => s.selectedRecordId);
  const setSelectedRecord = useArchiveStore((s) => s.setSelectedRecord);
  const activeRegionId = useArchiveStore((s) => s.activeRegionId);
  const setActiveRegion = useArchiveStore((s) => s.setActiveRegion);
  const expandedNodes = useArchiveStore((s) => s.expandedNodes);
  const toggleNode = useArchiveStore((s) => s.toggleNode);
  const getRecordsInRegion = useArchiveStore((s) => s.getRecordsInRegion);
  const getChildRegions = useArchiveStore((s) => s.getChildRegions);
  const getRegionBreadcrumb = useArchiveStore((s) => s.getRegionBreadcrumb);

  const [searchQuery, setSearchQuery] = useState("");
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);

  const breadcrumb = useMemo(
    () => getRegionBreadcrumb(activeRegionId),
    [getRegionBreadcrumb, activeRegionId]
  );

  const isSearching = searchQuery.trim().length > 0;

  const groupedRecords = useMemo(() => {
    if (isSearching) return null;

    if (activeRegionId === null) {
      const rootRecords = records.filter((r) => r.parentId === null || r.parentId === undefined);
      const map = new Map<RecordType, WorldRecord[]>();
      for (const r of rootRecords) {
        const list = map.get(r.type) ?? [];
        list.push(r);
        map.set(r.type, list);
      }
      return map;
    }

    const regionRecords = getRecordsInRegion(activeRegionId);
    const map = new Map<RecordType, WorldRecord[]>();
    for (const r of regionRecords) {
      if (r.type === "location") continue;
      const list = map.get(r.type) ?? [];
      list.push(r);
      map.set(r.type, list);
    }
    const childLocs = getChildRegions(activeRegionId);
    if (childLocs.length > 0) {
      map.set("location", childLocs as WorldRecord[]);
    }
    return map;
  }, [isSearching, activeRegionId, records, getRecordsInRegion, getChildRegions]);

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase();
    return records.filter((r) => r.name.toLowerCase().includes(q));
  }, [isSearching, searchQuery, records]);

  const handleSearchResultClick = useCallback(
    (record: WorldRecord) => {
      setActiveRegion(record.parentId ?? null);
      setSelectedRecord(record.id, record.type);
    },
    [setActiveRegion, setSelectedRecord]
  );

  const handleRecordClick = useCallback(
    (record: WorldRecord) => {
      if (record.type === "location") {
        setActiveRegion(record.id);
      } else {
        setSelectedRecord(record.id, record.type);
      }
    },
    [setActiveRegion, setSelectedRecord]
  );

  const handleBreadcrumbClick = useCallback(
    (id: string | null) => {
      setActiveRegion(id);
    },
    [setActiveRegion]
  );

  return (
    <>
      <div className="flex flex-col h-full bg-surface">
        {/* Header */}
        <div className="panel-header border-b border-border flex-shrink-0">
          <Globe className="w-4 h-4 text-accent" />
          <span>DÜNYA AĞACI</span>
        </div>

        {/* Search */}
        <div className="p-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-9"
            />
          </div>
        </div>

        {/* Breadcrumb + Back */}
        {!isSearching && (
          <div className="px-3 pt-2 flex-shrink-0 flex items-center gap-2 flex-wrap">
            {activeRegionId !== null && (
              <button
                onClick={() => setActiveRegion(null)}
                className="text-text-muted hover:text-text p-1 rounded hover:bg-surface-hover transition-colors"
                title="Geri"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-1 text-xs text-text-muted flex-wrap">
              {breadcrumb.map((segment, idx) => (
                <span key={segment.id ?? "root"} className="flex items-center gap-1">
                  {idx > 0 && <ChevronRight className="w-3 h-3" />}
                  <button
                    onClick={() => handleBreadcrumbClick(segment.id)}
                    className={`hover:text-text transition-colors ${
                      idx === breadcrumb.length - 1 ? "text-text font-medium" : ""
                    }`}
                  >
                    {segment.name}
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {isSearching ? (
            searchResults.length === 0 ? (
              <div className="text-text-muted text-sm text-center py-4">
                Kayıt bulunamadı
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {searchResults.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => handleSearchResultClick(record)}
                    className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                      selectedRecordId === record.id
                        ? "bg-primary/20 text-primary"
                        : "text-text-secondary hover:bg-surface-hover hover:text-text"
                    }`}
                  >
                    <span className="text-xs text-text-muted">
                      {RecordTypeLabels[record.type]}
                    </span>
                    <span className="truncate">{record.name}</span>
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col gap-1 py-2">
              {groupConfig.map(({ type, label, icon: Icon }) => {
                const items = groupedRecords?.get(type) ?? [];
                const isExpanded = expandedNodes.has(type);
                const hasItems = items.length > 0;

                if (!hasItems) return null;

                return (
                  <div key={type} className="flex flex-col">
                    <button
                      onClick={() => toggleNode(type)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded text-sm font-medium text-text-secondary hover:bg-surface-hover transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                      )}
                      <Icon className="w-4 h-4 text-text-muted" />
                      <span>{label}</span>
                      <span className="ml-auto text-xs text-text-muted">
                        {items.length}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="flex flex-col gap-0.5 pl-7">
                        {items.map((record) => (
                          <button
                            key={record.id}
                            onClick={() => handleRecordClick(record)}
                            className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                              selectedRecordId === record.id
                                ? "bg-primary/20 text-primary"
                                : "text-text-secondary hover:bg-surface-hover hover:text-text"
                            }`}
                          >
                            <span className="truncate">{record.name}</span>
                            {record.type === "location" && (
                              <ArrowRight className="w-3 h-3 ml-auto text-text-muted" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add button */}
        <div className="p-3 border-t border-border flex-shrink-0">
          <button
            onClick={() => setIsNewRecordOpen(true)}
            className="btn-accent w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Kayıt Ekle
          </button>
        </div>
      </div>

      <NewRecordDialog
        isOpen={isNewRecordOpen}
        onClose={() => setIsNewRecordOpen(false)}
      />
    </>
  );
}
