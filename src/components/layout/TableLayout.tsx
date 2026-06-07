import { useState } from "react";
import { useTableStore } from "../../stores/tableStore";
import { PartySummary } from "../table/PartySummary";
import { SceneViewer } from "../table/SceneViewer";
import { CharacterCard } from "../table/CharacterCard";

export function TableLayout() {
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(380);
  const selectedCharacterId = useTableStore((s) => s.selectedCharacterId);

  return (
    <div className="flex h-full w-full">
      {/* Sol Panel - Parti Özeti */}
      <div
        className="flex-shrink-0 h-full border-r border-border overflow-hidden flex flex-col"
        style={{ width: leftWidth }}
      >
        <PartySummary />
      </div>

      {/* Ayraç - Sol */}
      <div
        className="w-1 cursor-col-resize bg-border hover:bg-border-light transition-colors flex-shrink-0"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = leftWidth;
          const onMove = (ev: MouseEvent) => {
            const newWidth = Math.max(200, Math.min(350, startWidth + ev.clientX - startX));
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

      {/* Orta Panel - Sahne */}
      <div className="flex-1 h-full overflow-hidden">
        <SceneViewer />
      </div>

      {/* Ayraç - Sağ */}
      <div
        className="w-1 cursor-col-resize bg-border hover:bg-border-light transition-colors flex-shrink-0"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = rightWidth;
          const onMove = (ev: MouseEvent) => {
            const newWidth = Math.max(300, Math.min(500, startWidth - (ev.clientX - startX)));
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

      {/* Sağ Panel - Canlı Durum */}
      <div
        className="flex-shrink-0 h-full border-l border-border overflow-hidden flex flex-col"
        style={{ width: rightWidth }}
      >
        {selectedCharacterId ? (
          <CharacterCard />
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            Bir karakter veya NPC seçin
          </div>
        )}
      </div>
    </div>
  );
}
