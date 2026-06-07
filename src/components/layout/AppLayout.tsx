import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useUIStore } from "../../stores/uiStore";
import { useCampaignStore } from "../../stores/campaignStore";
import { usePersistence } from "../../hooks/usePersistence";
import { Toolbar } from "../common/Toolbar";
import { CampaignManager } from "../common/CampaignManager";
import { NotificationContainer } from "../common/NotificationContainer";

export function AppLayout() {
  const mode = useUIStore((s) => s.mode);
  const setMode = useUIStore((s) => s.setMode);
  const activeCampaign = useCampaignStore((s) => s.activeCampaign);
  const [showCampaignManager, setShowCampaignManager] = useState(false);

  // Otomatik kaydetme (auto-save) hook'u
  usePersistence();

  const handleOpenCampaignManager = () => setShowCampaignManager(true);
  const handleCloseCampaignManager = () => setShowCampaignManager(false);

  // Kampanya manager'ı göster: aktif kampanya yoksa ZORUNLU, varsa isteğe bağlı
  const shouldShowCampaignManager = !activeCampaign || showCampaignManager;

  return (
    <div className="flex flex-col h-full w-full">
      <Toolbar
        mode={mode}
        onModeChange={setMode}
        onOpenCampaignManager={handleOpenCampaignManager}
      />
      <div className="flex-1 overflow-hidden">
        {shouldShowCampaignManager ? (
          <CampaignManager onClose={activeCampaign ? handleCloseCampaignManager : undefined} />
        ) : (
          <Outlet />
        )}
      </div>
      <NotificationContainer />
    </div>
  );
}
