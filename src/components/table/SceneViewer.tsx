import { useState } from "react";
import { useTableStore } from "../../stores/tableStore";
import { MapPin } from "lucide-react";

export function SceneViewer() {
  const sceneLocationId = useTableStore((s) => s.sceneLocationId);
  const [notes, setNotes] = useState("");

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="panel-header">
        <MapPin size={18} className="text-accent" />
        <span className="font-semibold text-text">Sahne</span>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="text-text-secondary text-sm">
          {sceneLocationId ? (
            <p>Mevcut sahne konumu: {sceneLocationId}</p>
          ) : (
            <p>Henüz bir sahne konumu seçilmedi.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Sahne Notları
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="textarea w-full h-32"
            placeholder="Sahne notlarınızı buraya yazın..."
          />
        </div>
      </div>
    </div>
  );
}
