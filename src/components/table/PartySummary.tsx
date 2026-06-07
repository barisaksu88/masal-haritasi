import { useState, useEffect } from "react";
import { useTableStore } from "../../stores/tableStore";
import { PartyMember, Condition } from "../../types";
import { User, Plus, Shield, Skull, FlaskConical } from "lucide-react";

const demoParty: PartyMember[] = [
  {
    id: "c1",
    name: "Thorin Demirkanat",
    playerName: "Ahmet",
    class: "Savaşçı",
    race: "İnsan",
    level: 5,
    maxHp: 45,
    currentHp: 32,
    tempHp: 5,
    ac: 16,
    portrait: null,
    conditions: [
      { id: "cond1", name: "Kalkanlı", icon: "shield", color: "#3b82f6", duration: "1 saat" },
    ],
    inventory: [],
    equipped: [],
    features: [],
  },
  {
    id: "c2",
    name: "Lyra Yıldızkızı",
    playerName: "Ayşe",
    class: "Büyücü",
    race: "Yüksek Elf",
    level: 4,
    maxHp: 28,
    currentHp: 12,
    tempHp: 0,
    ac: 13,
    portrait: null,
    conditions: [
      { id: "cond2", name: "Zehirli", icon: "flask", color: "#22c55e", duration: "3 tur" },
    ],
    inventory: [],
    equipped: [],
    features: [],
  },
  {
    id: "c3",
    name: "Brak Taşkıran",
    playerName: "Mehmet",
    class: "Hırsız",
    race: "Dağ Cücesi",
    level: 5,
    maxHp: 38,
    currentHp: 8,
    tempHp: 0,
    ac: 14,
    portrait: null,
    conditions: [
      { id: "cond3", name: "Bilinçsiz", icon: "skull", color: "#ef4444", duration: "1 saat" },
    ],
    inventory: [],
    equipped: [],
    features: [],
  },
];

function getHpColor(current: number, max: number): string {
  const pct = current / max;
  if (pct > 0.5) return "bg-success";
  if (pct >= 0.25) return "bg-warning";
  return "bg-danger";
}

function ConditionBadge({ condition }: { condition: Condition }) {
  if (condition.icon === "shield" || condition.name.toLowerCase().includes("kalkan")) {
    return <Shield size={14} className="text-primary" />;
  }
  if (condition.icon === "skull" || condition.name.toLowerCase().includes("bilinçsiz")) {
    return <Skull size={14} className="text-danger" />;
  }
  if (condition.icon === "flask" || condition.name.toLowerCase().includes("zehir")) {
    return <FlaskConical size={14} className="text-success" />;
  }
  return <span className="text-xs" style={{ color: condition.color }}>●</span>;
}

export function PartySummary() {
  const [party] = useState<PartyMember[]>(demoParty);
  const selectedCharacterId = useTableStore((s) => s.selectedCharacterId);
  const setSelectedCharacter = useTableStore((s) => s.setSelectedCharacter);
  const setParty = useTableStore((s) => s.setParty);

  useEffect(() => {
    setParty(party);
  }, [party, setParty]);

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="panel-header">
        <span className="font-semibold text-text">PARTİ</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {party.map((member) => {
          const hpPct = Math.max(0, Math.min(100, (member.currentHp / member.maxHp) * 100));
          const isSelected = selectedCharacterId === member.id;
          return (
            <div
              key={member.id}
              onClick={() => setSelectedCharacter(member.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                isSelected
                  ? "border-accent bg-surface-active"
                  : "border-border bg-background-secondary hover:bg-surface-hover"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background-tertiary flex items-center justify-center flex-shrink-0">
                  {member.portrait ? (
                    <img src={member.portrait} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User size={20} className="text-text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-text truncate">{member.name}</div>
                  <div className="text-xs text-text-secondary truncate">
                    {member.class} / {member.race}
                  </div>
                </div>
                <div className="flex gap-1">
                  {member.conditions.map((c) => (
                    <div key={c.id} className="w-5 h-5 rounded-full bg-background-tertiary flex items-center justify-center">
                      <ConditionBadge condition={c} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>Can</span>
                  <span>
                    {member.currentHp}/{member.maxHp}
                    {member.tempHp > 0 && <span className="text-info ml-1">+{member.tempHp}</span>}
                  </span>
                </div>
                <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getHpColor(member.currentHp, member.maxHp)}`}
                    style={{ width: `${hpPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-border">
        <button
          onClick={() => {}}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Yeni Karakter
        </button>
      </div>
    </div>
  );
}
