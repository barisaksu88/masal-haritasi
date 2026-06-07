import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Onayla",
  cancelText = "İptal",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const variantStyles = {
    danger: "bg-danger hover:bg-red-600",
    warning: "bg-warning hover:bg-amber-600",
    info: "bg-primary hover:bg-primary-hover",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <AlertTriangle
            className={`w-5 h-5 ${
              variant === "danger"
                ? "text-danger"
                : variant === "warning"
                ? "text-warning"
                : "text-primary"
            }`}
          />
          <h3 className="font-semibold text-text">{title}</h3>
          <button
            onClick={onCancel}
            className="ml-auto text-text-muted hover:text-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-text-secondary text-sm leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-background-secondary/50">
          <button
            onClick={onCancel}
            className="btn-ghost"
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            onClick={async () => {
              setIsProcessing(true);
              try {
                onConfirm();
              } finally {
                setIsProcessing(false);
              }
            }}
            className={`btn text-white ${variantStyles[variant]}`}
            disabled={isProcessing}
          >
            {isProcessing ? "İşleniyor..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
