import { Outlet } from "react-router-dom";
import { useUIStore } from "../../stores/uiStore";
import { Toolbar } from "../common/Toolbar";

export function AppLayout() {
  const mode = useUIStore((s) => s.mode);
  const setMode = useUIStore((s) => s.setMode);

  return (
    <div className="flex flex-col h-full w-full">
      <Toolbar
        mode={mode}
        onModeChange={setMode}
      />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
