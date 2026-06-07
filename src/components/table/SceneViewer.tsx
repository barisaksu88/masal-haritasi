import { useState } from "react";
import { useTableStore } from "../../stores/tableStore";
import { useArchiveStore } from "../../stores/archiveStore";
import { MapPin, ScrollText, Clock, BookOpen } from "lucide-react";

export function SceneViewer() {
  const sceneLocationId = useTableStore((s) => s.sceneLocationId);
  const setSceneLocation = useTableStore((s) => s.setSceneLocation);
  const records = useArchiveStore((s) => s.records);

  const location = sceneLocationId
    ? records.find((r) => r.id === sceneLocationId && r.type === "location")
    : null;

  const [quickNote, setQuickNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);

  const addNote = () => {
    if (!quickNote.trim()) return;
    const time = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    setNotes([`${time} — ${quickNote}`, ...notes]);
    setQuickNote("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sahne Başlığı */}
      <div className="px-4 py-3 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold text-text">
            {location ? location.name : "Sahne Seçilmedi"}
          </h2>
        </div>
        {location && (
          <p className="text-sm text-text-secondary mt-1">
            {(location as any).atmosphere || "Bir konum seçin veya sahne ayarlayın."}
          </p>
        )}
      </div>

      {/* Konum Seçimi */}
      <div className="px-4 py-2 border-b border-border">
        <label className="text-xs text-text-muted block mb-1">Aktif Konum</label>
        <select
          className="input w-full"
          value={sceneLocationId ?? ""}
          onChange={(e) => setSceneLocation(e.target.value || null)}
        >
          <option value="">Konum seçin...</option>
          {records
            .filter((r) => r.type === "location")
            .map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
        </select>
      </div>

      {/* Oyuncuya Okunacak Metin */}
      {location && (location as any).playerText && (
        <div className="px-4 py-3 border-b border-border bg-background-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Oyuncuya Okunacak</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {(location as any).playerText}
          </p>
        </div>
      )}

      {/* Hızlı Notlar */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-medium text-text">Oturum Notları</span>
          <Clock className="w-3 h-3 text-text-muted ml-auto" />
        </div>

        <div className="px-4 py-2">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Hızlı not ekle..."
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
            <button onClick={addNote} className="btn-primary">
              Ekle
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {notes.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">
              Henüz not yok. Hızlı not ekleyin.
            </p>
          ) : (
            notes.map((note, i) => (
              <div key={i} className="text-sm text-text-secondary py-1 border-b border-border/50">
                {note}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
