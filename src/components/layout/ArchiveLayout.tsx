import { useState } from "react";
import { useArchiveStore } from "../../stores/archiveStore";
import { WorldTree } from "../archive/WorldTree";
import { MapViewer } from "../archive/MapViewer";
import { PinLayer } from "../archive/PinLayer";
import { RecordDetail } from "../archive/RecordDetail";
import { SearchPalette } from "../archive/SearchPalette";

export function ArchiveLayout() {
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(360);
  const selectedRecordId = useArchiveStore((s) => s.selectedRecordId);

  return (
    <div className="flex h-full w-full relative">
      {/* Sol Panel - Dünya Ağacı */}
      <div
        className="flex-shrink-0 h-full border-r border-border overflow-hidden flex flex-col"
        style={{ width: leftWidth }}
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
      <div className="flex-1 h-full overflow-hidden relative">
        <MapViewer />
        <PinLayer mapWidth={1000} mapHeight={1000} />
      </div>

      {/* Ayraç - Sağ */}
      <div
        className="w-1 cursor-col-resize bg-border hover:bg-border-light transition-colors flex-shrink-0"
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
        className="flex-shrink-0 h-full border-l border-border overflow-hidden flex flex-col"
        style={{ width: rightWidth }}
      >
        {selectedRecordId ? (
          <RecordDetail />
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
