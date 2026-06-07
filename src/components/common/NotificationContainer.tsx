import { useUIStore } from "../../stores/uiStore";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: "text-success border-success/30 bg-success/10",
  error: "text-danger border-danger/30 bg-danger/10",
  warning: "text-warning border-warning/30 bg-warning/10",
  info: "text-accent border-accent/30 bg-accent/10",
};

export function NotificationContainer() {
  const notifications = useUIStore((s) => s.notifications);
  const removeNotification = useUIStore((s) => s.removeNotification);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onDismiss={() => removeNotification(n.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: { id: string; type: "success" | "error" | "warning" | "info"; message: string; timestamp: number };
  onDismiss: () => void;
}) {
  const Icon = iconMap[notification.type];
  const colors = colorMap[notification.type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-lg border shadow-lg backdrop-blur-sm ${colors}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <span className="text-sm flex-1">{notification.message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
