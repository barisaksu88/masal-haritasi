import { useState } from "react";
import { useTableStore } from "../../stores/tableStore";
import { DiceRoll } from "../../types";
import { Dices, Trash2 } from "lucide-react";

type DiceType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";

interface DiceConfig {
  type: DiceType;
  sides: number;
  label: string;
}

const diceConfigs: DiceConfig[] = [
  { type: "d4", sides: 4, label: "d4" },
  { type: "d6", sides: 6, label: "d6" },
  { type: "d8", sides: 8, label: "d8" },
  { type: "d10", sides: 10, label: "d10" },
  { type: "d12", sides: 12, label: "d12" },
  { type: "d20", sides: 20, label: "d20" },
  { type: "d100", sides: 100, label: "d100" },
];

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function DiceRoller() {
  const [modifier, setModifier] = useState<number>(0);
  const [label, setLabel] = useState<string>("");
  const [lastResults, setLastResults] = useState<Record<DiceType, number | null>>({
    d4: null,
    d6: null,
    d8: null,
    d10: null,
    d12: null,
    d20: null,
    d100: null,
  });
  const [pulsing, setPulsing] = useState<Record<DiceType, boolean>>({
    d4: false,
    d6: false,
    d8: false,
    d10: false,
    d12: false,
    d20: false,
    d100: false,
  });
  const [rollLog, setRollLog] = useState<DiceRoll[]>([]);

  const addDiceRoll = useTableStore((s) => s.addDiceRoll);

  const handleRoll = (config: DiceConfig): void => {
    const result = rollDie(config.sides);
    const total = result + modifier;

    const roll: DiceRoll = {
      id: Math.random().toString(36).slice(2),
      dice: config.label,
      result,
      modifier,
      total,
      timestamp: Date.now(),
      label: label || "Zar Atışı",
    };

    addDiceRoll(roll);

    setLastResults((prev) => ({ ...prev, [config.type]: result }));
    setRollLog((prev) => [roll, ...prev].slice(0, 10));

    setPulsing((prev) => ({ ...prev, [config.type]: true }));
    setTimeout(() => {
      setPulsing((prev) => ({ ...prev, [config.type]: false }));
    }, 300);
  };

  return (
    <div className="p-3 bg-surface border-t border-border">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Dices size={18} className="text-accent" />
          <span className="font-semibold text-sm text-text">Zar Atıcı</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-text-muted">Etiket:</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Saldırı, Kurtulma..."
            className="input w-32 text-xs"
          />
          <label className="text-xs text-text-muted">Mod:</label>
          <input
            type="number"
            value={modifier}
            onChange={(e) => {
              const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
              setModifier(isNaN(val) ? 0 : val);
            }}
            className="input w-16 text-xs text-center"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        {diceConfigs.map((config) => (
          <button
            key={config.type}
            onClick={() => handleRoll(config)}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-background-secondary hover:bg-surface-hover transition-colors ${
              pulsing[config.type] ? "animate-pulse" : ""
            }`}
          >
            <Dices size={16} className="text-text-muted mb-1" />
            <span className="text-xs text-text-secondary font-medium">{config.label}</span>
            <span className="text-xl font-bold text-text mt-1">
              {lastResults[config.type] ?? "-"}
            </span>
          </button>
        ))}
      </div>

      {rollLog.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">Son Atışlar</span>
            <button
              onClick={() => setRollLog([])}
              className="btn btn-ghost text-xs flex items-center gap-1"
            >
              <Trash2 size={12} />
              Temizle
            </button>
          </div>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {rollLog.map((roll) => (
              <div
                key={roll.id}
                className="flex items-center justify-between text-xs px-2 py-1 rounded bg-background-secondary"
              >
                <span className="text-text-secondary">
                  [{roll.dice}] {roll.label}
                </span>
                <span className="font-semibold text-text">
                  {roll.result}
                  {roll.modifier !== 0 && (
                    <span className="text-text-secondary"> {roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier}</span>
                  )}
                  <span className="text-text-secondary"> = </span>
                  {roll.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
