import { useArchiveStore } from "../../stores/archiveStore";
import { PinTypeLabels, PinType, RecordType } from "../../types";
import { MapPin } from "lucide-react";

interface PinLayerProps {
  scale?: number;
  translateX?: number;
  translateY?: number;
  mapWidth?: number;
  mapHeight?: number;
  onPinClick?: (pinId: string) => void;
  onPinAdd?: (x: number, y: number) => void;
  isAddingPin?: boolean;
}

const pinColors: Record<PinType, string> = {
  location: "#3b82f6",
  npc: "#22c55e",
  quest: "#d97706",
  poi: "#06b6d4",
  danger: "#ef4444",
  secret: "#a855f7",
};

export function PinLayer({
  mapWidth = 1000,
  mapHeight = 1000,
  onPinClick,
  onPinAdd,
  isAddingPin,
}: PinLayerProps) {
  const pins = useArchiveStore((s) => s.pins);
  const activeRegionId = useArchiveStore((s) => s.activeRegionId);
  const setSelectedRecord = useArchiveStore((s) => s.setSelectedRecord);
  const setActiveRegion = useArchiveStore((s) => s.setActiveRegion);

  // Sadece aktif bölgeye ait pin'leri göster
  const visiblePins = pins.filter((pin) => {
    if (activeRegionId == null) {
      // Ana harita: sadece parentRegionId'si olmayan (kampanya düzeyi) pin'ler
      return pin.parentRegionId == null;
    }
    // Alt harita: sadece bu bölgeye ait pin'ler
    return pin.parentRegionId === activeRegionId;
  });

  return (
    <div
      data-pin-layer
      data-active-region-id={activeRegionId ?? ""}
      className="absolute inset-0"
      style={{ pointerEvents: isAddingPin ? "auto" : "none" }}
      onClick={(e) => {
        if (!isAddingPin || !onPinAdd) return;
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (mapWidth / rect.width);
        const y = (e.clientY - rect.top) * (mapHeight / rect.height);
        onPinAdd(x, y);
      }}
    >
      {visiblePins.map((pin) => (
        <button
          key={pin.id}
          data-map-pin-id={pin.id}
          data-pin-type={pin.pinType}
          data-parent-region-id={pin.parentRegionId ?? ""}
          className="absolute transform -translate-x-1/2 -translate-y-full group pointer-events-auto"
          style={{
            left: pin.x,
            top: pin.y,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (pin.recordType === "location") {
              setActiveRegion(pin.recordId);
            } else {
              setSelectedRecord(pin.recordId, pin.recordType as RecordType);
            }
            onPinClick?.(pin.id);
          }}
          title={PinTypeLabels[pin.pinType]}
        >
          <MapPin
            className="w-6 h-6 drop-shadow-md transition-transform group-hover:scale-110"
            style={{ color: pinColors[pin.pinType] }}
            fill={pinColors[pin.pinType]}
          />
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-text bg-background-secondary px-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {PinTypeLabels[pin.pinType]}
          </span>
        </button>
      ))}

      {isAddingPin && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
          Haritaya tıklayarak pin ekleyin
        </div>
      )}
    </div>
  );
}
