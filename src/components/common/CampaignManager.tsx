import { useState } from "react";
import { useCampaignStore } from "../../stores/campaignStore";
import { Campaign, CampaignSettings } from "../../types";
import { BookOpen, Plus, Calendar, Gamepad2 } from "lucide-react";

const demoCampaigns: Campaign[] = [
  {
    id: "demo-1",
    name: "Karanlık Diyarlar",
    description: "Gölgelerin hüküm sürdüğü eski bir krallık.",
    path: "/demo/karanlik-diyarlar",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-06-01T14:30:00Z",
    settings: {
      calendar: "Gregoryen",
      currentDate: "2024-06-01",
      gameSystem: "D&D 5e",
    },
  },
  {
    id: "demo-2",
    name: "Zümrüt Şehri",
    description: "Sihir ve ticaretin başkenti.",
    path: "/demo/zumrut-sehri",
    createdAt: "2024-03-20T09:00:00Z",
    updatedAt: "2024-05-28T11:00:00Z",
    settings: {
      calendar: "Gregoryen",
      currentDate: "2024-05-28",
      gameSystem: "Pathfinder",
    },
  },
  {
    id: "demo-3",
    name: "Kuzeyin Öfkesi",
    description: "Buzul çağında hayatta kalma mücadelesi.",
    path: "/demo/kuzeyin-ofkesi",
    createdAt: "2024-02-10T08:00:00Z",
    updatedAt: "2024-04-15T16:45:00Z",
    settings: {
      calendar: "Özel",
      currentDate: "Kışın 45. Günü",
      gameSystem: "Özel",
    },
  },
];

const gameSystems = ["D&D 5e", "Pathfinder", "Özel"];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(demoCampaigns);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gameSystem, setGameSystem] = useState("D&D 5e");
  const [error, setError] = useState<string | null>(null);

  const setActiveCampaign = useCampaignStore((s) => s.setActiveCampaign);
  const addCampaign = useCampaignStore((s) => s.addCampaign);

  const handleSelectCampaign = (campaign: Campaign): void => {
    setActiveCampaign(campaign);
  };

  const handleCreateCampaign = (): void => {
    if (!name.trim()) {
      setError("Kampanya adı zorunludur.");
      return;
    }

    const now = new Date().toISOString();
    const settings: CampaignSettings = {
      calendar: "Gregoryen",
      currentDate: new Date().toISOString().split("T")[0],
      gameSystem,
    };

    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      path: `/campaigns/${name.trim().toLowerCase().replace(/\s+/g, "-")}`,
      createdAt: now,
      updatedAt: now,
      settings,
    };

    setCampaigns((prev) => [...prev, newCampaign]);
    addCampaign(newCampaign);

    // Demo: placeholder callback for future FS integration
    console.log("[CampaignManager] Yeni kampanya oluşturuldu (demo):", newCampaign);

    setName("");
    setDescription("");
    setGameSystem("D&D 5e");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg shadow-2xl max-w-4xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text">
            Kampanya Seçin veya Oluşturun
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sol taraf - Mevcut kampanyalar */}
          <div className="w-1/2 border-r border-border overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">
              Mevcut Kampanyalar
            </h3>
            {campaigns.length === 0 ? (
              <div className="text-text-muted text-sm italic">
                Henüz kampanya yok.
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
                      Son açılma: {formatDate(campaign.updatedAt)}
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
                <div className="text-danger text-xs">{error}</div>
              )}

              <button
                onClick={handleCreateCampaign}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
