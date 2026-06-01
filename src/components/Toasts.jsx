import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import clsx from "clsx";
import { useAppStore } from "../store/store";

export default function Toasts() {
  const { toasts, dismissToast } = useAppStore();

  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => dismissToast(t.id), t.duration || 5000),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((t) => {
        const Icon =
          t.type === "success"
            ? CheckCircle2
            : t.type === "error"
              ? XCircle
              : t.type === "warning"
                ? AlertTriangle
                : Info;
        const cls =
          t.type === "success"
            ? "border-accent-300 bg-accent-50 text-accent-200"
            : t.type === "error"
              ? "border-crimson-500/30 bg-crimson-500/10 text-crimson-300"
              : t.type === "warning"
                ? "border-gold-500/30 bg-gold-500/10 text-gold-300"
                : "border-paper-300 bg-paper-200 text-ink-700";
        return (
          <div
            key={t.id}
            className={clsx(
              "card border backdrop-blur-md p-3 pr-2 flex items-start gap-3 animate-fade-up",
              cls,
            )}
          >
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm flex-1 text-ink-700">{t.message}</div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-ink-500 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
