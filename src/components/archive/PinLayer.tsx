import { useArchiveStore } from "../../stores/archiveStore";
import { PinTypeLabels, PinType, RecordType } from "../../types";
import { MapPin } from "lucide-react";

interface PinLayerProps {
  mapWidth: number;
  mapHeight: number;
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
  mapWidth,
  mapHeight,
  onPinClick,
  onPinAdd,
  isAddingPin,
}: PinLayerProps) {
  const pins = useArchiveStore((s) => s.pins);
  const setSelectedRecord = useArchiveStore((s) => s.setSelectedRecord);

  return (
    <div
      className="absolute inset-0 pointer-events-auto"
      onClick={(e) => {
        if (!isAddingPin || !onPinAdd) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * mapWidth;
        const y = ((e.clientY - rect.top) / rect.height) * mapHeight;
        onPinAdd(x, y);
      }}
    >
      {pins.map((pin) => (
        <button
          key={pin.id}
          className="absolute transform -translate-x-1/2 -translate-y-full group"
          style={{
            left: `${(pin.x / mapWidth) * 100}%`,
            top: `${(pin.y / mapHeight) * 100}%`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRecord(pin.recordId, pin.recordType as RecordType);
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
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
          Haritaya tıklayarak pin ekleyin
        </div>
      )}
    </div>
  );
}
