import { useState, useEffect, useCallback } from "react";
import { useCampaignStore } from "../../stores/campaignStore";
import { useArchiveStore } from "../../stores/archiveStore";
import { useTableStore } from "../../stores/tableStore";
import { Campaign } from "../../types";
import * as service from "../../services/campaignService";
import { BookOpen, Plus, Calendar, Gamepad2, FolderOpen, Loader2, X } from "lucide-react";

const gameSystems = ["D&D 5e", "Pathfinder", "Özel"];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface CampaignManagerProps {
  onClose?: () => void;
}

export function CampaignManager({ onClose }: CampaignManagerProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gameSystem, setGameSystem] = useState("D&D 5e");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const setActiveCampaign = useCampaignStore((s) => s.setActiveCampaign);
  const setCampaignsStore = useCampaignStore((s) => s.setCampaigns);
  const setRecords = useArchiveStore((s) => s.setRecords);
  const setPins = useArchiveStore((s) => s.setPins);
  const setParty = useTableStore((s) => s.setParty);
  const setNpcStates = useTableStore((s) => s.setNpcStates);
  const setQuestStates = useTableStore((s) => s.setQuestStates);
  const setUsageTrackers = useTableStore((s) => s.setUsageTrackers);
  const setCurrentSession = useTableStore((s) => s.setCurrentSession);
  const setSessionNotes = useTableStore((s) => s.setSessionNotes);
  const setSessions = useTableStore((s) => s.setSessions);

  // Diskten kampanyaları yükle
  useEffect(() => {
    let mounted = true;
    async function load() {
      const list = await service.listCampaigns();
      if (mounted) {
        setCampaigns(list);
        setCampaignsStore(list);
        setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [setCampaignsStore]);

  const handleSelectCampaign = useCallback(async (campaign: Campaign) => {
    setIsLoading(true);
    const data = await service.loadCampaign(campaign.path);
    if (data) {
      setActiveCampaign(data.campaign);
      setRecords(data.records);
      setPins(data.pins);
      setParty(data.live.party);
      setNpcStates(data.live.npcStates);
      setQuestStates(data.live.questStates);
      setUsageTrackers(data.live.usageTrackers);
      setCurrentSession(data.live.currentSession);
      setSessionNotes(data.live.sessionNotes);
      setSessions(data.live.sessions);
    }
    setIsLoading(false);
    onClose?.();
  }, [setActiveCampaign, setRecords, setPins, setParty, setNpcStates, setQuestStates, setUsageTrackers, setCurrentSession, setSessionNotes, setSessions, onClose]);

  const handleCreateCampaign = async () => {
    if (!name.trim()) {
      setError("Kampanya adı zorunludur.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const campaign = await service.createCampaign(name.trim(), description.trim(), gameSystem);
      const updatedList = await service.listCampaigns();
      setCampaigns(updatedList);
      setCampaignsStore(updatedList);
      await handleSelectCampaign(campaign);
      setName("");
      setDescription("");
      setGameSystem("D&D 5e");
    } catch (err: any) {
      console.error("Kampanya oluşturma hatası:", err);
      setError(err?.message || "Kampanya oluşturulamadı.");
    }

    setCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg shadow-2xl max-w-4xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-text">
              Kampanya Seçin veya Oluşturun
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text transition-colors"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sol taraf - Mevcut kampanyalar */}
          <div className="w-1/2 border-r border-border overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Mevcut Kampanyalar
            </h3>

            {isLoading ? (
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Kampanyalar yükleniyor...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-text-muted text-sm italic">
                Henüz kampanya yok. Sağ taraftan yeni bir kampanya oluşturun.
              </div>
            ) : (
              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => handleSelectCampaign(campaign)}
                    className="w-full text-left p-3 rounded-lg border border-border bg-background-secondary hover:bg-surface-hover transition-colors"
                  >
                    <div className="font-medium text-text text-sm">
                      {campaign.name}
                    </div>
                    <div className="text-xs text-text-muted mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Son güncelleme: {formatDate(campaign.updatedAt)}
                    </div>
                    <div className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                      <Gamepad2 className="w-3 h-3" />
                      {campaign.settings.gameSystem}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sağ taraf - Yeni kampanya formu */}
          <div className="w-1/2 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Yeni Kampanya
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Kampanya Adı <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  className="input w-full"
                  placeholder="Kampanya adını girin..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Açıklama
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea w-full h-20"
                  placeholder="Kampanya açıklaması..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Oyun Sistemi
                </label>
                <select
                  value={gameSystem}
                  onChange={(e) => setGameSystem(e.target.value)}
                  className="input w-full"
                >
                  {gameSystems.map((system) => (
                    <option key={system} value={system}>
                      {system}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="text-danger text-xs bg-danger/10 p-2 rounded">{error}</div>
              )}

              <button
                onClick={handleCreateCampaign}
                disabled={creating}
                className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Oluştur
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
