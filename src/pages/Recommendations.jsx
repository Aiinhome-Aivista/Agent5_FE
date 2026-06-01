import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Zap,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  ShieldAlert,
  ArrowUpDown,
  PlayCircle,
} from "lucide-react";
import { endpoints } from "../api/client";
import { useAppStore } from "../store/store";
import {
  RiskPill,
  StatusPill,
  ProviderBadge,
  Section,
  LoadingBlock,
  EmptyState,
  Spinner,
  SavingsSummary,
  fmtMoney,
  fmtUSD,
  fmtPct,
} from "../components/UI";
import clsx from "clsx";

export default function Recommendations() {
  const { provider, accountId, pushToast, currency } = useAppStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [expanded, setExpanded] = useState({});
  const [busy, setBusy] = useState({});
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const loadSummary = async () => {
    setSummaryLoading(true);
    const params = {};
    if (provider !== "all") params.provider = provider;
    if (accountId) params.account_id = accountId;
    try {
      const { data } = await endpoints.savingsSummary(params);
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    const params = { limit: 100 };
    if (provider !== "all") params.provider = provider;
    if (accountId) params.account_id = accountId;
    if (statusFilter !== "all") params.status = statusFilter;
    try {
      const { data } = await endpoints.recommendations(params);
      setItems(data);
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage || "Failed to load" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, accountId, statusFilter]);

  const handleDecision = async (id, decision) => {
    setBusy({ ...busy, [id]: decision });
    try {
      await endpoints.decideRecommendation(id, decision, "ui-user");
      pushToast({
        type: "success",
        message: `Recommendation ${decision === "approve" ? "approved" : "rejected"}`,
      });
      load();
      loadSummary();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage || "Action failed" });
    } finally {
      setBusy({ ...busy, [id]: null });
    }
  };

  const handleExecute = async (id, dry_run = false) => {
    setBusy({ ...busy, [id]: "execute" });
    try {
      const { data } = await endpoints.executeRecommendation(
        id,
        "ui-user",
        dry_run,
      );
      pushToast({
        type: data.status === "failed" ? "error" : "success",
        message: `Execution ${data.status}${dry_run ? " (try run)" : ""}`,
      });
      load();
      loadSummary();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage || "Execute failed" });
    } finally {
      setBusy({ ...busy, [id]: null });
    }
  };

  const totalSavings = items
    .filter((i) => i.status === "pending" || i.status === "approved")
    .reduce((s, i) => s + Number(i.estimated_monthly_savings_usd || 0), 0);

  return (
    <div className="space-y-5">
      {/* Aggregated savings + current vs projected spend */}
      <SavingsSummary data={summary} loading={summaryLoading} />

      {/* Header / filters */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Recommendation Inbox
          </h2>
          <p className="text-xs text-ink-400 mt-0.5">
            Pending:{" "}
            <span className="text-accent-600">
              {fmtMoney(totalSavings, currency)}/mo potential
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          {["pending", "approved", "executed", "rejected", "all"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                "px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider border transition-colors",
                statusFilter === s
                  ? "bg-accent-50 text-accent-700 border-accent-300"
                  : "border-paper-300 text-ink-500 hover:text-ink-800 hover:border-paper-400",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No recommendations"
          description="Run a scan to generate optimization recommendations."
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((r) => {
            const isOpen = expanded[r.id];
            return (
              <div key={r.id} className="card card-hover">
                <div
                  className="px-4 py-3.5 cursor-pointer"
                  onClick={() => setExpanded({ ...expanded, [r.id]: !isOpen })}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button className="text-ink-400 hover:text-ink-700 mt-0.5">
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ProviderBadge provider={r.provider} />
                          <RiskPill risk={r.risk_class} />
                          <StatusPill status={r.status} />
                          <span className="text-[10px] font-mono text-ink-400 uppercase tracking-wider">
                            {r.action_type}
                          </span>
                        </div>
                        <div className="text-sm text-ink-800 font-medium mt-1.5">
                          {r.title}
                        </div>
                        <div className="text-[12px] text-ink-500 mt-0.5 line-clamp-1">
                          {r.description}
                        </div>
                        <div className="text-[11px] font-mono text-ink-400 mt-1 truncate">
                          {r.target_resource_id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className="text-accent-600 font-display text-lg font-semibold tabular-nums">
                        {fmtMoney(r.estimated_monthly_savings_usd, currency)}
                      </div>
                      <div className="text-[10px] text-ink-400 uppercase tracking-wider">
                        per month
                      </div>
                      <div className="text-[14px] font-mono text-ink-400 mt-1">
                        conf:{" "}
                        <span className="font-bold">
                          {fmtPct(r.confidence_score * 100, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-paper-300 px-4 py-4 space-y-3 animate-fade-up">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="stat-label text-ink-400">Rationale</div>
                        <p className="text-ink-700 mt-1 leading-relaxed">
                          {r.rationale}
                        </p>
                      </div>
                      <div>
                        <div className="stat-label text-ink-400">
                          Rollback plan
                        </div>
                        <p className="text-ink-700 mt-1 leading-relaxed">
                          {r.rollback_plan || "—"}
                        </p>
                      </div>
                      <div>
                        <div className="stat-label text-ink-400">
                          Latency improvement
                        </div>
                        <p className="text-ink-700 mt-1 font-mono">
                          {r.estimated_latency_improvement_pct != null
                            ? fmtPct(r.estimated_latency_improvement_pct)
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Scale-up / scale-down suggestion */}
                    {r.scale_suggestion && (
                      <div className="flex items-center gap-2 rounded-lg bg-accent-50 border border-accent-200 px-3 py-2">
                        <ArrowUpDown className="w-4 h-4 text-accent-600 shrink-0" />
                        <span className="text-[10px] uppercase tracking-wider text-accent-700 font-semibold">
                          Scale action
                        </span>
                        <span className="text-sm text-ink-800">
                          {r.scale_suggestion}
                        </span>
                      </div>
                    )}

                    {r.payload && Object.keys(r.payload || {}).length > 0 && (
                      <details className="bg-paper-100 rounded-lg p-3 text-xs">
                        <summary className="cursor-pointer text-ink-500 hover:text-ink-800 font-mono">
                          Payload
                        </summary>
                        <pre className="mt-2 text-ink-500 font-mono overflow-x-auto">
                          {JSON.stringify(r.payload, null, 2)}
                        </pre>
                      </details>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap pt-1">
                      {r.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleDecision(r.id, "approve")}
                            disabled={!!busy[r.id]}
                            className="btn-primary"
                          >
                            {busy[r.id] === "approve" ? (
                              <Spinner />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision(r.id, "reject")}
                            disabled={!!busy[r.id]}
                            className="btn-ghost"
                          >
                            {busy[r.id] === "reject" ? (
                              <Spinner />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            Reject
                          </button>
                        </>
                      )}
                      {(r.status === "approved" ||
                        (r.status === "pending" && r.risk_class === "low")) && (
                        <button
                          onClick={() => handleExecute(r.id, false)}
                          disabled={!!busy[r.id]}
                          className="btn-primary"
                        >
                          {busy[r.id] === "execute" ? (
                            <Spinner />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                          Execute
                        </button>
                      )}
                      <button
                        onClick={() => handleExecute(r.id, true)}
                        disabled={!!busy[r.id]}
                        className="btn-ghost"
                        title="Simulate this action without changing any resource"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Try Run
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
