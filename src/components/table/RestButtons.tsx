import { useState } from "react";
import { useTableStore } from "../../stores/tableStore";
import { Coffee, Moon, AlertTriangle } from "lucide-react";

export function RestButtons() {
  const resetUsages = useTableStore((s) => s.resetUsages);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleShortRest = (): void => {
    resetUsages("short_rest");
    // Demo: console log for visibility
    console.log("[RestButtons] Kısa dinlenme yapıldı — short_rest kullanımları sıfırlandı.");
  };

  const handleLongRest = (): void => {
    if (window.confirm("Uzun dinlenme yapmak istediğinize emin misiniz? Tüm kısa ve uzun resetli kullanımlar sıfırlanacak.")) {
      resetUsages("long_rest");
      resetUsages("short_rest");
      console.log("[RestButtons] Uzun dinlenme yapıldı — long_rest ve short_rest kullanımları sıfırlandı.");
    }
    setShowConfirm(false);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShortRest}
        className="btn btn-accent flex-1 flex items-center justify-center gap-2"
        title="Kısa resetli kullanımları sıfırlar"
      >
        <Coffee className="w-4 h-4" />
        Kısa Dinlenme
      </button>

      <button
        onClick={() => setShowConfirm(true)}
        className="btn btn-primary flex-1 flex items-center justify-center gap-2"
        title="Uzun resetli kullanımları sıfırlar; kısa resetlileri de sıfırlar"
      >
        <Moon className="w-4 h-4" />
        Uzun Dinlenme
      </button>

      {/* Placeholder ConfirmDialog using window.confirm above; this visual state is a backup */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-text">Uzun Dinlenme</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-text-secondary text-sm leading-relaxed">
                Uzun dinlenme yapmak istediğinize emin misiniz? Tüm kısa ve uzun resetli kullanımlar sıfırlanacak.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-background-secondary/50">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn btn-ghost"
              >
                İptal
              </button>
              <button
                onClick={handleLongRest}
                className="btn btn-primary"
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
