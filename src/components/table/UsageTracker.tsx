import { useState } from "react";
import { useTableStore } from "../../stores/tableStore";
import { Feature, ResetTypeLabels } from "../../types";
import { Minus, RotateCcw } from "lucide-react";

interface UsageTrackerProps {
  characterId: string;
  initialFeatures: Feature[];
}

export function UsageTracker({ characterId, initialFeatures }: UsageTrackerProps) {
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const useFeature = useTableStore((s) => s.useFeature);
  const resetUsages = useTableStore((s) => s.resetUsages);

  const handleUse = (featureId: string): void => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === featureId && f.remainingUses > 0
          ? { ...f, remainingUses: f.remainingUses - 1 }
          : f
      )
    );
    useFeature(featureId, characterId);
  };

  const handleReset = (featureId: string, resetType: Feature["resetType"], maxUses: number): void => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === featureId ? { ...f, remainingUses: maxUses } : f))
    );
    if (resetType === "short_rest" || resetType === "long_rest" || resetType === "daily") {
      resetUsages(resetType);
    }
  };

  if (features.length === 0) {
    return (
      <div className="text-xs text-text-muted italic">Henüz yetenek eklenmemiş.</div>
    );
  }

  return (
    <div className="space-y-2">
      {features.map((feature) => (
        <div
          key={feature.id}
          className="p-3 rounded-lg border border-border bg-background-secondary"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-text truncate">{feature.name}</div>
              <div className="text-xs text-text-secondary truncate">{feature.description}</div>
              <div className="mt-1">
                <span className="tag">{ResetTypeLabels[feature.resetType]}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-text">
                {feature.remainingUses}{" "}
                <span className="text-text-muted text-sm">/ {feature.maxUses}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleUse(feature.id)}
              disabled={feature.remainingUses <= 0}
              className={`btn btn-primary flex-1 flex items-center justify-center gap-1 ${
                feature.remainingUses <= 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Minus size={14} />
              Kullan
            </button>
            {feature.resetType === "manual" && (
              <button
                onClick={() => handleReset(feature.id, feature.resetType, feature.maxUses)}
                className="btn btn-ghost flex items-center justify-center gap-1"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
