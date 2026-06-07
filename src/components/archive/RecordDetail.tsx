import { useMemo, useCallback } from "react";
import { useArchiveStore } from "../../stores/archiveStore";
import {
  WorldRecord,
  Location,
  NPC,
  RecordType,
  RecordTypeLabels,
} from "../../types";
import { Star, Trash2, Link2, Plus, X } from "lucide-react";
import { useState } from "react";

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
  const [targetId, setTargetId] = useState("");
  const [relation, setRelation] = useState("");

  const availableRecords = records.filter((r) => r.id !== currentRecordId);

  const handleAdd = () => {
    if (!targetId || !relation.trim()) return;
    const target = records.find((r) => r.id === targetId);
    if (!target) return;
    onAdd(targetId, relation.trim(), target.type);
    setTargetId("");
    setRelation("");
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <select
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
        className="input text-xs py-1 px-2 flex-1"
      >
        <option value="">Kayıt seç...</option>
        {availableRecords.map((r) => (
          <option key={r.id} value={r.id}>
            {RecordTypeLabels[r.type]}: {r.name}
          </option>
        ))}
      </select>
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
