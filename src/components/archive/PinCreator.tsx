import { useState, useRef, useEffect } from "react";
import { useArchiveStore } from "../../stores/archiveStore";
import {
  PinType,
  PinTypeLabels,
  RecordTypeLabels,
  Pin,
  WorldRecord,
} from "../../types";
import { X, MapPin, Save, ChevronDown, Search } from "lucide-react";
import { generateId } from "../../utils/fileUtils";

interface PinCreatorProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
}

const pinColors: Record<PinType, string> = {
  location: "#3b82f6",
  npc: "#22c55e",
  quest: "#d97706",
  poi: "#06b6d4",
  danger: "#ef4444",
  secret: "#a855f7",
};

const pinTypes: PinType[] = ["location", "npc", "quest", "poi", "danger", "secret"];

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

  // Dışarı tıklayınca kapat
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
      {/* Trigger */}
      <button
        type="button"
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

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-md shadow-xl max-h-60 flex flex-col">
          {/* Search */}
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

          {/* List */}
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

/* ================================================================
   PIN CREATOR
   ================================================================ */

export function PinCreator({ isOpen, x, y, onClose }: PinCreatorProps) {
  const addPin = useArchiveStore((s) => s.addPin);
  const records = useArchiveStore((s) => s.records);
  const activeRegionId = useArchiveStore((s) => s.activeRegionId);

  const [pinType, setPinType] = useState<PinType>("location");
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPinType("location");
    setSelectedRecordId("");
    setSaving(false);
    setError(null);
  }, [isOpen, x, y]);

  if (!isOpen) return null;

  const filteredRecords = records.filter((r) => {
    if (pinType === "location") return r.type === "location";
    if (pinType === "npc") return r.type === "npc";
    if (pinType === "quest") return r.type === "quest";
    // poi, danger, secret can link to any record type
    return true;
  });

  const handleSave = async () => {
    setError(null);

    if (!selectedRecordId) {
      setError("Lütfen bir kayıt seçin.");
      return;
    }

    const record = records.find((r) => r.id === selectedRecordId);
    if (!record) {
      setError("Seçili kayıt bulunamadı.");
      return;
    }

    try {
      setSaving(true);

      const pin: Pin = {
        id: generateId(),
        recordId: record.id,
        recordType: record.type,
        x,
        y,
        pinType,
        color: pinColors[pinType],
        icon: "map-pin",
        parentRegionId: activeRegionId ?? undefined,
      };

      await addPin(pin);
      onClose();
    } catch {
      setError("Pin kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-creator-title"
    >
      <div className="bg-surface border border-border rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            <h2
              id="pin-creator-title"
              className="text-sm font-semibold text-text"
            >
              Pin Ekle
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
          {/* Coordinates */}
          <div className="text-xs text-text-muted bg-background-secondary p-2 rounded">
            Koordinatlar: X={Math.round(x)}, Y={Math.round(y)}
          </div>

          {/* Pin Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Pin Türü
            </label>
            <div className="grid grid-cols-3 gap-2">
              {pinTypes.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => {
                    setPinType(type);
                    setSelectedRecordId("");
                    setError(null);
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs border transition-colors ${
                    pinType === type
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-background-secondary text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  <MapPin
                    className="w-3 h-3"
                    style={{ color: pinColors[type] }}
                    fill={pinColors[type]}
                  />
                  {PinTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Record Selection — CUSTOM DROPDOWN */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Bağlı Kayıt <span className="text-danger">*</span>
            </label>
            <RecordDropdown
              records={filteredRecords}
              selectedId={selectedRecordId}
              onSelect={(id) => {
                setSelectedRecordId(id);
                setError(null);
              }}
              placeholder="Kayıt seçin..."
            />
            {filteredRecords.length === 0 && (
              <p className="text-xs text-text-muted">
                Bu türde kayıt bulunmuyor. Lütfen önce bir kayıt oluşturun.
              </p>
            )}
            {error && (
              <p className="text-xs text-danger bg-danger/10 p-2 rounded">
                {error}
              </p>
            )}
          </div>
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
                Ekle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
