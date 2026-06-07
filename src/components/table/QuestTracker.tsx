import { useState } from "react";
import { QuestLiveState, QuestStatus, QuestStatusLabels } from "../../types";
import { ScrollText, ChevronDown } from "lucide-react";

const demoQuests: QuestLiveState[] = [
  {
    questId: "quest-1",
    status: "active",
    knownObjectives: ["Kasabaya ulaş", "Burgomeister ile konuş"],
    knownStatus: "active",
  },
  {
    questId: "quest-2",
    status: "completed",
    knownObjectives: ["Mağarayı temizle"],
    knownStatus: "completed",
  },
  {
    questId: "quest-3",
    status: "secret",
    knownObjectives: ["Gizli hedef"],
    knownStatus: "not_started",
  },
  {
    questId: "quest-4",
    status: "failed",
    knownObjectives: ["Prensi kurtar"],
    knownStatus: "failed",
  },
];

const statusOrder: QuestStatus[] = [
  "not_started",
  "active",
  "completed",
  "failed",
  "secret",
];

const statusStyles: Record<QuestStatus, string> = {
  not_started: "bg-text-muted/20 text-text-muted",
  active: "bg-primary/20 text-primary",
  completed: "bg-success/20 text-success",
  failed: "bg-danger/20 text-danger",
  secret: "bg-accent/20 text-accent",
};

export function QuestTracker() {
  const [quests, setQuests] = useState<QuestLiveState[]>(demoQuests);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const handleUpdateStatus = (questId: string, newStatus: QuestStatus): void => {
    setQuests((prev) =>
      prev.map((q) =>
        q.questId === questId ? { ...q, status: newStatus, knownStatus: newStatus } : q
      )
    );
    setOpenDropdownId(null);
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ScrollText className="w-4 h-4 text-accent" />
        <h3 className="font-semibold text-text">Görev Takibi</h3>
      </div>

      <div className="space-y-2">
        {quests.map((quest) => (
          <div
            key={quest.questId}
            className="p-3 rounded-lg border border-border bg-background-secondary"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-text truncate">
                  {quest.knownObjectives[0] || "Görev"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Bilinen durum */}
                <span className={`tag ${statusStyles[quest.knownStatus]}`}>
                  {QuestStatusLabels[quest.knownStatus]}
                </span>

                {/* Gerçek durum (farklıysa) */}
                {quest.status !== quest.knownStatus && (
                  <span className={`tag ${statusStyles[quest.status]}`}>
                    Gerçek: {QuestStatusLabels[quest.status]}
                  </span>
                )}
              </div>
            </div>

            {/* Durum güncelle dropdown */}
            <div className="mt-2 relative">
              <button
                onClick={() =>
                  setOpenDropdownId(openDropdownId === quest.questId ? null : quest.questId)
                }
                className="btn btn-ghost text-xs flex items-center gap-1 w-full justify-between"
              >
                <span>Durum Güncelle</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    openDropdownId === quest.questId ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdownId === quest.questId && (
                <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-md shadow-lg overflow-hidden">
                  {statusOrder.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleUpdateStatus(quest.questId, s)}
                      className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text transition-colors"
                    >
                      {QuestStatusLabels[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
