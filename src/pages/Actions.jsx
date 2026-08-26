import { useEffect, useState } from "react";
import {
  Undo2,
  PlayCircle,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { endpoints } from "../api/client";
import { useAppStore } from "../store/store";
import {
  StatusPill,
  Section,
  LoadingBlock,
  EmptyState,
  Spinner,
  fmtMoney,
  fmtUSD,
} from "../components/UI";

export default function Actions() {
  const { pushToast, currency } = useAppStore();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [expandedLog, setExpandedLog] = useState(null);
  const [azureLog, setAzureLog] = useState({});
  const [logLoading, setLogLoading] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await endpoints.actions({ limit: 100 });
      setActions(data);
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rollback = async (id) => {
    if (!confirm("Roll back this action? It will reverse the operation."))
      return;
    setBusy({ ...busy, [id]: true });
    try {
      await endpoints.rollback(id, "ui-user");
      pushToast({ type: "success", message: "Rollback initiated" });
      load();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage });
    } finally {
      setBusy({ ...busy, [id]: false });
    }
  };

  const toggleAzureLog = async (id) => {
    if (expandedLog === id) {
      setExpandedLog(null);
      return;
    }
    setExpandedLog(id);
    if (azureLog[id]) return; // already fetched
    setLogLoading(id);
    try {
      const { data } = await endpoints.actionAzureLog(id);
      setAzureLog((prev) => ({ ...prev, [id]: data }));
    } catch (e) {
      setAzureLog((prev) => ({
        ...prev,
        [id]: { error: e.userMessage || "Could not load Azure activity log" },
      }));
    } finally {
      setLogLoading(null);
    }
  };

  if (loading) return <LoadingBlock />;

  const realizedTotal = actions
    .filter((a) => a.status === "succeeded")
    .reduce((s, a) => s + Number(a.realized_savings_usd || 0), 0);
  const executedCount = actions.filter((a) => a.status === "succeeded").length;

  return (
    <Section
      title="Action History"
      subtitle="All executions performed by the Action Executor agent"
    >
      {/* Realized savings audit summary */}
      <div className="card p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-400">
            Realized savings to date
          </div>
          <div className="text-2xl font-display font-semibold text-emerald-600 tabular-nums">
            {fmtMoney(realizedTotal, currency)}/mo
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-ink-400">
            Successful executions
          </div>
          <div className="text-2xl font-display font-semibold text-ink-800 tabular-nums">
            {executedCount}
          </div>
        </div>
      </div>

      {actions.length === 0 ? (
        <EmptyState
          icon={PlayCircle}
          title="No actions yet"
          description="Approve and execute recommendations to see history here."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-ink-400 border-b border-paper-300">
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Action</div>
            <div className="col-span-3">Target</div>
            <div className="col-span-1">Actor</div>
            <div className="col-span-2 text-right">Savings</div>
            <div className="col-span-2 text-right">When</div>
          </div>
          {actions.map((a) => (
            <div
              key={a.id}
              className="border-b border-paper-300 last:border-0 hover:bg-paper-100"
            >
              <div className="grid grid-cols-12 px-4 py-3 items-center">
                <div className="col-span-2">
                  <StatusPill status={a.status} />
                </div>
                <div className="col-span-2 text-[11px] font-mono text-ink-500 truncate">
                  {a.action_type}
                </div>
                <div className="col-span-3 text-sm text-ink-800 truncate font-mono">
                  {a.resource_id}
                </div>
                <div className="col-span-1 text-xs text-ink-500">{a.actor}</div>
                <div className="col-span-2 text-right font-mono text-accent-600 text-sm">
                  {a.realized_savings_usd != null
                    ? `${fmtMoney(a.realized_savings_usd, currency)}/mo`
                    : "—"}
                </div>
                <div className="col-span-2 text-right text-[11px] text-ink-400 font-mono flex items-center justify-end gap-2">
                  <span>{a.started_at?.slice(0, 16)}</span>
                  {a.provider === "azure" && (
                    <button
                      onClick={() => toggleAzureLog(a.id)}
                      className="text-ink-400 hover:text-accent-600"
                      title="Verify against Azure Activity Log"
                    >
                      {expandedLog === a.id ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                  {a.status === "succeeded" && a.rollback_executed === "no" && (
                    <button
                      onClick={() => rollback(a.id)}
                      disabled={busy[a.id]}
                      className="text-gold-400 hover:text-gold-300 disabled:text-ink-400"
                      title="Roll back"
                    >
                      {busy[a.id] ? (
                        <Spinner />
                      ) : (
                        <Undo2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                {a.error_message && (
                  <div className="col-span-12 text-[11px] text-rose-400 font-mono mt-1 pl-2">
                    ⚠ {a.error_message}
                  </div>
                )}
              </div>

              {expandedLog === a.id && (
                <div className="px-4 pb-3 -mt-1">
                  <div className="rounded-lg bg-paper-100 border border-paper-300 p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                        Azure Activity Log — verification
                      </span>
                      {(a.azure_portal_activity_log_url ||
                        azureLog[a.id]?.portal_url) && (
                        <a
                          href={
                            azureLog[a.id]?.portal_url ||
                            a.azure_portal_activity_log_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent-600 hover:text-accent-700 flex items-center gap-1"
                        >
                          Open in Azure Portal
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {logLoading === a.id ? (
                      <div className="flex items-center gap-2 text-ink-400">
                        <Spinner /> Fetching activity log…
                      </div>
                    ) : azureLog[a.id]?.error ? (
                      <div className="text-rose-500">{azureLog[a.id].error}</div>
                    ) : azureLog[a.id]?.entries?.length ? (
                      <div className="space-y-1.5">
                        {azureLog[a.id].entries.map((e, i) => (
                          <div
                            key={i}
                            className="flex items-start justify-between gap-3 font-mono text-[11px] border-b border-paper-300 last:border-0 pb-1.5 last:pb-0"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-ink-800 truncate">
                                {e.operation_name || e.event_name}
                              </div>
                              <div className="text-ink-400 truncate">
                                {e.caller || "—"}
                              </div>
                            </div>
                            <div className="text-right whitespace-nowrap">
                              <div className="text-ink-500">{e.status}</div>
                              <div className="text-ink-400">
                                {e.event_timestamp?.slice(0, 16)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-ink-400">
                        No matching Azure Activity Log entries found in the
                        execution window yet — logs can take a few minutes to
                        appear.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
