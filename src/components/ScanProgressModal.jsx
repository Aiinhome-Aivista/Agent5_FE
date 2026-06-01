import { useEffect, useState } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Activity,
  Lightbulb,
  PlayCircle,
} from "lucide-react";
import clsx from "clsx";
import { endpoints } from "../api/client";

const STEPS = [
  {
    key: "collecting_telemetry",
    label: "Collecting telemetry",
    icon: Activity,
    detail:
      "Pulling CPU/memory and 30-day cost data from each registered cloud account.",
  },
  {
    key: "detecting_anomalies",
    label: "Detecting anomalies",
    icon: AlertTriangle,
    detail: "Statistical scan for idle resources and cost spikes.",
  },
  {
    key: "analyzing",
    label: "Generating recommendations",
    icon: Lightbulb,
    detail: "Playbooks reasoning over each anomaly.",
  },
  {
    key: "auto_executing",
    label: "Auto-executing low-risk actions",
    icon: PlayCircle,
    detail: "Only runs if AUTO_EXECUTE_LOW_RISK=true. Otherwise skipped.",
  },
  { key: "done", label: "Done", icon: CheckCircle2, detail: "" },
];

export default function ScanProgressModal({ runId, open, onClose }) {
  const [run, setRun] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !runId) return;
    let active = true;
    let timeout;
    const tick = async () => {
      try {
        const { data } = (await endpoints.scanStatus)
          ? await endpoints.scanStatus()
          : await fetch(`/api/scan/status/${runId}`).then((r) => r.json());
        // We use the dedicated endpoint:
        const res = await fetch(`/api/scan/status/${runId}`);
        const d = await res.json();
        if (!active) return;
        setRun(d);
        if (d.status === "running") {
          timeout = setTimeout(tick, 1500);
        }
      } catch (e) {
        if (!active) return;
        setError(e.message);
      }
    };
    tick();
    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [runId, open]);

  if (!open) return null;

  const currentIdx = run
    ? STEPS.findIndex((s) => s.key === run.current_step)
    : 0;
  const isDone = run?.status && run.status !== "running";
  const isFailed = run?.status === "failed";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm animate-fade-up"
      onClick={isDone ? onClose : undefined}
    >
      <div
        className="bg-white border border-paper-300 rounded-xl2 shadow-pop w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-paper-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isFailed
                  ? "bg-crimson-50"
                  : isDone
                    ? "bg-emerald-50"
                    : "bg-accent-50",
              )}
            >
              {isFailed ? (
                <AlertTriangle className="w-4 h-4 text-crimson-600" />
              ) : isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Sparkles className="w-4 h-4 text-accent-600 animate-pulse-soft" />
              )}
            </div>
            <div>
              <h3 className="font-display font-semibold text-ink-900 text-base">
                {isFailed
                  ? "Scan failed"
                  : isDone
                    ? "Scan complete"
                    : "Running scan…"}
              </h3>
              <p className="text-xs text-ink-500">
                {run?.trigger === "scheduled" ? "Scheduled" : "Manual"} ·{" "}
                {run?.provider || "…"}
              </p>
            </div>
          </div>
          {isDone && (
            <button
              onClick={onClose}
              className="text-ink-400 hover:text-ink-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {!run && !error && (
            <div className="flex items-center gap-2.5 text-ink-500 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Starting scan…</span>
            </div>
          )}

          {error && (
            <div className="text-sm text-crimson-700 bg-crimson-50 border border-crimson-100 rounded-lg p-3">
              {error}
            </div>
          )}

          {run && (
            <>
              {/* Step list */}
              <div className="space-y-2.5">
                {STEPS.slice(0, -1).map((step, i) => {
                  const isCurrent = run.current_step === step.key;
                  const isPast = currentIdx > i || isDone;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div
                        className={clsx(
                          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                          isCurrent &&
                            !isFailed &&
                            "bg-accent-50 ring-2 ring-accent-300",
                          isPast && !isCurrent && "bg-emerald-50",
                          !isCurrent && !isPast && "bg-paper-100",
                        )}
                      >
                        {isCurrent && !isFailed ? (
                          <Loader2 className="w-3.5 h-3.5 text-accent-600 animate-spin" />
                        ) : isPast ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Icon className="w-3.5 h-3.5 text-ink-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div
                          className={clsx(
                            "text-sm font-medium transition-colors",
                            isCurrent && "text-ink-900",
                            isPast && !isCurrent && "text-ink-700",
                            !isCurrent && !isPast && "text-ink-500",
                          )}
                        >
                          {step.label}
                        </div>
                        <div className="text-xs text-ink-500 mt-0.5">
                          {step.detail}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live counts */}
              {(run.scanned_resources > 0 ||
                run.anomalies_found > 0 ||
                run.recommendations_created > 0) && (
                <div className="mt-5 pt-5 border-t border-paper-300 grid grid-cols-3 gap-3">
                  <Counter label="Resources" value={run.scanned_resources} />
                  <Counter
                    label="Anomalies"
                    value={run.anomalies_found}
                    accent="gold"
                  />
                  <Counter
                    label="Recs"
                    value={run.recommendations_created}
                    accent="accent"
                  />
                </div>
              )}

              {/* Error message */}
              {run.error_message && (
                <div className="mt-4 text-xs text-crimson-700 bg-crimson-50 border border-crimson-100 rounded-lg p-3 font-mono break-all">
                  {run.error_message}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {isDone && (
          <div className="px-6 py-3 bg-paper-100 border-t border-paper-300 flex items-center justify-between">
            <div className="text-xs text-ink-500 font-mono">
              {run?.duration_ms
                ? `${(run.duration_ms / 1000).toFixed(1)}s`
                : ""}
            </div>
            <button
              onClick={onClose}
              className="btn-primary py-1.5 px-4 text-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Counter({ label, value, accent = "ink" }) {
  const colorMap = {
    accent: "text-accent-700",
    gold: "text-gold-700",
    ink: "text-ink-900",
  };
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">
        {label}
      </div>
      <div className={clsx("stat-num text-xl mt-0.5", colorMap[accent])}>
        {value || 0}
      </div>
    </div>
  );
}
