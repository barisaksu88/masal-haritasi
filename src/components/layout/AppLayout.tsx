import { Outlet } from "react-router-dom";
import { useUIStore } from "../../stores/uiStore";
import { useCampaignStore } from "../../stores/campaignStore";
import { Toolbar } from "../common/Toolbar";
import { CampaignManager } from "../common/CampaignManager";

export function AppLayout() {
  const mode = useUIStore((s) => s.mode);
  const setMode = useUIStore((s) => s.setMode);
  const activeCampaign = useCampaignStore((s) => s.activeCampaign);

  return (
    <div className="flex flex-col h-full w-full">
      <Toolbar
        mode={mode}
        onModeChange={setMode}
      />
      <div className="flex-1 overflow-hidden">
        {activeCampaign ? (
          <Outlet />
        ) : (
          <CampaignManager />
        )}
      </div>
    </div>
  );
}
