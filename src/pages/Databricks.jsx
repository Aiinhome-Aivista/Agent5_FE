import { useEffect, useState } from "react";
import {
  Database,
  RefreshCw,
  Boxes,
  ExternalLink,
  Lightbulb,
} from "lucide-react";
import clsx from "clsx";
import { endpoints } from "../api/client";
import { useAppStore } from "../store/store";
import {
  Section,
  LoadingBlock,
  EmptyState,
  RiskPill,
  StatusPill,
  fmtMoney,
} from "../components/UI";

const STATE_STYLES = {
  RUNNING: "bg-emerald-100 text-emerald-800 border-emerald-300",
  TERMINATED: "bg-paper-200 text-ink-600 border-paper-400",
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  RESIZING: "bg-violet-100 text-violet-800 border-violet-300",
  ERROR: "bg-red-100 text-red-800 border-red-300",
};

function ClusterStatePill({ state }) {
  const cls = STATE_STYLES[state] || "bg-paper-100 text-ink-500 border-paper-300";
  return (
    <span className={clsx("pill border font-mono", cls)}>{state || "unknown"}</span>
  );
}

export default function Databricks() {
  const { accountId, pushToast, currency } = useAppStore();
  const [clusters, setClusters] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const params = {};
    if (accountId) params.account_id = accountId;
    try {
      const { data } = await endpoints.databricksClusters(params);
      setClusters(data.clusters || []);
      setTotal(data.total || 0);
      if (data.error) setError(data.error);
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage || "Failed to load clusters" });
      setError(e.userMessage || "Failed to load clusters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  return (
    <div className="space-y-5">
      <Section
        title="Azure Databricks Clusters"
        subtitle="Live cluster inventory across every registered Azure subscription, with any linked optimization recommendation."
        action={
          <button onClick={load} className="btn-ghost" disabled={loading}>
            <RefreshCw className={clsx("w-3.5 h-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        }
      >
        {loading ? (
          <LoadingBlock label="Fetching cluster inventory…" />
        ) : clusters.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No Databricks clusters found"
            description={
              error ||
              "No clusters were found in any registered Azure subscription. If you have Databricks workspaces, make sure the account's service principal (or an optional Databricks token in Settings) has access."
            }
          />
        ) : (
          <div className="space-y-2.5">
            {clusters.map((c) => (
              <div key={c.cluster_id} className="card px-4 py-3.5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ClusterStatePill state={c.state} />
                      <span className="text-[10px] font-mono text-ink-400 uppercase tracking-wider">
                        {c.node_type_id || "unknown node type"}
                      </span>
                      {c.spark_version && (
                        <span className="text-[10px] font-mono text-ink-400">
                          spark {c.spark_version}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-ink-900 font-medium mt-1.5">
                      {c.cluster_name || c.cluster_id}
                    </div>
                    <div className="text-[11px] font-mono text-ink-400 mt-0.5 truncate">
                      {c.cluster_id}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-ink-500">
                      <Boxes className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-mono">
                        {c.workspace_name} · {c.resource_group_name || "—"}
                      </span>
                      {c.resource_group_id && (
                        <a
                          href={`https://portal.azure.com/#@/resource${c.resource_group_id}/overview`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-ink-400 hover:text-accent-600"
                          title="Open resource group in Azure Portal"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-ink-400 mt-1 flex flex-wrap gap-x-3">
                      {c.num_workers != null && <span>workers: {c.num_workers}</span>}
                      {(c.autoscale_min_workers != null ||
                        c.autoscale_max_workers != null) && (
                        <span>
                          autoscale: {c.autoscale_min_workers ?? "?"}–
                          {c.autoscale_max_workers ?? "?"}
                        </span>
                      )}
                      <span>
                        auto-term:{" "}
                        {c.autotermination_minutes
                          ? `${c.autotermination_minutes}m`
                          : "none"}
                      </span>
                    </div>
                  </div>

                  {c.recommendation && (
                    <div className="rounded-lg bg-accent-50 border border-accent-200 px-3 py-2 shrink-0 max-w-xs">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-accent-700 font-semibold">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Linked recommendation
                      </div>
                      <div className="text-xs text-ink-800 mt-1 leading-snug">
                        {c.recommendation.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <StatusPill status={c.recommendation.status} />
                        <RiskPill risk={c.recommendation.risk_class} />
                        {c.recommendation.estimated_monthly_savings_usd > 0 && (
                          <span className="text-[11px] font-mono text-accent-700">
                            {fmtMoney(
                              c.recommendation.estimated_monthly_savings_usd,
                              currency,
                            )}
                            /mo
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
