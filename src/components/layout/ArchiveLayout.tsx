import { useState } from "react";
import { useArchiveStore } from "../../stores/archiveStore";
import { WorldTree } from "../archive/WorldTree";
import { MapViewer } from "../archive/MapViewer";
import { PinLayer } from "../archive/PinLayer";
import { RecordDetail } from "../archive/RecordDetail";
import { SearchPalette } from "../archive/SearchPalette";
import { X } from "lucide-react";

export function ArchiveLayout() {
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(360);
  const selectedRecordId = useArchiveStore((s) => s.selectedRecordId);
  const setSelectedRecord = useArchiveStore((s) => s.setSelectedRecord);

  return (
    <div className="flex h-full w-full relative">
      {/* Sol Panel - Dünya Ağacı */}
      <div
        className="flex-shrink h-full border-r border-border overflow-hidden flex flex-col min-w-[200px]"
        style={{ width: `clamp(200px, 22vw, ${leftWidth}px)` }}
      >
        <WorldTree />
      </div>

      {/* Ayraç - Sol */}
      <div
        className="w-1 cursor-col-resize bg-border hover:bg-border-light transition-colors flex-shrink-0"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = leftWidth;
          const onMove = (ev: MouseEvent) => {
            const newWidth = Math.max(200, Math.min(400, startWidth + ev.clientX - startX));
            setLeftWidth(newWidth);
          };
          const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
      />

      {/* Orta Panel - Harita + Pinler */}
      <div className="flex-1 h-full overflow-hidden relative min-w-[200px]">
        <MapViewer>
          <PinLayer />
        </MapViewer>
      </div>

      {/* Ayraç - Sağ */}
      <div
        className="hidden lg:block w-1 cursor-col-resize bg-border hover:bg-border-light transition-colors flex-shrink-0"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = rightWidth;
          const onMove = (ev: MouseEvent) => {
            const newWidth = Math.max(280, Math.min(500, startWidth - (ev.clientX - startX)));
            setRightWidth(newWidth);
          };
          const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
      />

      {/* Sağ Panel - Detaylar */}
      <div
        className={`h-full border-l border-border overflow-hidden min-w-[200px] ${
          selectedRecordId
            ? "absolute inset-y-0 right-0 z-30 flex flex-col shadow-2xl lg:relative lg:inset-auto lg:z-auto lg:flex-shrink lg:shadow-none"
            : "hidden lg:flex lg:flex-shrink lg:flex-col"
        }`}
        style={{ width: `clamp(280px, 28vw, ${rightWidth}px)` }}
      >
        {selectedRecordId ? (
          <>
            <button
              type="button"
              onClick={() => setSelectedRecord(null, null)}
              className="absolute top-2 right-2 z-40 rounded-md bg-background-secondary p-1.5 text-text-muted shadow hover:text-text lg:hidden"
              aria-label="Detay panelini kapat"
            >
              <X className="h-4 w-4" />
            </button>
            <RecordDetail />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            Bir kayıt seçin
          </div>
        )}
      </div>

      <SearchPalette />
    </div>
  );
}
