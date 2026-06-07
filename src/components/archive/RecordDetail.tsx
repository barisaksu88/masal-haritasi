import { useMemo, useCallback } from "react";
import { useArchiveStore } from "../../stores/archiveStore";
import {
  WorldRecord,
  Location,
  NPC,
  RecordTypeLabels,
} from "../../types";
import { Star, Trash2, Link2 } from "lucide-react";

function isLocation(record: WorldRecord): record is Location {
  return record.type === "location";
}

function isNPC(record: WorldRecord): record is NPC {
  return record.type === "npc";
}

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

  return (
    <div className="text-text-muted text-sm py-2">
      Bu kayıt türü için özel alanlar yakında eklenecek
    </div>
  );
}

export function RecordDetail(): React.ReactElement {
  const selectedRecordId = useArchiveStore((s) => s.selectedRecordId);
  const records = useArchiveStore((s) => s.records);
  const updateRecord = useArchiveStore((s) => s.updateRecord);
  const removeRecord = useArchiveStore((s) => s.removeRecord);
  const setSelectedRecord = useArchiveStore((s) => s.setSelectedRecord);

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
          <div className="flex flex-wrap gap-1.5">
            {record.tags.length > 0 ? (
              record.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-text-muted text-sm">Etiket yok</span>
            )}
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
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-text-muted text-sm">Bağlı kayıt yok</span>
          )}
        </div>
      </div>
    </div>
  );
}
