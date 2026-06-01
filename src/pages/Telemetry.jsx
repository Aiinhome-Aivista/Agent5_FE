import { useEffect, useState } from "react";
import { endpoints } from "../api/client";
import { useAppStore } from "../store/store";
import {
  ProviderBadge,
  SeverityPill,
  Section,
  LoadingBlock,
  EmptyState,
  fmtPct,
} from "../components/UI";
import { Activity, AlertTriangle } from "lucide-react";

export default function Telemetry() {
  const { provider, accountId } = useAppStore();
  const [snapshots, setSnapshots] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("anomalies");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = { limit: 50 };
    if (provider !== "all") params.provider = provider;
    if (accountId) params.account_id = accountId;

    Promise.all([
      endpoints.telemetry(params).catch(() => ({ data: [] })),
      endpoints.anomalies({ ...params, limit: 30 }).catch(() => ({ data: [] })),
    ])
      .then(([s, a]) => {
        if (!mounted) return;
        setSnapshots(s.data || []);
        setAnomalies(a.data || []);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [provider, accountId]);

  if (loading) return <LoadingBlock label="Loading telemetry…" />;

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
            Telemetry
          </h1>
          <p className="text-sm text-ink-400 mt-1">
            Monitor anomalies and resource utilization
          </p>
        </div>

        {/* Toggle Button Group */}
        <div className="flex gap-2 bg-paper-200 p-1 rounded-lg border border-paper-300">
          <button
            onClick={() => setActiveTab("anomalies")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "anomalies"
                ? "bg-accent-100 text-accent-700 border border-accent-300 shadow-sm"
                : "text-ink-600 hover:text-ink-700"
            }`}
          >
            <AlertTriangle size={16} />
            Anomalies
          </button>
          <button
            onClick={() => setActiveTab("utilization")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "utilization"
                ? "bg-accent-100 text-accent-700 border border-accent-300 shadow-sm"
                : "text-ink-600 hover:text-ink-700"
            }`}
          >
            <Activity size={16} />
            Utilization
          </button>
        </div>
      </div>

      {/* Anomalies Tab */}
      {activeTab === "anomalies" && (
        <Section
          title="Anomalies"
          subtitle="Detected idle resources and cost spikes"
        >
          {anomalies.length === 0 ? (
            <div className="card p-6 text-sm text-ink-400 text-center">
              No anomalies detected
            </div>
          ) : (
            <div className="card overflow-hidden">
              {anomalies.map((a) => (
                <div
                  key={a.id}
                  className="px-4 py-3 border-b border-paper-300 last:border-0 hover:bg-paper-100"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <SeverityPill severity={a.severity} />
                      <ProviderBadge provider={a.provider} />
                      <span className="text-xs font-mono text-ink-400">
                        {a.anomaly_type}
                      </span>
                      {a.resolved_at && (
                        <span className="pill bg-accent-50 text-accent-700 border border-accent-500/20">
                          Resolved
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink-400 font-mono whitespace-nowrap">
                      {a.detected_at?.slice(0, 16)}
                    </div>
                  </div>
                  <div className="text-sm text-ink-700 mt-2">
                    {a.description}
                  </div>
                  <div className="text-[11px] text-ink-400 font-mono mt-1">
                    {a.resource_id} · metric={a.metric_value} · baseline=
                    {a.baseline_value} · dev=
                    {fmtPct(a.deviation_pct)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Resource Utilization Tab */}
      {activeTab === "utilization" && (
        <Section
          title="Resource utilization"
          subtitle="Most recent CPU snapshots — bottom utilization shown first"
        >
          {snapshots.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No telemetry yet"
              description="Run a scan to collect CloudWatch / Azure Monitor metrics."
            />
          ) : (
            <div className="card overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-ink-400 border-b border-paper-300">
                <div className="col-span-1">Cloud</div>
                <div className="col-span-2">Account</div>
                <div className="col-span-4">Resource</div>
                <div className="col-span-1 text-right">CPU avg</div>
                <div className="col-span-1 text-right">CPU max</div>
                <div className="col-span-3 text-right">Window</div>
              </div>
              {snapshots
                .slice()
                .sort((a, b) => (a.cpu_avg_pct ?? 999) - (b.cpu_avg_pct ?? 999))
                .map((s) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-12 px-4 py-2.5 text-sm border-b border-paper-300 last:border-0 hover:bg-paper-100 items-center"
                  >
                    <div className="col-span-1">
                      <ProviderBadge provider={s.provider} />
                    </div>
                    <div className="col-span-2 text-xs font-mono text-ink-500 truncate">
                      {s.account_id}
                    </div>
                    <div className="col-span-4 min-w-0">
                      <div className="text-ink-800 truncate">
                        {s.resource_id}
                      </div>
                      <div className="text-[11px] text-ink-400 truncate">
                        {s.service} · {s.region}
                      </div>
                    </div>
                    <div className="col-span-1 text-right font-mono">
                      <span
                        className={
                          s.cpu_avg_pct != null && s.cpu_avg_pct < 10
                            ? "text-crimson-500"
                            : s.cpu_avg_pct != null && s.cpu_avg_pct < 30
                              ? "text-gold-500"
                              : "text-accent-600"
                        }
                      >
                        {fmtPct(s.cpu_avg_pct)}
                      </span>
                    </div>
                    <div className="col-span-1 text-right font-mono text-ink-500">
                      {fmtPct(s.cpu_max_pct)}
                    </div>
                    <div className="col-span-3 text-right text-[11px] font-mono text-ink-400">
                      {s.window_start?.slice(0, 16)} →{" "}
                      {s.window_end?.slice(11, 16)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
