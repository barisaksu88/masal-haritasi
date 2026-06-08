import { useState } from "react";
import { useArchiveStore } from "../../stores/archiveStore";
import { RecordTypeLabels } from "../../types";
import { ClipboardCopy, Check, Layers, Eye, FileText } from "lucide-react";

export function ContextCollector() {
  const selectedRecordId = useArchiveStore((s) => s.selectedRecordId);
  const records = useArchiveStore((s) => s.records);

  const [includeDmNotes, setIncludeDmNotes] = useState(false);
  const [playerOnly, setPlayerOnly] = useState(false);
  const [depth, setDepth] = useState<1 | 2 | 3>(1);
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = (): void => {
    if (!selectedRecordId) {
      setOutput("Lütfen önce bir kayıt seçin.");
      return;
    }

    const record = records.find((r) => r.id === selectedRecordId);
    if (!record) {
      setOutput("Seçili kayıt bulunamadı.");
      return;
    }

    // Basit bağlam oluşturma
    const lines: string[] = [];
    lines.push(`# ${record.name}`);
    lines.push(`**Tür:** ${RecordTypeLabels[record.type]}`);
    lines.push("");

    if (playerOnly) {
      lines.push("## Oyunculara Gösterilebilir");
      lines.push(record.playerText || "(Metin yok)");
    } else {
      lines.push("## Açıklama");
      lines.push(record.description || "(Açıklama yok)");
      if (includeDmNotes) {
        lines.push("");
        lines.push("## DM Notları");
        lines.push(record.playerText || "(DM notu yok)");
      }
    }

    // Etiketler
    if (record.tags.length > 0) {
      lines.push("");
      lines.push(`**Etiketler:** ${record.tags.join(", ")}`);
    }

    // Bağlantılar
    if (record.connections.length > 0) {
      lines.push("");
      lines.push("## Bağlantılar");
      for (const conn of record.connections) {
        const linked = records.find((r) => r.id === conn.targetId);
        if (linked) {
          lines.push(`- **${conn.relation}:** ${linked.name} (${RecordTypeLabels[linked.type]})`);
          if (depth > 1) {
            const text = playerOnly ? linked.playerText : linked.description;
            if (text) {
              lines.push(`  > ${text.split("\n")[0]}`);
            }
          }
        }
      }
    }

    lines.push("");
    lines.push(`---`);
    setOutput(lines.join("\n"));
  };

  const handleCopy = async (): Promise<void> => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

      {!selectedRecordId && (
        <div className="text-text-muted text-sm">
          Bağlam toplamak için önce bir kayıt seçin.
        </div>
      )}

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
        disabled={!selectedRecordId}
        className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
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
