import { useMemo, useCallback, useState, useRef, useEffect } from "react";
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
  QuestStatus,
  QuestStatusLabels,
} from "../../types";
import {
  Star,
  Trash2,
  Link2,
  Plus,
  X,
  MapPin,
  ChevronDown,
  Search,
  ImagePlus,
} from "lucide-react";

/* ================================================================
   TYPE GUARDS
   ================================================================ */

function isLocation(record: WorldRecord): record is Location {
  return record.type === "location";
}

function isNPC(record: WorldRecord): record is NPC {
  return record.type === "npc";
}

function isFaction(record: WorldRecord): record is Faction {
  return record.type === "faction";
}

function isReligion(record: WorldRecord): record is Religion {
  return record.type === "religion";
}

function isCulture(record: WorldRecord): record is Culture {
  return record.type === "culture";
}

function isItem(record: WorldRecord): record is Item {
  return record.type === "item";
}

function isQuest(record: WorldRecord): record is Quest {
  return record.type === "quest";
}

function isRumor(record: WorldRecord): record is Rumor {
  return record.type === "rumor";
}

function isEvent(record: WorldRecord): record is Event {
  return record.type === "event";
}

function isLore(record: WorldRecord): record is Lore {
  return record.type === "lore";
}

function isMapRecord(record: WorldRecord): record is MapRecord {
  return record.type === "map";
}

function isHandout(record: WorldRecord): record is Handout {
  return record.type === "handout";
}

/* ================================================================
   REUSABLE HELPERS
   ================================================================ */

function StringArrayEditor({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const trimmed = value.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setValue("");
    }
  };

  const handleRemove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="tag flex items-center gap-1 bg-primary/10 text-primary"
          >
            {item}
            <button
              onClick={() => handleRemove(idx)}
              className="hover:text-danger"
              title="Kaldır"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          className="input text-xs py-1 px-2 flex-1"
          placeholder={placeholder}
        />
        <button
          onClick={handleAdd}
          className="p-1 rounded text-text-muted hover:text-accent transition-colors"
          title={addLabel}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function RecordDropdown({
  records,
  selectedId,
  onSelect,
  placeholder,
  nullable = false,
}: {
  records: WorldRecord[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  placeholder: string;
  nullable?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedRecord = selectedId
    ? records.find((r) => r.id === selectedId)
    : undefined;

  const filtered = search.trim()
    ? records.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      )
    : records;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="input w-full flex items-center justify-between text-left text-xs py-1 px-2"
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
            {nullable && (
              <button
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedId === null
                    ? "bg-primary/20 text-primary"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text"
                }`}
              >
                <div className="font-medium">{placeholder}</div>
              </button>
            )}
            {filtered.length === 0 ? (
              <div className="text-text-muted text-xs text-center py-3">
                Kayıt bulunamadı
              </div>
            ) : (
              filtered.map((record) => (
                <button
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

function MultiRecordSelect({
  records,
  selectedIds,
  onChange,
  placeholder,
}: {
  records: WorldRecord[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedRecords = selectedIds
    .map((id) => records.find((r) => r.id === id))
    .filter(Boolean) as WorldRecord[];

  const filtered = search.trim()
    ? records.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      )
    : records;

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {selectedRecords.map((r) => (
          <span
            key={r.id}
            className="tag flex items-center gap-1 bg-primary/10 text-primary"
          >
            {r.name}
            <button
              onClick={() => toggle(r.id)}
              className="hover:text-danger"
              title="Kaldır"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="input w-full flex items-center justify-between text-left text-xs py-1 px-2"
        >
          <span className="text-text-muted">{placeholder}</span>
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
                    key={record.id}
                    onClick={() => toggle(record.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedIds.includes(record.id)
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
    </div>
  );
}

function QuestStatusDropdown({
  value,
  onChange,
}: {
  value: QuestStatus;
  onChange: (status: QuestStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statuses: QuestStatus[] = [
    "not_started",
    "active",
    "completed",
    "failed",
    "secret",
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="input w-full flex items-center justify-between text-left text-xs py-1 px-2"
      >
        <span className="text-text">{QuestStatusLabels[value]}</span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-md shadow-xl max-h-60 flex flex-col p-1">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => {
                onChange(status);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                value === status
                  ? "bg-primary/20 text-primary"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text"
              }`}
            >
              {QuestStatusLabels[status]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TYPE SPECIFIC FIELDS
   ================================================================ */

interface TypeSpecificFieldsProps {
  record: WorldRecord;
  onUpdate: (updates: Partial<WorldRecord>) => void;
  records: WorldRecord[];
}

function TypeSpecificFields({
  record,
  onUpdate,
  records,
}: TypeSpecificFieldsProps): React.ReactElement {
  if (isLocation(record)) {
    const parentRecord = records.find((r) => r.id === record.parentId);

    const handleMapImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        onUpdate({ mapImage: dataUrl } as Partial<WorldRecord>);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    };

    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Üst Konum
          </label>
          <div className="text-sm text-text-secondary">
            {parentRecord ? parentRecord.name : "Yok (Kök dünya)"}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Atmosfer
          </label>
          <textarea
            value={record.atmosphere}
            onChange={(e) =>
              onUpdate({ atmosphere: e.target.value } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Atmosfer tanımı..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Gizli Geçitler
          </label>
          <textarea
            value={record.secretPassages}
            onChange={(e) =>
              onUpdate({
                secretPassages: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Gizli geçitler..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Güvenlik Seviyesi
          </label>
          <input
            type="text"
            value={record.securityLevel}
            onChange={(e) =>
              onUpdate({
                securityLevel: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Güvenlik seviyesi..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Bölge Haritası
          </label>
          {record.mapImage ? (
            <div className="space-y-2">
              <img
                src={record.mapImage}
                alt="Bölge Haritası"
                className="max-h-32 rounded border border-border object-contain"
              />
              <button
                onClick={() =>
                  onUpdate({ mapImage: null } as Partial<WorldRecord>)
                }
                className="btn-secondary text-xs"
              >
                Kaldır
              </button>
            </div>
          ) : (
            <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-xs">
              <ImagePlus className="w-4 h-4" />
              Harita Yükle
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMapImageChange}
              />
            </label>
          )}
        </div>
      </div>
    );
  }

  if (isNPC(record)) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Irk
          </label>
          <input
            type="text"
            value={record.race}
            onChange={(e) =>
              onUpdate({ race: e.target.value } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Irk..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Sınıf
          </label>
          <input
            type="text"
            value={record.class}
            onChange={(e) =>
              onUpdate({ class: e.target.value } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Sınıf..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Seviye
          </label>
          <input
            type="number"
            value={record.level}
            onChange={(e) =>
              onUpdate({
                level: parseInt(e.target.value, 10) || 0,
              } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Seviye..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Kişilik
          </label>
          <textarea
            value={record.personality}
            onChange={(e) =>
              onUpdate({
                personality: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Kişilik tanımı..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Hedef
          </label>
          <textarea
            value={record.goals}
            onChange={(e) =>
              onUpdate({ goals: e.target.value } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Hedefler..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Gizli Ajanda
          </label>
          <textarea
            value={record.secretAgenda}
            onChange={(e) =>
              onUpdate({
                secretAgenda: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Gizli ajanda..."
          />
        </div>
      </div>
    );
  }

  if (isFaction(record)) {
    const otherFactions = records.filter(
      (r) => r.id !== record.id && r.type === "faction"
    );
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Hiyerarşi
          </label>
          <textarea
            value={record.hierarchy}
            onChange={(e) =>
              onUpdate({
                hierarchy: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Hiyerarşi yapısı..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Hedefler
          </label>
          <textarea
            value={record.goals}
            onChange={(e) =>
              onUpdate({ goals: e.target.value } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Fraksiyon hedefleri..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Varlıklar
          </label>
          <textarea
            value={record.assets}
            onChange={(e) =>
              onUpdate({ assets: e.target.value } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Varlıklar..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Düşman Fraksiyonlar
          </label>
          <MultiRecordSelect
            records={otherFactions}
            selectedIds={record.enemyFactionIds}
            onChange={(ids) =>
              onUpdate({
                enemyFactionIds: ids,
              } as Partial<WorldRecord>)
            }
            placeholder="Düşman fraksiyon seç..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Müttefik Fraksiyonlar
          </label>
          <MultiRecordSelect
            records={otherFactions}
            selectedIds={record.allyFactionIds}
            onChange={(ids) =>
              onUpdate({
                allyFactionIds: ids,
              } as Partial<WorldRecord>)
            }
            placeholder="Müttefik fraksiyon seç..."
          />
        </div>
      </div>
    );
  }

  if (isReligion(record)) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Tanrılar
          </label>
          <textarea
            value={record.gods}
            onChange={(e) =>
              onUpdate({ gods: e.target.value } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Tanrılar..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Ritüeller
          </label>
          <textarea
            value={record.rituals}
            onChange={(e) =>
              onUpdate({ rituals: e.target.value } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Ritüeller..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Kutsal Mekânlar
          </label>
          <textarea
            value={record.holySites}
            onChange={(e) =>
              onUpdate({
                holySites: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Kutsal mekânlar..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Kutsal Eşyalar
          </label>
          <textarea
            value={record.holyItems}
            onChange={(e) =>
              onUpdate({
                holyItems: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Kutsal eşyalar..."
          />
        </div>
      </div>
    );
  }

  if (isCulture(record)) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Gelenekler
          </label>
          <textarea
            value={record.traditions}
            onChange={(e) =>
              onUpdate({
                traditions: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Gelenekler..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Dil
          </label>
          <input
            type="text"
            value={record.language}
            onChange={(e) =>
              onUpdate({
                language: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Dil..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Yemek Kültürü
          </label>
          <textarea
            value={record.food}
            onChange={(e) =>
              onUpdate({ food: e.target.value } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Yemek kültürü..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Batıl İnançlar
          </label>
          <textarea
            value={record.superstitions}
            onChange={(e) =>
              onUpdate({
                superstitions: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Batıl inançlar..."
          />
        </div>
      </div>
    );
  }

  if (isItem(record)) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Eşya Türü
          </label>
          <input
            type="text"
            value={record.itemType}
            onChange={(e) =>
              onUpdate({
                itemType: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Eşya türü..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Nadirlik
          </label>
          <input
            type="text"
            value={record.rarity}
            onChange={(e) =>
              onUpdate({ rarity: e.target.value } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Nadirlik..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Ağırlık
          </label>
          <input
            type="text"
            value={record.weight}
            onChange={(e) =>
              onUpdate({ weight: e.target.value } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Ağırlık..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Etki
          </label>
          <textarea
            value={record.effect}
            onChange={(e) =>
              onUpdate({ effect: e.target.value } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Eşya etkisi..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Kullanım Şablonu
          </label>
          <textarea
            value={record.usageTemplate}
            onChange={(e) =>
              onUpdate({
                usageTemplate: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Kullanım şablonu..."
          />
        </div>
      </div>
    );
  }

  if (isQuest(record)) {
    const npcs = records.filter((r) => r.type === "npc");
    const locations = records.filter((r) => r.type === "location");
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Durum
          </label>
          <QuestStatusDropdown
            value={record.status}
            onChange={(status) =>
              onUpdate({ status } as Partial<WorldRecord>)
            }
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Hedefler
          </label>
          <StringArrayEditor
            items={record.objectives}
            onChange={(objectives) =>
              onUpdate({ objectives } as Partial<WorldRecord>)
            }
            placeholder="Yeni hedef..."
            addLabel="Hedef ekle"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Ödül
          </label>
          <textarea
            value={record.reward}
            onChange={(e) =>
              onUpdate({ reward: e.target.value } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Ödül..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            İlgili NPC'ler
          </label>
          <MultiRecordSelect
            records={npcs}
            selectedIds={record.relatedNpcIds}
            onChange={(ids) =>
              onUpdate({
                relatedNpcIds: ids,
              } as Partial<WorldRecord>)
            }
            placeholder="NPC seç..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            İlgili Mekânlar
          </label>
          <MultiRecordSelect
            records={locations}
            selectedIds={record.relatedLocationIds}
            onChange={(ids) =>
              onUpdate({
                relatedLocationIds: ids,
              } as Partial<WorldRecord>)
            }
            placeholder="Mekân seç..."
          />
        </div>
      </div>
    );
  }

  if (isRumor(record)) {
    const events = records.filter((r) => r.type === "event");
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Kaynak
          </label>
          <input
            type="text"
            value={record.source}
            onChange={(e) =>
              onUpdate({ source: e.target.value } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Kaynak..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Doğruluk Seviyesi
          </label>
          <input
            type="text"
            value={record.truthLevel}
            onChange={(e) =>
              onUpdate({
                truthLevel: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Doğruluk seviyesi..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            İlgili Olay
          </label>
          <RecordDropdown
            records={events}
            selectedId={record.relatedEventId}
            onSelect={(id) =>
              onUpdate({
                relatedEventId: id,
              } as Partial<WorldRecord>)
            }
            placeholder="Olay seç..."
            nullable
          />
        </div>
      </div>
    );
  }

  if (isEvent(record)) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Tarih
          </label>
          <input
            type="text"
            value={record.date}
            onChange={(e) =>
              onUpdate({ date: e.target.value } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Tarih..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Katılımcılar
          </label>
          <StringArrayEditor
            items={record.participants}
            onChange={(participants) =>
              onUpdate({ participants } as Partial<WorldRecord>)
            }
            placeholder="Yeni katılımcı..."
            addLabel="Katılımcı ekle"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Sonuçlar
          </label>
          <textarea
            value={record.consequences}
            onChange={(e) =>
              onUpdate({
                consequences: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Sonuçlar..."
          />
        </div>
      </div>
    );
  }

  if (isLore(record)) {
    const cultures = records.filter((r) => r.type === "culture");
    const religions = records.filter((r) => r.type === "religion");
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Dönem
          </label>
          <input
            type="text"
            value={record.period}
            onChange={(e) =>
              onUpdate({ period: e.target.value } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Dönem..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Kaynaklar
          </label>
          <textarea
            value={record.sources}
            onChange={(e) =>
              onUpdate({ sources: e.target.value } as Partial<WorldRecord>)
            }
            className="textarea w-full h-16"
            placeholder="Kaynaklar..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            İlgili Kültürler
          </label>
          <MultiRecordSelect
            records={cultures}
            selectedIds={record.relatedCultureIds}
            onChange={(ids) =>
              onUpdate({
                relatedCultureIds: ids,
              } as Partial<WorldRecord>)
            }
            placeholder="Kültür seç..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            İlgili Dinler
          </label>
          <MultiRecordSelect
            records={religions}
            selectedIds={record.relatedReligionIds}
            onChange={(ids) =>
              onUpdate({
                relatedReligionIds: ids,
              } as Partial<WorldRecord>)
            }
            placeholder="Din seç..."
          />
        </div>
      </div>
    );
  }

  if (isMapRecord(record)) {
    const otherMaps = records.filter(
      (r) => r.id !== record.id && r.type === "map"
    );
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Görsel Dosyası
          </label>
          <input
            type="text"
            value={record.imageFile}
            onChange={(e) =>
              onUpdate({
                imageFile: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Görsel dosyası yolu..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Ölçek
          </label>
          <input
            type="text"
            value={record.scale}
            onChange={(e) =>
              onUpdate({ scale: e.target.value } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Ölçek..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Alt Haritalar
          </label>
          <MultiRecordSelect
            records={otherMaps}
            selectedIds={record.subMapIds}
            onChange={(ids) =>
              onUpdate({
                subMapIds: ids,
              } as Partial<WorldRecord>)
            }
            placeholder="Alt harita seç..."
          />
        </div>
      </div>
    );
  }

  if (isHandout(record)) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="giveToPlayers"
            checked={record.giveToPlayers}
            onChange={(e) =>
              onUpdate({
                giveToPlayers: e.target.checked,
              } as Partial<WorldRecord>)
            }
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <label
            htmlFor="giveToPlayers"
            className="text-sm text-text-secondary cursor-pointer"
          >
            Oyunculara Ver
          </label>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Yazı Tipi
          </label>
          <input
            type="text"
            value={record.fontStyle}
            onChange={(e) =>
              onUpdate({
                fontStyle: e.target.value,
              } as Partial<WorldRecord>)
            }
            className="input w-full"
            placeholder="Yazı tipi..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-text-muted text-sm py-2">
      Bu kayıt türü için özel alanlar yakında eklenecek
    </div>
  );
}

/* ================================================================
   RECORD DETAIL
   ================================================================ */

export function RecordDetail(): React.ReactElement {
  const selectedRecordId = useArchiveStore((s) => s.selectedRecordId);
  const records = useArchiveStore((s) => s.records);
  const updateRecord = useArchiveStore((s) => s.updateRecord);
  const removeRecord = useArchiveStore((s) => s.removeRecord);
  const setSelectedRecord = useArchiveStore((s) => s.setSelectedRecord);
  const setActiveRegion = useArchiveStore((s) => s.setActiveRegion);

  const record = useMemo(() => {
    return records.find((r) => r.id === selectedRecordId);
  }, [records, selectedRecordId]);

  const handleUpdate = useCallback(
    (updates: Partial<WorldRecord>) => {
      if (!selectedRecordId) return;
      updateRecord(selectedRecordId, updates);
    },
    [selectedRecordId, updateRecord]
  );

  const handleToggleFavorite = useCallback(() => {
    if (!record) return;
    handleUpdate({ isFavorite: !record.isFavorite });
  }, [record, handleUpdate]);

  const handleDelete = useCallback(() => {
    if (!selectedRecordId) return;
    if (window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
      removeRecord(selectedRecordId);
      setSelectedRecord(null, null);
    }
  }, [selectedRecordId, removeRecord, setSelectedRecord]);

  if (!record) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Kayıt bulunamadı
      </div>
    );
  }

  const typeLabel = RecordTypeLabels[record.type];

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="panel-header border-b border-border flex-shrink-0 justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="text"
            value={record.name}
            onChange={(e) => handleUpdate({ name: e.target.value })}
            className="bg-transparent border-none text-text font-semibold text-sm focus:outline-none focus:ring-0 p-0 w-full"
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isLocation(record) && (
            <button
              onClick={() => setActiveRegion(record.id)}
              className="p-1.5 rounded-md text-text-muted hover:text-accent transition-colors"
              title="Bölgeye gir"
            >
              <MapPin className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-md transition-colors ${
              record.isFavorite
                ? "text-accent"
                : "text-text-muted hover:text-text"
            }`}
            title={record.isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Star
              className={`w-4 h-4 ${record.isFavorite ? "fill-current" : ""}`}
            />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-md text-text-muted hover:text-danger transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Type badge */}
        <div className="flex items-center gap-2">
          <span className="tag bg-primary/20 text-primary">{typeLabel}</span>
          {record.isFavorite && (
            <span className="tag text-accent">Favori</span>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Açıklama
          </label>
          <textarea
            value={record.description}
            onChange={(e) => handleUpdate({ description: e.target.value })}
            className="textarea w-full h-24"
            placeholder="Açıklama yazın..."
          />
        </div>

        {/* Player Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Oyuncuya Okunacak Metin
          </label>
          <textarea
            value={record.playerText}
            onChange={(e) => handleUpdate({ playerText: e.target.value })}
            className="textarea w-full h-24"
            placeholder="Oyunculara okunacak metni yazın..."
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Etiketler
          </label>
          <div className="flex flex-wrap gap-1.5 items-center">
            {record.tags.map((tag) => (
              <span key={tag} className="tag flex items-center gap-1">
                {tag}
                <button
                  onClick={() =>
                    handleUpdate({
                      tags: record.tags.filter((t) => t !== tag),
                    })
                  }
                  className="hover:text-danger"
                  title="Etiketi kaldır"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <TagAdder
              onAdd={(tag) =>
                handleUpdate({
                  tags: [...record.tags, tag],
                })
              }
            />
          </div>
        </div>

        {/* Type-specific fields */}
        <div className="divider" />
        <TypeSpecificFields
          record={record}
          onUpdate={handleUpdate}
          records={records}
        />

        {/* Connections */}
        <div className="divider" />
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            Bağlı Kayıtlar
          </label>
          {record.connections.length > 0 ? (
            <ul className="space-y-1">
              {record.connections.map((conn, idx) => (
                <li
                  key={idx}
                  className="text-sm text-text-secondary flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {conn.relation}: {conn.targetId}
                  <button
                    onClick={() =>
                      handleUpdate({
                        connections: record.connections.filter((_, i) => i !== idx),
                      })
                    }
                    className="ml-auto text-text-muted hover:text-danger"
                    title="Bağlantıyı kaldır"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-text-muted text-sm">Bağlı kayıt yok</span>
          )}
          <ConnectionAdder
            records={records}
            currentRecordId={record.id}
            onAdd={(targetId, relation, targetType) =>
              handleUpdate({
                connections: [
                  ...record.connections,
                  { targetId, relation, targetType },
                ],
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TAG ADDER
   ================================================================ */

function TagAdder({ onAdd }: { onAdd: (tag: string) => void }) {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
        }}
        className="input text-xs py-1 px-2 w-32"
        placeholder="Yeni etiket..."
      />
      <button
        onClick={handleAdd}
        className="p-1 rounded text-text-muted hover:text-accent transition-colors"
        title="Etiket ekle"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ================================================================
   CONNECTION ADDER
   ================================================================ */

function ConnectionAdder({
  records,
  currentRecordId,
  onAdd,
}: {
  records: WorldRecord[];
  currentRecordId: string;
  onAdd: (targetId: string, relation: string, targetType: RecordType) => void;
}) {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [relation, setRelation] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const availableRecords = records.filter((r) => r.id !== currentRecordId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = () => {
    if (!targetId || !relation.trim()) return;
    const target = records.find((r) => r.id === targetId);
    if (!target) return;
    onAdd(targetId, relation.trim(), target.type);
    setTargetId(null);
    setRelation("");
  };

  const selectedRecord = targetId
    ? availableRecords.find((r) => r.id === targetId)
    : undefined;

  const filtered = search.trim()
    ? availableRecords.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      )
    : availableRecords;

  return (
    <div className="flex items-center gap-2 mt-2">
      <div ref={containerRef} className="relative flex-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="input w-full flex items-center justify-between text-left text-xs py-1 px-2"
        >
          <span className={selectedRecord ? "text-text" : "text-text-muted"}>
            {selectedRecord
              ? `${selectedRecord.name} (${RecordTypeLabels[selectedRecord.type]})`
              : "Kayıt seç..."}
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
                    key={record.id}
                    onClick={() => {
                      setTargetId(record.id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      targetId === record.id
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
      <input
        type="text"
        value={relation}
        onChange={(e) => setRelation(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
        }}
        className="input text-xs py-1 px-2 w-28"
        placeholder="İlişki..."
      />
      <button
        onClick={handleAdd}
        className="p-1 rounded text-text-muted hover:text-accent transition-colors"
        title="Bağlantı ekle"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
