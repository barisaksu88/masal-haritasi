import { useState } from "react";
import { ContextCollectorOptions, WorldRecord, RecordTypeLabels } from "../../types";
import { ClipboardCopy, Check, Layers, Eye, FileText } from "lucide-react";

const demoRecord: WorldRecord = {
  id: "demo-record-1",
  type: "location",
  name: "Eski Kule",
  description:
    "Yüzyıllardır terk edilmiş olan bu kule, eski bir büyücünün laboratuvarıydı. Duvarlarında hâlâ gizli semboller var.",
  playerText:
    "Önünüzde yüksek, harap olmuş bir kule duruyor. Taş duvarları yosunla kaplı, pencereleri karanlık.",
  tags: ["harabe", "büyü", "gizli"],
  connections: [
    { targetId: "demo-npc-1", targetType: "npc", relation: "Muhafızı" },
    { targetId: "demo-quest-1", targetType: "quest", relation: "İlgili görev" },
    { targetId: "demo-item-1", targetType: "item", relation: "Gizli eşya" },
  ],
  images: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z",
  isFavorite: false,
  parentId: null,
  atmosphere: "Gizemli ve huzursuz",
  secretPassages: "Zemin katında gizli bir bodruma inen merdiven",
  securityLevel: "Düşük (terk edilmiş)",
  mapImage: null,
};

const demoLinkedRecords: Record<string, WorldRecord> = {
  "demo-npc-1": {
    id: "demo-npc-1",
    type: "npc",
    name: "Gözcü Velius",
    description: "Kuleyi koruyan hayalet bir muhafız. Sadece gece görünür.",
    playerText: "Gözlerinizin önünde saydam bir figür beliriyor.",
    tags: ["hayalet", "muhafız"],
    connections: [],
    images: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
    isFavorite: false,
    race: "Hayalet",
    class: "Muhafız",
    level: 5,
    stats: {},
    personality: "Sadık ama melankolik",
    goals: "Kuleyi korumak",
    secretAgenda: "Ölümünün nedeni olan büyücüyü bulmak",
    portrait: null,
    currentLocationId: "demo-record-1",
  },
  "demo-quest-1": {
    id: "demo-quest-1",
    type: "quest",
    name: "Kule'nin Sırrı",
    description: "Eski Kule'deki gizli laboratuvara ulaşın.",
    playerText: "Harap kulede gizli bir laboratuvar olduğu söyleniyor.",
    tags: ["ana-görev"],
    connections: [],
    images: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
    isFavorite: false,
    status: "active",
    objectives: ["Kuleye gir", "Bodrumu bul", "Laboratuvarı keşfet"],
    reward: "500 altın + Gizemli Kristal",
    relatedNpcIds: ["demo-npc-1"],
    relatedLocationIds: ["demo-record-1"],
  },
  "demo-item-1": {
    id: "demo-item-1",
    type: "item",
    name: "Gizemli Kristal",
    description: "Işık yayan, eski bir büyücüye ait kristal.",
    playerText: "Elinizde hafifçe titreşen, mavi bir kristal var.",
    tags: ["büyülü", "nadir"],
    connections: [],
    images: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
    isFavorite: false,
    itemType: "Büyülü Eşya",
    rarity: "Nadir",
    weight: "0.5 kg",
    effect: "Işık yayar, büyüleri güçlendirir",
    usageTemplate: "Günlük 1 kez",
  },
};

function generateContext(
  record: WorldRecord,
  options: ContextCollectorOptions
): string {
  const lines: string[] = [];
  lines.push(`# ${record.name}`);
  lines.push(`**Tür:** ${RecordTypeLabels[record.type]}`);
  lines.push("");

  if (options.playerOnly) {
    lines.push("## Oyunculara Gösterilebilir");
    lines.push(record.playerText || "(Metin yok)");
  } else {
    lines.push("## Açıklama");
    lines.push(record.description);
    if (options.includeDmNotes) {
      lines.push("");
      lines.push("## DM Notları");
      lines.push(record.playerText || "(DM notu yok)");
    }
  }

  if (options.depth > 1 && record.connections.length > 0) {
    lines.push("");
    lines.push("## Bağlantılar");
    for (const conn of record.connections) {
      const linked = demoLinkedRecords[conn.targetId];
      if (linked) {
        lines.push(`- **${conn.relation}:** ${linked.name} (${RecordTypeLabels[linked.type]})`);
        if (options.depth > 2) {
          const text = options.playerOnly ? linked.playerText : linked.description;
          lines.push(`  > ${text.split("\n")[0]}`);
        }
      }
    }
  }

  lines.push("");
  lines.push(`--- Derinlik: ${options.depth} ---`);
  return lines.join("\n");
}

export function ContextCollector() {
  const [includeDmNotes, setIncludeDmNotes] = useState(false);
  const [playerOnly, setPlayerOnly] = useState(false);
  const [depth, setDepth] = useState<1 | 2 | 3>(1);
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = (): void => {
    const options: ContextCollectorOptions = {
      includeDmNotes,
      playerOnly,
      depth,
    };
    const context = generateContext(demoRecord, options);
    setOutput(context);
  };

  const handleCopy = async (): Promise<void> => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-accent" />
        <h3 className="font-semibold text-text">Bağlam Topla</h3>
      </div>

      {/* Seçenekler */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeDmNotes}
            onChange={(e) => setIncludeDmNotes(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-background-secondary text-primary focus:ring-primary"
          />
          <span className="text-sm text-text-secondary flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            DM notlarını dahil et
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={playerOnly}
            onChange={(e) => setPlayerOnly(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-background-secondary text-primary focus:ring-primary"
          />
          <span className="text-sm text-text-secondary flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            Sadece oyuncuya gösterilebilir bilgiler
          </span>
        </label>

        <div className="space-y-1.5">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Derinlik
          </span>
          <div className="flex gap-3">
            {[1, 2, 3].map((d) => (
              <label key={d} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="depth"
                  value={d}
                  checked={depth === d}
                  onChange={() => setDepth(d as 1 | 2 | 3)}
                  className="w-4 h-4 border-border bg-background-secondary text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-secondary">{d}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        className="btn btn-primary w-full flex items-center justify-center gap-2"
      >
        <Layers className="w-4 h-4" />
        Bağlam Oluştur
      </button>

      {/* Çıktı */}
      {output && (
        <div className="space-y-2">
          <textarea
            value={output}
            readOnly
            className="textarea w-full h-48 font-mono text-xs"
          />
          <button
            onClick={handleCopy}
            className="btn btn-ghost w-full flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-success" />
                <span className="text-success">Kopyalandı</span>
              </>
            ) : (
              <>
                <ClipboardCopy className="w-4 h-4" />
                Kopyala
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
