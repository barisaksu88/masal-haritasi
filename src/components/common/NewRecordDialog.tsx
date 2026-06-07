import { useState } from "react";
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
import { X, Save, Type } from "lucide-react";
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
        parentId: null,
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

export function NewRecordDialog({ isOpen, onClose }: NewRecordDialogProps) {
  const addRecord = useArchiveStore((s) => s.addRecord);
  const setSelectedRecord = useArchiveStore((s) => s.setSelectedRecord);

  const [recordType, setRecordType] = useState<RecordType>("location");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [playerText, setPlayerText] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError("İsim zorunludur.");
      return;
    }

    setSaving(true);
    setError(null);

    const record = createEmptyRecord(recordType, name.trim());
    record.description = description.trim();
    record.playerText = playerText.trim();
    record.tags = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await addRecord(record);
    setSelectedRecord(record.id, recordType);

    // Reset form
    setName("");
    setDescription("");
    setPlayerText("");
    setTags("");
    setRecordType("location");
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg shadow-2xl max-w-lg w-full mx-4 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-text">Yeni Kayıt</h2>
          </div>
          <button
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
            onClick={onClose}
            className="btn-ghost px-4 py-2 text-sm"
            disabled={saving}
          >
            İptal
          </button>
          <button
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
