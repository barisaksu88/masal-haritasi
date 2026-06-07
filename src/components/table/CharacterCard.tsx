import { useState, useEffect } from "react";
import { useTableStore } from "../../stores/tableStore";
import { Condition, InventoryItem } from "../../types";
import { UsageTracker } from "./UsageTracker";
import { User, Plus, Shield, Skull, FlaskConical, Heart, Sword } from "lucide-react";

const demoInventory: InventoryItem[] = [
  { itemId: "item1", quantity: 1, equipped: true },
  { itemId: "item2", quantity: 3, equipped: false },
  { itemId: "item3", quantity: 1, equipped: false },
];

const demoConditions: Condition[] = [
  { id: "cond1", name: "Kalkanlı", icon: "shield", color: "#3b82f6", duration: "1 saat" },
  { id: "cond2", name: "Zehirli", icon: "flask", color: "#22c55e", duration: "3 tur" },
];

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

export function CharacterCard() {
  const selectedCharacterId = useTableStore((s) => s.selectedCharacterId);
  const party = useTableStore((s) => s.party);
  const updatePartyMember = useTableStore((s) => s.updatePartyMember);

  const character = party.find((m) => m.id === selectedCharacterId);

  const [currentHpInput, setCurrentHpInput] = useState<string>("0");
  const [tempHpInput, setTempHpInput] = useState<string>("0");
  const [acInput, setAcInput] = useState<string>("0");

  useEffect(() => {
    if (character) {
      setCurrentHpInput(String(character.currentHp));
      setTempHpInput(String(character.tempHp));
      setAcInput(String(character.ac));
    }
  }, [character]);

  if (!character) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Karakter bulunamadı
      </div>
    );
  }

  const handleHpBlur = (): void => {
    const val = parseInt(currentHpInput, 10);
    if (!isNaN(val)) {
      updatePartyMember(character.id, { currentHp: Math.max(0, Math.min(val, character.maxHp)) });
    }
    setCurrentHpInput(String(character.currentHp));
  };

  const handleTempHpBlur = (): void => {
    const val = parseInt(tempHpInput, 10);
    if (!isNaN(val)) {
      updatePartyMember(character.id, { tempHp: Math.max(0, val) });
    }
    setTempHpInput(String(character.tempHp));
  };

  const handleAcBlur = (): void => {
    const val = parseInt(acInput, 10);
    if (!isNaN(val)) {
      updatePartyMember(character.id, { ac: Math.max(0, val) });
    }
    setAcInput(String(character.ac));
  };

  const hpPct = Math.max(0, Math.min(100, (character.currentHp / character.maxHp) * 100));
  let hpBarColor = "bg-success";
  if (hpPct <= 25) hpBarColor = "bg-danger";
  else if (hpPct <= 50) hpBarColor = "bg-warning";

  return (
    <div className="flex flex-col h-full bg-surface overflow-y-auto">
      <div className="panel-header">
        <Sword size={18} className="text-accent" />
        <span className="font-semibold text-text">Karakter Detayı</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center flex-shrink-0">
            {character.portrait ? (
              <img src={character.portrait} alt={character.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <User size={32} className="text-text-muted" />
            )}
          </div>
          <div>
            <div className="text-lg font-bold text-text">{character.name}</div>
            <div className="text-sm text-text-secondary">
              {character.class} / {character.race} — Seviye {character.level}
            </div>
            <div className="text-xs text-text-muted">Oyuncu: {character.playerName}</div>
          </div>
        </div>

        {/* HP */}
        <div className="p-3 rounded-lg border border-border bg-background-secondary">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={16} className="text-danger" />
            <span className="font-semibold text-sm text-text">Can Puanı</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-3 bg-background-tertiary rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${hpBarColor}`} style={{ width: `${hpPct}%` }} />
            </div>
            <span className="text-sm text-text-secondary whitespace-nowrap">
              {character.currentHp} / {character.maxHp}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-text-muted block mb-1">Mevcut Can</label>
              <input
                type="number"
                value={currentHpInput}
                onChange={(e) => setCurrentHpInput(e.target.value)}
                onBlur={handleHpBlur}
                className="input w-full"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Geçici Can</label>
              <input
                type="number"
                value={tempHpInput}
                onChange={(e) => setTempHpInput(e.target.value)}
                onBlur={handleTempHpBlur}
                className="input w-full"
              />
            </div>
          </div>
        </div>

        {/* AC */}
        <div className="p-3 rounded-lg border border-border bg-background-secondary">
          <label className="text-xs text-text-muted block mb-1">Zırh Sınıfı (AC)</label>
          <input
            type="number"
            value={acInput}
            onChange={(e) => setAcInput(e.target.value)}
            onBlur={handleAcBlur}
            className="input w-24"
          />
        </div>

        {/* Conditions */}
        <div className="p-3 rounded-lg border border-border bg-background-secondary">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm text-text">Durumlar</span>
            <button onClick={() => {}} className="btn btn-ghost text-xs flex items-center gap-1">
              <Plus size={14} />
              Durum Ekle
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {demoConditions.map((c) => (
              <div key={c.id} className="tag flex items-center gap-1">
                <ConditionBadge condition={c} />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory */}
        <div className="p-3 rounded-lg border border-border bg-background-secondary">
          <span className="font-semibold text-sm text-text block mb-2">Envanter</span>
          <div className="space-y-1">
            {demoInventory.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm text-text-secondary">
                <span>
                  {item.itemId === "item1" ? "Uzun Kılıç" : item.itemId === "item2" ? "İyileştirme İksiri" : "Kalkan"}
                  {item.equipped && <span className="text-accent ml-1">(E)</span>}
                </span>
                <span className="text-xs bg-background-tertiary px-2 py-0.5 rounded-full">{item.quantity}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features / Usage Tracker */}
        <div className="p-3 rounded-lg border border-border bg-background-secondary">
          <span className="font-semibold text-sm text-text block mb-2">Yetenekler & Kullanım Hakları</span>
          <UsageTracker
            characterId={character.id}
            initialFeatures={
              character.features.length > 0
                ? character.features
                : [
                    { id: "f1", name: "İkinci Rüzgar", description: "Ekstra saldırı hakkı.", resetType: "short_rest", maxUses: 1, remainingUses: 1 },
                    { id: "f2", name: "Ateş Topu", description: "3. seviye büyü.", resetType: "long_rest", maxUses: 2, remainingUses: 2 },
                    { id: "f3", name: "Şanslı Atış", description: "Bir zar tekrar atılır.", resetType: "manual", maxUses: 3, remainingUses: 3 },
                  ]
            }
          />
        </div>
      </div>
    </div>
  );
}
