import { useEffect, useState, useRef } from "react";
import {
  Cloud,
  KeyRound,
  Check,
  X,
  AlertCircle,
  Trash2,
  Power,
  RefreshCw,
  PlusCircle,
  Settings2,
  Sparkles,
  ChevronRight,
  Loader2,
  Link2,
  Unlink,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";
import { endpoints } from "../api/client";
import { Section, Spinner, ProviderBadge, EmptyState } from "../components/UI";
import { useAppStore } from "../store/store";

const AWS_REGIONS = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-central-1",
  "eu-north-1",
  "ap-south-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
];

const EMPTY_AWS = {
  aws_access_key_id: "",
  aws_secret_access_key: "",
  region: "us-east-1",
};
const EMPTY_AZURE = {
  tenant_id: "",
  client_id: "",
  client_secret: "",
  subscription_id: "",
  databricks_token: "",
};

export default function Settings() {
  const pushToast = useAppStore((s) => s.pushToast);
  const [accounts, setAccounts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add-account form state
  const [showForm, setShowForm] = useState(false);
  const [provider, setProvider] = useState("aws");
  const [displayName, setDisplayName] = useState("");
  const [aws, setAws] = useState(EMPTY_AWS);
  const [azure, setAzure] = useState(EMPTY_AZURE);

  // Test connection state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Jira connector state
  const [jiraConfig, setJiraConfig] = useState(null);
  const [jiraForm, setJiraForm] = useState({ jira_url: "", email: "", api_token: "", project_key: "" });
  const [showJiraForm, setShowJiraForm] = useState(false);
  const [jiraTesting, setJiraTesting] = useState(false);
  const [jiraTestResult, setJiraTestResult] = useState(null);
  const [jiraSaving, setJiraSaving] = useState(false);


  // ----- load -----
  async function refresh() {
    setLoading(true);
    try {
      const [a, s, h, j] = await Promise.all([
        endpoints.accounts(),
        endpoints.settings(),
        endpoints.health(),
        endpoints.getJiraConfig(),
      ]);
      setAccounts(a.data);
      setSettings(s.data);
      setHealth(h.data);
      setJiraConfig(j.data?.configured ? j.data : null);
    } catch (e) {
      pushToast({
        type: "error",
        message: e.userMessage || "Failed to load settings",
      });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  // helpers for form

  function resetForm() {
    setShowForm(false);
    setProvider("aws");
    setDisplayName("");
    setAws(EMPTY_AWS);
    setAzure(EMPTY_AZURE);
    setTestResult(null);
  }

  function currentCreds() {
    return provider === "aws"
      ? { provider: "aws", aws }
      : { provider: "azure", azure };
  }

  // ----- Test connection (no save) -----
  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const { data } = await endpoints.testCredentials(currentCreds());
      setTestResult(data);
      if (data.ok) {
        pushToast({
          type: "success",
          message: `Connected: ${data.account_id || data.display_name || "OK"}`,
        });
      } else {
        pushToast({
          type: "error",
          message: data.error || "Connection failed",
        });
      }
    } catch (e) {
      setTestResult({ ok: false, error: e.userMessage });
      pushToast({ type: "error", message: e.userMessage });
    } finally {
      setTesting(false);
    }
  }

  // ----- Save (test + persist) -----
  async function handleSave() {
    setSaving(true);
    try {
      await endpoints.createAccount({
        ...currentCreds(),
        display_name: displayName || undefined,
      });
      pushToast({ type: "success", message: "Account saved" });
      resetForm();
      await refresh();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage });
    } finally {
      setSaving(false);
    }
  }

  // ----- Per-row actions -----
  async function handleTestSaved(id) {
    try {
      const { data } = await endpoints.testSavedAccount(id);
      pushToast({
        type: data.ok ? "success" : "error",
        message: data.ok
          ? `OK: ${data.account_id || data.display_name || "connected"}`
          : data.error || "Test failed",
      });
      await refresh();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage });
    }
  }

  async function handleToggle(id) {
    try {
      await endpoints.toggleAccount(id);
      await refresh();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this account? Stored credentials will be erased."))
      return;
    try {
      await endpoints.deleteAccount(id);
      pushToast({ type: "success", message: "Account removed" });
      await refresh();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage });
    }
  }

  // ----- form valid? -----
  const formValid =
    provider === "aws"
      ? aws.aws_access_key_id.length >= 16 &&
        aws.aws_secret_access_key.length >= 16
      : azure.tenant_id &&
        azure.client_id &&
        azure.client_secret &&
        azure.subscription_id;

  // Jira handlers
  const jiraFormValid = jiraForm.jira_url && jiraForm.email && jiraForm.api_token;

  async function handleJiraTest() {
    setJiraTesting(true);
    setJiraTestResult(null);
    try {
      const { data } = await endpoints.testJiraConfig(jiraForm);
      setJiraTestResult(data);
      pushToast({
        type: data.ok ? "success" : "error",
        message: data.ok ? `Connected as ${data.display_name}` : data.error,
      });
    } catch (e) {
      setJiraTestResult({ ok: false, error: e.userMessage });
      pushToast({ type: "error", message: e.userMessage });
    } finally {
      setJiraTesting(false);
    }
  }

  async function handleJiraSave() {
    setJiraSaving(true);
    try {
      await endpoints.saveJiraConfig(jiraForm);
      pushToast({ type: "success", message: "Jira connector saved" });
      setShowJiraForm(false);
      setJiraForm({ jira_url: "", email: "", api_token: "", project_key: "" });
      setJiraTestResult(null);
      await refresh();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage });
    } finally {
      setJiraSaving(false);
    }
  }

  async function handleJiraTestSaved() {
    if (!jiraConfig?.id) return;
    try {
      const { data } = await endpoints.testSavedJiraConfig(jiraConfig.id);
      pushToast({
        type: data.ok ? "success" : "error",
        message: data.ok ? `Connected as ${data.display_name}` : data.error,
      });
      await refresh();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage });
    }
  }

  async function handleJiraDelete() {
    if (!jiraConfig?.id) return;
    if (!confirm("Remove Jira connector? Stored credentials will be erased.")) return;
    try {
      await endpoints.deleteJiraConfig(jiraConfig.id);
      setJiraConfig(null);
      pushToast({ type: "success", message: "Jira connector removed" });
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage });
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-ink-500">
        <Spinner /> <span className="ml-2">Loading settings…</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Cloud accounts, Vector knowledge base and Operational Runbooks.
          </p>
        </div>
        <button onClick={refresh} className="btn-ghost">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* ---------- Cloud Accounts ---------- */}
      <Section
        title="Cloud Accounts"
        action={
          !showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <PlusCircle className="w-3.5 h-3.5" /> Add account
            </button>
          )
        }
      >
        {/* Add-account form */}
        {showForm && (
          <div className="card p-5 mb-4 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="w-4 h-4 text-accent-600" />
              <h3 className="font-display text-base font-semibold text-ink-900">
                Add a cloud account
              </h3>
            </div>

            {/* Provider tabs */}
            <div className="flex bg-paper-100 border border-paper-300 rounded-lg p-0.5 mb-5 w-fit">
              {["aws", "azure"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setProvider(p);
                    setTestResult(null);
                  }}
                  className={clsx(
                    "px-4 py-1.5 text-sm rounded-md font-medium transition-colors",
                    provider === p
                      ? "bg-accent-600 text-white shadow-sm"
                      : "text-ink-600 hover:text-ink-800",
                  )}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Display name (optional)</label>
                <input
                  className="input"
                  placeholder={
                    provider === "aws" ? "Production AWS" : "Production Azure"
                  }
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              {provider === "aws" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="label">AWS Access Key ID</label>
                    <input
                      className="input font-mono"
                      placeholder="AKIA…"
                      value={aws.aws_access_key_id}
                      onChange={(e) => {
                        setAws({ ...aws, aws_access_key_id: e.target.value });
                        setTestResult(null);
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">AWS Secret Access Key</label>
                    <input
                      type="password"
                      className="input font-mono"
                      placeholder="••••••••"
                      value={aws.aws_secret_access_key}
                      onChange={(e) => {
                        setAws({
                          ...aws,
                          aws_secret_access_key: e.target.value,
                        });
                        setTestResult(null);
                      }}
                    />
                  </div>
                  <div>
                    <label className="label">Default region</label>
                    <select
                      className="input"
                      value={aws.region}
                      onChange={(e) => {
                        setAws({ ...aws, region: e.target.value });
                        setTestResult(null);
                      }}
                    >
                      {AWS_REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Tenant ID</label>
                    <input
                      className="input font-mono"
                      placeholder="00000000-0000-0000-0000-000000000000"
                      value={azure.tenant_id}
                      onChange={(e) => {
                        setAzure({ ...azure, tenant_id: e.target.value });
                        setTestResult(null);
                      }}
                    />
                  </div>
                  <div>
                    <label className="label">Subscription ID</label>
                    <input
                      className="input font-mono"
                      placeholder="00000000-0000-0000-0000-000000000000"
                      value={azure.subscription_id}
                      onChange={(e) => {
                        setAzure({ ...azure, subscription_id: e.target.value });
                        setTestResult(null);
                      }}
                    />
                  </div>
                  <div>
                    <label className="label">Client (App) ID</label>
                    <input
                      className="input font-mono"
                      placeholder="00000000-0000-0000-0000-000000000000"
                      value={azure.client_id}
                      onChange={(e) => {
                        setAzure({ ...azure, client_id: e.target.value });
                        setTestResult(null);
                      }}
                    />
                  </div>
                  <div>
                    <label className="label">Client Secret</label>
                    <input
                      type="password"
                      className="input font-mono"
                      placeholder="••••••••"
                      value={azure.client_secret}
                      onChange={(e) => {
                        setAzure({ ...azure, client_secret: e.target.value });
                        setTestResult(null);
                      }}
                    />
                  </div>
                  {/* <div className="md:col-span-2">
                    <label className="label">
                      Databricks token{" "}
                      <span className="text-ink-400 font-normal normal-case">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="password"
                      className="input font-mono"
                      placeholder="dapi••••••••  (only needed if the service principal above isn't a Databricks workspace user)"
                      value={azure.databricks_token}
                      onChange={(e) => {
                        setAzure({ ...azure, databricks_token: e.target.value });
                      }}
                    />
                  </div> */}
                </div>
              )}
            </div>

            {/* Test result */}
            {testResult && (
              <div
                className={clsx(
                  "mt-4 rounded-lg p-3.5 text-sm border flex items-start gap-2.5 animate-fade-up",
                  testResult.ok
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : "bg-crimson-50 border-crimson-100 text-crimson-700",
                )}
              >
                {testResult.ok ? (
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {testResult.ok ? (
                    <div>
                      <div className="font-semibold">Connection successful</div>
                      <div className="text-xs mt-1 font-mono text-emerald-600 break-all">
                        {testResult.account_id && (
                          <>Account: {testResult.account_id}</>
                        )}
                        {testResult.subscription_id && (
                          <>
                            Subscription: {testResult.display_name} (
                            {testResult.subscription_id})
                          </>
                        )}
                        {testResult.arn && (
                          <div className="mt-0.5">{testResult.arn}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-semibold">Connection failed</div>
                      <div className="text-xs mt-1 font-mono text-crimson-600 break-all">
                        {testResult.error}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-paper-300">
              <button
                onClick={handleTest}
                disabled={!formValid || testing}
                className="btn-ghost"
              >
                {testing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {testing ? "Testing…" : "Test connection"}
              </button>
              <button
                onClick={handleSave}
                disabled={!formValid || saving || !testResult?.ok}
                className="btn-primary"
                title={
                  !testResult?.ok ? "Test connection first" : "Save account"
                }
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                {saving ? "Saving…" : "Save account"}
              </button>
              <button onClick={resetForm} className="btn-ghost text-ink-500">
                Cancel
              </button>
              <div className="ml-auto text-xs text-ink-400">
                {!testResult?.ok &&
                  formValid &&
                  "Test connection before saving →"}
              </div>
            </div>
          </div>
        )}

        {/* Accounts list */}
        {accounts.length === 0 ? (
          <EmptyState
            icon={Cloud}
            title="No cloud accounts yet"
            description="Add an AWS or Azure account above to begin scanning."
          />
        ) : (
          <div className="space-y-2.5">
            {accounts.map((a) => (
              <AccountRow
                key={a.id}
                account={a}
                onTest={() => handleTestSaved(a.id)}
                onToggle={() => handleToggle(a.id)}
                onDelete={() => handleDelete(a.id)}
              />
            ))}
          </div>
        )}
      </Section>

      {/* ---------- System Health ---------- */}
      {/* <Section title="System Health">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <HealthTile
            label="MySQL"
            value={health?.mysql === "ok" ? "ok" : "error"}
            hint={health?.mysql === "ok" ? null : health?.mysql}
          />
          <HealthTile
            label="ChromaDB"
            value={typeof health?.chromadb === "object" ? "ok" : "error"}
            hint={
              typeof health?.chromadb === "object"
                ? `${Object.values(health.chromadb).reduce((a, b) => a + (b || 0), 0)} docs`
                : null
            }
          />
          <HealthTile
            label="Mistral API"
            value={health?.mistral_configured ? "ok" : "unconfigured"}
            hint={health?.mistral_frontier_model}
          />
          <HealthTile
            label="Accounts"
            value={
              (health?.aws_accounts?.ok || 0) +
                (health?.azure_accounts?.ok || 0) >
              0
                ? "ok"
                : "none"
            }
            hint={`AWS: ${health?.aws_accounts?.ok || 0}/${health?.aws_accounts?.total || 0} · Azure: ${health?.azure_accounts?.ok || 0}/${health?.azure_accounts?.total || 0}`}
          />
        </div>
      </Section> */}

      {/* Moved Vector Knowledge Base and Operational Runbooks to Rulebook */}

      {/* ---------- Integrations: Jira ---------- */}
      <Section
        title="Integrations"
        action={
          !jiraConfig && !showJiraForm && (
            <button onClick={() => setShowJiraForm(true)} className="btn-primary">
              <Link2 className="w-3.5 h-3.5" /> Connect Jira
            </button>
          )
        }
      >
        {/* Connected Jira config row */}
        {jiraConfig && (
          <div className="card p-4 animate-fade-up">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {/* Jira logo-style icon */}
                <div className="w-9 h-9 rounded-lg bg-[#0052CC] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">J</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-ink-900 text-sm">
                      {jiraConfig.jira_url}
                    </span>
                    {jiraConfig.last_test_status === "ok" ? (
                      <span className="pill bg-emerald-50 text-emerald-700 border-emerald-100">
                        <Check className="w-3 h-3" /> connected
                      </span>
                    ) : jiraConfig.last_test_status === "error" ? (
                      <span className="pill bg-crimson-50 text-crimson-700 border-crimson-100">
                        <X className="w-3 h-3" /> failed
                      </span>
                    ) : (
                      <span className="pill bg-paper-200 text-ink-500 border-paper-300">
                        not tested
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-500 font-mono mt-0.5">
                    {jiraConfig.email_masked}
                    {jiraConfig.project_key && (
                      <span className="ml-2 text-ink-400">· project: {jiraConfig.project_key}</span>
                    )}
                  </div>
                  {jiraConfig.last_test_message && (
                    <div className="text-xs text-ink-400 mt-1">{jiraConfig.last_test_message}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={jiraConfig.jira_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost py-1 px-2.5 text-xs"
                  title="Open Jira"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={handleJiraTestSaved}
                  className="btn-ghost py-1 px-2.5 text-xs"
                  title="Test live connection"
                >
                  <Sparkles className="w-3 h-3" /> Test
                </button>
                <button
                  onClick={() => {
                    setJiraForm({
                      jira_url: jiraConfig.jira_url,
                      email: "",
                      api_token: "",
                      project_key: jiraConfig.project_key || "",
                    });
                    setShowJiraForm(true);
                  }}
                  className="btn-ghost py-1 px-2.5 text-xs"
                  title="Edit credentials"
                >
                  <Settings2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={handleJiraDelete}
                  className="btn-ghost py-1 px-2 text-xs text-crimson-600 hover:bg-crimson-50"
                  title="Remove connector"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Jira form */}
        {showJiraForm && (
          <div className="card p-5 mt-3 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-[#0052CC] flex items-center justify-center">
                <span className="text-white font-bold text-xs">J</span>
              </div>
              <h3 className="font-display text-base font-semibold text-ink-900">
                {jiraConfig ? "Update Jira Credentials" : "Connect Jira"}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Jira Instance URL</label>
                <input
                  className="input font-mono"
                  placeholder="https://yourcompany.atlassian.net"
                  value={jiraForm.jira_url}
                  onChange={(e) => { setJiraForm({ ...jiraForm, jira_url: e.target.value }); setJiraTestResult(null); }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    placeholder="you@company.com"
                    value={jiraForm.email}
                    onChange={(e) => { setJiraForm({ ...jiraForm, email: e.target.value }); setJiraTestResult(null); }}
                  />
                </div>
                <div>
                  <label className="label">API Token</label>
                  <input
                    type="password"
                    className="input font-mono"
                    placeholder="••••••••"
                    value={jiraForm.api_token}
                    onChange={(e) => { setJiraForm({ ...jiraForm, api_token: e.target.value }); setJiraTestResult(null); }}
                  />
                </div>
                <div>
                  <label className="label">Default Project Key <span className="text-ink-400 font-normal">(optional)</span></label>
                  <input
                    className="input font-mono uppercase"
                    placeholder="PLAT"
                    value={jiraForm.project_key}
                    onChange={(e) => setJiraForm({ ...jiraForm, project_key: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>
            </div>

            {/* Test result */}
            {jiraTestResult && (
              <div className={clsx(
                "mt-4 rounded-lg p-3.5 text-sm border flex items-start gap-2.5 animate-fade-up",
                jiraTestResult.ok
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : "bg-crimson-50 border-crimson-100 text-crimson-700",
              )}>
                {jiraTestResult.ok
                  ? <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  {jiraTestResult.ok ? (
                    <>
                      <div className="font-semibold">Connection successful</div>
                      <div className="text-xs mt-1 font-mono text-emerald-600">
                        Logged in as: {jiraTestResult.display_name}
                      </div>
                      {jiraTestResult.projects && jiraTestResult.projects.length > 0 ? (
                        <div className="mt-2 text-xs text-ink-700">
                          <span className="font-semibold">Available Projects:</span>{" "}
                          {jiraTestResult.projects.map((p) => (
                            <button
                              key={p.key}
                              type="button"
                              onClick={() => setJiraForm({ ...jiraForm, project_key: p.key })}
                              className="ml-1.5 px-2 py-0.5 rounded bg-paper-200 hover:bg-paper-300 font-mono text-[11px] text-ink-800 border border-paper-300"
                              title={`Set ${p.key} (${p.name}) as default project key`}
                            >
                              {p.key} ({p.name})
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 text-xs bg-gold-50 border border-gold-200 text-gold-800 rounded p-2">
                          <strong>Notice:</strong> No projects found in your Jira account yet. Please create a project (e.g. Scrum or Kanban) in your Jira workspace (<a href={`${jiraForm.jira_url.replace(/\/$/, '')}/jira/projects`} target="_blank" rel="noreferrer" className="underline font-semibold">Create Project ↗</a>) and enter its Key above.
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="font-semibold">Connection failed</div>
                      <div className="text-xs mt-1 font-mono text-crimson-600">{jiraTestResult.error}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-paper-300">
              <button
                onClick={handleJiraTest}
                disabled={!jiraFormValid || jiraTesting}
                className="btn-ghost"
              >
                {jiraTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {jiraTesting ? "Testing…" : "Test connection"}
              </button>
              <button
                onClick={handleJiraSave}
                disabled={!jiraFormValid || jiraSaving || !jiraTestResult?.ok}
                className="btn-primary"
                title={!jiraTestResult?.ok ? "Test connection first" : "Save"}
              >
                {jiraSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {jiraSaving ? "Saving…" : "Save connector"}
              </button>
              <button onClick={() => { setShowJiraForm(false); setJiraTestResult(null); }} className="btn-ghost text-ink-500">
                Cancel
              </button>
              <div className="ml-auto text-xs text-ink-400">
                {!jiraTestResult?.ok && jiraFormValid && "Test connection before saving →"}
              </div>
            </div>
          </div>
        )}

        {!jiraConfig && !showJiraForm && (
          <div className="card p-6 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#0052CC]/10 flex items-center justify-center">
              <span className="text-[#0052CC] font-bold text-xl">J</span>
            </div>
            <div>
              <div className="font-medium text-ink-900 text-sm">No Jira connector configured</div>
              <div className="text-xs text-ink-400 mt-1">Connect Jira to create tickets from recommendations automatically.</div>
            </div>
            <button onClick={() => setShowJiraForm(true)} className="btn-primary mt-1">
              <Link2 className="w-3.5 h-3.5" /> Connect Jira
            </button>
          </div>
        )}
      </Section>

      {/* Moved Vector Knowledge Base and Operational Runbooks to Rulebook */}

      {/* ---------- Runtime configuration ---------- */}
      {/* {settings && (
        <Section title="Runtime Configuration">
          <div className="card p-5">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
              <ConfigRow label="Environment" value={settings.environment} />
              <ConfigRow label="AWS regions scanned" value={settings.aws_regions?.join(', ') || '—'} />
              <ConfigRow label="Auto-execute low-risk" value={settings.auto_execute_low_risk ? 'enabled' : 'disabled'} />
              <ConfigRow label="Blast radius (per hour)" value={`${settings.blast_radius_per_hour} resources`} />
              <ConfigRow label="Idle CPU threshold" value={`${settings.idle_cpu_threshold_pct}%`} />
              <ConfigRow label="Cost-spike threshold" value={`${settings.cost_anomaly_threshold_pct}%`} />
              <ConfigRow label="Telemetry lookback" value={`${settings.telemetry_lookback_days} days`} />
              <ConfigRow
                label="Auto-scan interval"
                value={settings.scan_interval_minutes > 0
                  ? `every ${settings.scan_interval_minutes} min · ${settings.scan_provider}`
                  : 'disabled'}
              />
              <ConfigRow label="Frontier LLM" value={settings.mistral_frontier_model} />
              <ConfigRow label="Efficient LLM" value={settings.mistral_efficient_model} />
            </dl>
          </div>
        </Section>
      )} */}
    </div>
  );
}

/* ===================== sub-components ===================== */

function AccountRow({ account, onTest, onToggle, onDelete }) {
  return (
    <div
      className={clsx(
        "card p-4 flex items-center gap-4 transition-opacity",
        !account.enabled && "opacity-60",
      )}
    >
      <ProviderBadge provider={account.provider} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink-900 text-sm truncate">
            {account.display_name}
          </span>
          {account.last_test_status === "ok" && (
            <span className="pill bg-emerald-50 text-emerald-700 border-emerald-100">
              <Check className="w-3 h-3" /> connected
            </span>
          )}
          {account.last_test_status === "error" && (
            <span className="pill bg-crimson-50 text-crimson-700 border-crimson-100">
              <X className="w-3 h-3" /> failed
            </span>
          )}
          {!account.has_credentials && (
            <span className="pill bg-gold-50 text-gold-700 border-gold-100">
              <AlertCircle className="w-3 h-3" /> no creds
            </span>
          )}
        </div>
        <div className="text-xs text-ink-500 font-mono mt-0.5 truncate">
          {account.account_identifier}
          {account.region && <> · {account.region}</>}
        </div>
        {account.last_test_message && (
          <div className="text-xs text-ink-400 mt-1 truncate">
            {account.last_test_message}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onTest}
          className="btn-ghost py-1 px-2.5 text-xs"
          title="Test live connection"
        >
          <Sparkles className="w-3 h-3" /> Test
        </button>
        <button
          onClick={onToggle}
          className="btn-ghost py-1 px-2.5 text-xs"
          title={account.enabled ? "Disable" : "Enable"}
        >
          <Power
            className={clsx("w-3 h-3", account.enabled && "text-emerald-600")}
          />
          {account.enabled ? "Enabled" : "Disabled"}
        </button>
        <button
          onClick={onDelete}
          className="btn-ghost py-1 px-2 text-xs text-crimson-600 hover:bg-crimson-50"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function HealthTile({ label, value, hint }) {
  const colors = {
    ok: "bg-emerald-50 border-emerald-100 text-emerald-700",
    error: "bg-crimson-50 border-crimson-100 text-crimson-700",
    unconfigured: "bg-gold-50 border-gold-100 text-gold-700",
    none: "bg-paper-100 border-paper-300 text-ink-500",
  };
  return (
    <div className={clsx("card p-4", colors[value] || colors.none)}>
      <div className="text-xs uppercase tracking-wider font-medium opacity-80">
        {label}
      </div>
      <div className="font-display font-semibold text-base mt-1 capitalize">
        {value}
      </div>
      {hint && (
        <div className="text-xs opacity-70 mt-1 font-mono truncate">{hint}</div>
      )}
    </div>
  );
}

function ConfigRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-ink-900 font-mono text-xs text-right">{value}</dd>
    </div>
  );
}
