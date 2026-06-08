import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useArchiveStore } from "../../stores/archiveStore";
import {
  WorldRecord,
  Location,
  NPC,
  Faction,
  Religion,
  Culture,
  Item,
  Quest,
  Rumor,
  Event,
  Lore,
  MapRecord,
  Handout,
  RecordType,
  RecordTypeLabels,
} from "../../types";
import { X, Save, Type, ChevronDown, Search } from "lucide-react";
import { generateId } from "../../utils/fileUtils";

interface NewRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const recordTypes: RecordType[] = [
  "location",
  "npc",
  "faction",
  "religion",
  "culture",
  "item",
  "quest",
  "rumor",
  "event",
  "lore",
  "map",
  "handout",
];

function createEmptyRecord(type: RecordType, name: string): WorldRecord {
  const base = {
    id: generateId(),
    type,
    name,
    description: "",
    playerText: "",
    tags: [],
    connections: [],
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
  };

  switch (type) {
    case "location":
      return {
        ...base,
        type: "location",
        atmosphere: "",
        secretPassages: "",
        securityLevel: "",
        mapImage: null,
      } as Location;
    case "npc":
      return {
        ...base,
        type: "npc",
        race: "",
        class: "",
        level: 1,
        stats: {},
        personality: "",
        goals: "",
        secretAgenda: "",
        portrait: null,
        currentLocationId: null,
      } as NPC;
    case "faction":
      return {
        ...base,
        type: "faction",
        hierarchy: "",
        goals: "",
        assets: "",
        enemyFactionIds: [],
        allyFactionIds: [],
      } as Faction;
    case "religion":
      return {
        ...base,
        type: "religion",
        gods: "",
        rituals: "",
        holySites: "",
        holyItems: "",
      } as Religion;
    case "culture":
      return {
        ...base,
        type: "culture",
        traditions: "",
        language: "",
        food: "",
        superstitions: "",
      } as Culture;
    case "item":
      return {
        ...base,
        type: "item",
        itemType: "",
        rarity: "",
        weight: "",
        effect: "",
        usageTemplate: "",
      } as Item;
    case "quest":
      return {
        ...base,
        type: "quest",
        status: "not_started",
        objectives: [],
        reward: "",
        relatedNpcIds: [],
        relatedLocationIds: [],
      } as Quest;
    case "rumor":
      return {
        ...base,
        type: "rumor",
        source: "",
        truthLevel: "",
        relatedEventId: null,
      } as Rumor;
    case "event":
      return {
        ...base,
        type: "event",
        date: "",
        participants: [],
        consequences: "",
      } as Event;
    case "lore":
      return {
        ...base,
        type: "lore",
        period: "",
        sources: "",
        relatedCultureIds: [],
        relatedReligionIds: [],
      } as Lore;
    case "map":
      return {
        ...base,
        type: "map",
        imageFile: "",
        scale: "",
        subMapIds: [],
      } as MapRecord;
    case "handout":
      return {
        ...base,
        type: "handout",
        giveToPlayers: false,
        fontStyle: "",
      } as Handout;
    default:
      return base as unknown as WorldRecord;
  }
}

/* ================================================================
   CUSTOM DROPDOWN (WebView'de native <select> çalışmıyor)
   ================================================================ */

function RecordDropdown({
  records,
  selectedId,
  onSelect,
  placeholder,
}: {
  records: WorldRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedRecord = records.find((r) => r.id === selectedId);

  const filtered = search.trim()
    ? records.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      )
    : records;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        data-selected-record-id={selectedId}
        onClick={() => setIsOpen(!isOpen)}
        className="input w-full flex items-center justify-between text-left"
      >
        <span className={selectedRecord ? "text-text" : "text-text-muted"}>
          {selectedRecord
            ? `${selectedRecord.name} (${RecordTypeLabels[selectedRecord.type]})`
            : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-md shadow-xl max-h-60 flex flex-col">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background-secondary border border-border rounded px-2 py-1.5 pl-7 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary"
                placeholder="Ara..."
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-1">
            {filtered.length === 0 ? (
              <div className="text-text-muted text-xs text-center py-3">
                Kayıt bulunamadı
              </div>
            ) : (
              filtered.map((record) => (
                <button
                  type="button"
                  key={record.id}
                  onClick={() => {
                    onSelect(record.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedId === record.id
                      ? "bg-primary/20 text-primary"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text"
                  }`}
                >
                  <div className="font-medium">{record.name}</div>
                  <div className="text-xs text-text-muted">
                    {RecordTypeLabels[record.type]}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function NewRecordDialog({ isOpen, onClose }: NewRecordDialogProps) {
  const addRecord = useArchiveStore((s) => s.addRecord);
  const setSelectedRecord = useArchiveStore((s) => s.setSelectedRecord);
  const activeRegionId = useArchiveStore((s) => s.activeRegionId);
  const records = useArchiveStore((s) => s.records);

  const [recordType, setRecordType] = useState<RecordType>("location");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [playerText, setPlayerText] = useState("");
  const [tags, setTags] = useState("");
  const [parentRegionId, setParentRegionId] = useState<string>(activeRegionId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wasOpenRef = useRef(isOpen);

  useLayoutEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setParentRegionId(activeRegionId ?? "");
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, activeRegionId]);

  if (!isOpen) return null;

  const locationRecords = records.filter((r) => r.type === "location");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("İsim zorunludur.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const record = createEmptyRecord(recordType, name.trim());
      record.description = description.trim();
      record.playerText = playerText.trim();
      record.tags = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      record.parentId = parentRegionId || null;

      await addRecord(record);
      setSelectedRecord(record.id, recordType);

      setName("");
      setDescription("");
      setPlayerText("");
      setTags("");
      setRecordType("location");
      setParentRegionId("");
      onClose();
    } catch {
      setError("Kayıt kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-record-title"
    >
      <div className="bg-surface border border-border rounded-lg shadow-2xl max-w-lg w-full mx-4 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-accent" />
            <h2 id="new-record-title" className="text-sm font-semibold text-text">
              Yeni Kayıt
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Kayıt Türü
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as RecordType)}
              className="input w-full"
            >
              {recordTypes.map((type) => (
                <option key={type} value={type}>
                  {RecordTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Parent Region */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Üst Bölge
            </label>
            <RecordDropdown
              records={locationRecords}
              selectedId={parentRegionId}
              onSelect={setParentRegionId}
              placeholder="Bölge seçin..."
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              İsim <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="input w-full"
              placeholder="Kayıt ismi..."
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Açıklama (DM Notu)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea w-full h-20"
              placeholder="DM notu..."
            />
          </div>

          {/* Player Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Oyuncuya Okunacak Metin
            </label>
            <textarea
              value={playerText}
              onChange={(e) => setPlayerText(e.target.value)}
              className="textarea w-full h-20"
              placeholder="Oyunculara okunacak metin..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Etiketler
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input w-full"
              placeholder="etiket1, etiket2, etiket3..."
            />
            <p className="text-xs text-text-muted">
              Virgülle ayırarak birden fazla etiket ekleyebilirsiniz.
            </p>
          </div>

          {error && (
            <div className="text-danger text-xs bg-danger/10 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost px-4 py-2 text-sm"
            disabled={saving}
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <span>Kaydediliyor...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
