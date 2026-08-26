import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Check,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Database,
  PlusCircle,
  History,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { endpoints } from "../api/client";
import { useAppStore } from "../store/store";
import {
  Section,
  LoadingBlock,
  EmptyState,
  Spinner,
  ProviderBadge,
  fmtMoney,
} from "../components/UI";
import RunbookUploadModal from "../components/RunbookUploadModal";

const EMPTY_RULE = {
  title: "",
  content: "",
  provider: "any",
  resource_type: "Any",
  category: "Custom",
  status: "draft",
};

function RuleEditor({ value, onChange }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="space-y-3">
      <input
        value={value.title}
        onChange={set("title")}
        placeholder="Rule title (e.g. Azure VM right-sizing)"
        className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm text-gray-700 bg-paper-100 focus:bg-white focus:outline-none focus:border-accent-500"
      />
      <textarea
        rows={5}
        value={value.content}
        onChange={set("content")}
        placeholder="Rule content: detection thresholds, recommended action, risk, expected savings (USD), scale-up/down guidance, rollback…"
        className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm text-gray-700 bg-paper-100 focus:bg-white focus:outline-none focus:border-accent-500 resize-none"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Provider
          </label>
          <select
            value={value.provider}
            onChange={set("provider")}
            className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm text-gray-700 bg-paper-100 focus:bg-white focus:outline-none"
          >
            {["Any", "AWS", "Azure", "GCP"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Resource type
          </label>
          <input
            value={value.resource_type}
            onChange={set("resource_type")}
            placeholder="vm, sql_db, ec2…"
            className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm text-gray-700 bg-paper-100 focus:bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Category
          </label>
          <input
            value={value.category}
            onChange={set("category")}
            placeholder="right_sizing, idle_resource…"
            className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm text-gray-700 bg-paper-100 focus:bg-white focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

export default function Rulebook() {
  const { pushToast, currency } = useAppStore();
  const [rules, setRules] = useState([]);
  const [vectorCounts, setVectorCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [busy, setBusy] = useState({});
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_RULE);
  const [adding, setAdding] = useState(false);
  const [newRule, setNewRule] = useState(EMPTY_RULE);
  const [runbookOpen, setRunbookOpen] = useState(false);

  // Execution history — rules auto-added to the Rule Book whenever a
  // recommendation is successfully executed.
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await endpoints.ruleHistory({});
      setHistory(data.rules || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const [{ data }, vc] = await Promise.all([
        endpoints.rules(params),
        endpoints.vectorCounts().catch(() => ({ data: null })),
      ]);
      setRules(data.rules || []);
      setVectorCounts(vc?.data || null);
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage || "Failed to load" });
    } finally {
      setLoading(false);
    }
  };

  function openRunbook() {
    setRunbookOpen(true);
  }
  function closeRunbook() {
    setRunbookOpen(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    loadHistory();
  }, []);

  const approve = async (id) => {
    setBusy({ ...busy, [id]: "approve" });
    try {
      await endpoints.approveRule(id, "ui-user");
      pushToast({ type: "success", message: "Rule approved" });
      load();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage || "Approve failed" });
    } finally {
      setBusy({ ...busy, [id]: null });
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this rule from the knowledge base?")) return;
    setBusy({ ...busy, [id]: "delete" });
    try {
      await endpoints.deleteRule(id);
      pushToast({ type: "success", message: "Rule deleted" });
      load();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage || "Delete failed" });
    } finally {
      setBusy({ ...busy, [id]: null });
    }
  };

  const startEdit = (r) => {
    setEditId(r.id);
    setDraft({
      title: r.title,
      content: r.content,
      provider: r.provider,
      resource_type: r.resource_type,
      category: r.category,
      status: r.status,
    });
  };

  const saveEdit = async (id) => {
    if (!draft.title.trim() || !draft.content.trim()) {
      pushToast({ type: "error", message: "Title and content are required" });
      return;
    }
    setBusy({ ...busy, [id]: "save" });
    try {
      await endpoints.updateRule(id, draft);
      pushToast({ type: "success", message: "Rule updated" });
      setEditId(null);
      load();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage || "Update failed" });
    } finally {
      setBusy({ ...busy, [id]: null });
    }
  };

  const saveNew = async (approveNow) => {
    if (!newRule.title.trim() || !newRule.content.trim()) {
      pushToast({ type: "error", message: "Title and content are required" });
      return;
    }
    setBusy({ ...busy, _new: true });
    try {
      const { data } = await endpoints.createRule({
        ...newRule,
        status: approveNow ? "approved" : "draft",
      });
      if (approveNow && data?.id)
        await endpoints.approveRule(data.id, "ui-user");
      pushToast({ type: "success", message: "Rule added" });
      setAdding(false);
      setNewRule(EMPTY_RULE);
      load();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage || "Add failed" });
    } finally {
      setBusy({ ...busy, _new: false });
    }
  };

  return (
    <div className="space-y-6">
      <Section
        title="Execution History"
        subtitle="Every successfully executed recommendation is automatically promoted into the Rule Book — this is that audit trail."
        action={
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="btn-ghost"
          >
            <History className="w-3.5 h-3.5" />
            {historyOpen ? "Hide" : "Show"} ({history.length})
          </button>
        }
      >
        {historyOpen &&
          (historyLoading ? (
            <LoadingBlock label="Loading execution history…" />
          ) : history.length === 0 ? (
            <EmptyState
              icon={History}
              title="No executions yet"
              description="Once a recommendation is approved and executed, it will automatically appear here as a rule."
            />
          ) : (
            <div className="space-y-2">
              {history.map((r) => (
                <div
                  key={r.id}
                  className="card px-4 py-3 flex items-start justify-between gap-3 flex-wrap"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ProviderBadge provider={r.provider} />
                      <span className="pill border bg-accent-100 text-emerald-800 border-accent-300">
                        <Zap className="w-3 h-3" />
                        executed
                      </span>
                      <span className="text-[10px] font-mono text-ink-400 uppercase tracking-wider">
                        {r.action_type} · {r.resource_type}
                      </span>
                    </div>
                    <div className="text-sm text-ink-900 font-medium mt-1.5">
                      {r.title?.replace(/^\[Executed\]\s*/, "")}
                    </div>
                    {r.resource_group_name && (
                      <div className="text-[11px] font-mono text-ink-400 mt-0.5">
                        rg: {r.resource_group_name}
                      </div>
                    )}
                    <div className="text-[11px] text-ink-400 mt-1">
                      by {r.executed_by || "—"} ·{" "}
                      {r.executed_at?.slice(0, 16)?.replace("T", " ")}
                    </div>
                  </div>
                  {r.realized_savings_usd != null && (
                    <div className="text-right whitespace-nowrap">
                      <div className="text-accent-600 font-display text-base font-semibold tabular-nums">
                        {fmtMoney(r.realized_savings_usd, currency)}
                      </div>
                      <div className="text-[10px] text-ink-400 uppercase tracking-wider">
                        realized / mo
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
      </Section>

      <Section title="Vector Knowledge Base">
        <div className="card p-5">
          <div className="grid grid-cols-3 gap-4">
            {vectorCounts &&
              Object.entries(vectorCounts).map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs uppercase tracking-wider text-ink-500 font-medium">
                    {k}
                  </div>
                  <div className="stat-num text-2xl mt-1">{v}</div>
                  <div className="text-xs text-ink-400 mt-0.5">documents</div>
                </div>
              ))}
          </div>
          {/* <button
            onClick={async () => {
              try {
                const { data } = await endpoints.seedPlaybooks(false);
                pushToast({
                  type: "success",
                  message: `Seeded ${data.added || 0} new playbooks`,
                });
                await load();
              } catch (e) {
                pushToast({ type: "error", message: e.userMessage });
              }
            }}
            className="btn-ghost mt-4"
          >
            <Database className="w-3.5 h-3.5" /> Re-seed playbooks
          </button> */}
        </div>
      </Section>

      <Section
        title="Optimization Rulebook"
        subtitle="Live knowledge base the agents reason over. Approve, edit, or add rules on the fly."
        action={
          <div className="flex gap-2">
            <button
              onClick={openRunbook}
              className="btn-primary text-white border-transparent"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Upload Runbook
            </button>
            {!adding && (
              <button onClick={() => setAdding(true)} className="btn-primary">
                <Plus className="w-3.5 h-3.5" />
                Add rule
              </button>
            )}
          </div>
        }
      >
        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {["all", "draft", "approved"].map((s) => (
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

        {/* Add form */}
        {adding && (
          <div className="card p-4 mb-4 space-y-3 border-accent-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">New rule</h3>
              <button
                onClick={() => {
                  setAdding(false);
                  setNewRule(EMPTY_RULE);
                }}
                className="text-ink-400 hover:text-ink-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <RuleEditor value={newRule} onChange={setNewRule} />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => saveNew(false)}
                disabled={busy._new}
                className="btn-ghost"
              >
                {busy._new ? <Spinner /> : <Save className="w-3.5 h-3.5" />}
                Save as draft
              </button>
              <button
                onClick={() => saveNew(true)}
                disabled={busy._new}
                className="btn-primary"
              >
                {busy._new ? (
                  <Spinner />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Save & approve
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingBlock />
        ) : rules.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No rules yet"
            description="Add a rule or seed the playbooks from Settings to populate the knowledge base."
          />
        ) : (
          <div className="space-y-2.5">
            {rules.map((r) => {
              const isEditing = editId === r.id;
              return (
                <div key={r.id} className="card px-4 py-3.5">
                  {isEditing ? (
                    <div className="space-y-3">
                      <RuleEditor value={draft} onChange={setDraft} />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditId(null)}
                          className="btn-ghost"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(r.id)}
                          disabled={busy[r.id] === "save"}
                          className="btn-primary"
                        >
                          {busy[r.id] === "save" ? (
                            <Spinner />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <ProviderBadge provider={r.provider} />
                            <span
                              className={clsx(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                r.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-gold-50 text-gold-700 border border-gold-300",
                              )}
                            >
                              {r.status}
                            </span>
                            <span className="text-[10px] font-mono text-ink-400 uppercase tracking-wider">
                              {r.category} · {r.resource_type}
                            </span>
                          </div>
                          <div className="text-sm text-ink-900 font-medium mt-1.5">
                            {r.title}
                          </div>
                          <p className="text-[12px] text-ink-500 mt-1 leading-relaxed line-clamp-3">
                            {r.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {r.status !== "approved" && (
                            <button
                              onClick={() => approve(r.id)}
                              disabled={!!busy[r.id]}
                              className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50"
                              title="Approve"
                            >
                              {busy[r.id] === "approve" ? (
                                <Spinner />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(r)}
                            className="p-1.5 rounded-md text-ink-500 hover:bg-paper-200"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => remove(r.id)}
                            disabled={!!busy[r.id]}
                            className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50"
                            title="Delete"
                          >
                            {busy[r.id] === "delete" ? (
                              <Spinner />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>
      <RunbookUploadModal
        open={runbookOpen}
        onClose={closeRunbook}
        onSaved={() => {
          console.log("saved");
        }}
        pushToast={pushToast}
      />
    </div>
  );
}
