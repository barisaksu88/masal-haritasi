import { useState } from "react";
import { X, Save, Type, Calendar, Gamepad2 } from "lucide-react";
import { useCampaignStore } from "../../stores/campaignStore";
import { updateCampaignMetadata } from "../../services/campaignService";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const activeCampaign = useCampaignStore((s) => s.activeCampaign);
  const setActiveCampaign = useCampaignStore((s) => s.setActiveCampaign);

  const [calendar, setCalendar] = useState(activeCampaign?.settings.calendar ?? "Gregoryen");
  const [currentDate, setCurrentDate] = useState(activeCampaign?.settings.currentDate ?? "");
  const [gameSystem, setGameSystem] = useState(activeCampaign?.settings.gameSystem ?? "D&D 5e");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!activeCampaign) return;
    setSaving(true);

    const updated = {
      ...activeCampaign,
      settings: {
        ...activeCampaign.settings,
        calendar,
        currentDate,
        gameSystem,
      },
      updatedAt: new Date().toISOString(),
    };

    // Disk'e yaz
    const ok = await updateCampaignMetadata(updated);
    if (ok) {
      setActiveCampaign(updated);
    }

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-text">Ayarlar</h2>
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
          {!activeCampaign ? (
            <div className="text-text-muted text-sm text-center py-4">
              Ayarları görmek için bir kampanya açmalısınız.
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  Oyun Sistemi
                </label>
                <select
                  value={gameSystem}
                  onChange={(e) => setGameSystem(e.target.value)}
                  className="input w-full"
                >
                  <option value="D&D 5e">D&D 5e</option>
                  <option value="Pathfinder">Pathfinder</option>
                  <option value="Özel">Özel</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Takvim
                </label>
                <input
                  type="text"
                  value={calendar}
                  onChange={(e) => setCalendar(e.target.value)}
                  className="input w-full"
                  placeholder="Gregoryen, Özel..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Güncel Tarih
                </label>
                <input
                  type="text"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="input w-full"
                  placeholder="2024-06-07 veya Kışın 45. Günü..."
                />
              </div>

              <div className="divider" />

              <div className="text-xs text-text-muted">
                <p>Kampanya: <span className="text-text-secondary">{activeCampaign.name}</span></p>
                <p className="mt-1">
                  Oluşturulma: {new Date(activeCampaign.createdAt).toLocaleDateString("tr-TR")}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {activeCampaign && (
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
              <Save className="w-4 h-4" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
