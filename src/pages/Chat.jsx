import { useEffect, useRef, useState } from "react";
import {
  Send,
  MessageSquare,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { endpoints } from "../api/client";
import { useAppStore } from "../store/store";
import { Spinner, ProviderBadge } from "../components/UI";
import clsx from "clsx";

const SUGGESTED_PROMPTS = [
  {
    icon: FileText,
    text: "Give me an executive summary of cost, performance, and pending optimizations across both clouds.",
  },
  {
    icon: AlertCircle,
    text: "What are the top 3 anomalies right now and what should I do about each?",
  },
  {
    icon: Lightbulb,
    text: "Which pending recommendations have the highest savings-to-risk ratio?",
  },
  {
    icon: BookOpen,
    text: "Show me where we lost money this week — explain spike(s) and root cause.",
  },
];

function CitationBadge({ citation, idx }) {
  const colorMap = {
    recommendation: "bg-[#FF5A14]/15 text-[#FF7A45] border-[#FF8A55]/30",
    anomaly: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    playbook: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    action: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    cost: "bg-[#FF5A14]/15 text-[#FF7A45] border-[#FF8A55]/30",
  };
  const cls =
    colorMap[citation.type] || "bg-[var(--color-input-bg)] text-[var(--color-primary-text)] border-[var(--color-light-border)]";
  return (
    <span
      className={clsx(
        "pill border text-[11px] font-mono inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-sm transition-all duration-200 hover:scale-[1.02]",
        cls,
      )}
      title={citation.snippet}
    >
      <span className="font-bold opacity-90">[{idx + 1}]</span> {citation.source}
    </span>
  );
}

function MarkdownLite({ text }) {
  // Lightweight inline rendering — bold, code spans, line breaks, simple lists.
  const lines = (text || "").split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.trim() === "") return <div key={i} className="h-1" />;
        const isBullet = /^\s*[-*•]\s+/.test(line);
        const isNumbered = /^\s*\d+\.\s+/.test(line);
        const isHeader = /^#+\s+/.test(line);

        const content = line
          .replace(/^\s*[-*•]\s+/, "")
          .replace(/^\s*\d+\.\s+/, "")
          .replace(/^#+\s+/, "");

        const parts = content
          .split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\])/g)
          .filter(Boolean);
        const inline = parts.map((p, j) => {
          if (p.startsWith("**") && p.endsWith("**"))
            return (
              <strong key={j} className="text-[var(--color-heading-text)] font-semibold">
                {p.slice(2, -2)}
              </strong>
            );
          if (p.startsWith("`") && p.endsWith("`"))
            return (
              <code
                key={j}
                className="px-1.5 py-0.5 bg-[var(--color-input-bg)] border border-[var(--color-light-border)] rounded text-[12px] font-mono text-[#FF7A45]"
              >
                {p.slice(1, -1)}
              </code>
            );
          if (p.startsWith("[") && p.endsWith("]"))
            return (
              <span
                key={j}
                className="text-[#FF7A45] font-mono text-[12px] font-semibold"
              >
                {p}
              </span>
            );
          return <span key={j}>{p}</span>;
        });

        if (isHeader)
          return (
            <h4
              key={i}
              className="font-display text-base font-semibold text-[var(--color-heading-text)] mt-2"
            >
              {inline}
            </h4>
          );
        if (isBullet)
          return (
            <div key={i} className="flex gap-2 text-[var(--color-primary-text)]">
              <span className="text-[#FF5A14] flex-shrink-0 mt-1">▸</span>
              <span className="flex-1">{inline}</span>
            </div>
          );
        if (isNumbered)
          return (
            <div key={i} className="flex gap-2 text-[var(--color-primary-text)]">
              <span className="text-[#FF5A14] font-mono text-xs flex-shrink-0 mt-1">
                {line.match(/^\s*(\d+)\./)?.[1]}.
              </span>
              <span className="flex-1">{inline}</span>
            </div>
          );
        return (
          <p key={i} className="text-[var(--color-primary-text)] leading-relaxed">
            {inline}
          </p>
        );
      })}
    </div>
  );
}

export default function Chat() {
  const { provider, accountId, pushToast } = useAppStore();
  const [sessionUuid, setSessionUuid] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessions, setSessions] = useState([]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const loadSessions = async () => {
    try {
      const { data } = await endpoints.chatSessions();
      setSessions(data);
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const newChat = () => {
    setSessionUuid(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  const loadSession = async (uuid) => {
    try {
      const { data } = await endpoints.chatSession(uuid);
      setSessionUuid(uuid);
      setMessages(
        data.messages.map((m) => ({
          role: m.role,
          content: m.content,
          citations: m.citations || [],
        })),
      );
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage });
    }
  };

  const deleteSession = async (uuid, e) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    try {
      await endpoints.deleteChatSession(uuid);
      loadSessions();
      if (sessionUuid === uuid) newChat();
    } catch (e) {
      pushToast({ type: "error", message: e.userMessage });
    }
  };

  const send = async (msgText) => {
    const text = (msgText || input).trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const { data } = await endpoints.chat({
        message: text,
        session_uuid: sessionUuid,
        user_email: "ui-user",
        provider: provider === "all" ? null : provider,
        account_id: accountId,
      });
      setSessionUuid(data.session_uuid);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.message,
          summary: data.summary,
          citations: data.citations || [],
          latency_ms: data.latency_ms,
        },
      ]);
      loadSessions();
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `⚠ ${e.userMessage || "Failed to get response. Check Mistral API key and that the backend can reach the data sources."}`,
          error: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-7.5rem)]">
      {/* Sessions sidebar */}
      <aside className="col-span-3 card flex flex-col overflow-hidden">
        <div className="px-3 py-3 border-b border-paper-300 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-ink-900">
            Conversations
          </h3>
          <button onClick={newChat} className="btn-ghost text-xs py-1 px-2">
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-0.5">
          {sessions.length === 0 ? (
            <div className="text-xs text-ink-400 text-center py-6">
              No history yet
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.session_uuid}
                onClick={() => loadSession(s.session_uuid)}
                className={clsx(
                  "group flex items-start justify-between gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-paper-200",
                  sessionUuid === s.session_uuid &&
                    "bg-accent-50 border border-accent-500/20",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink-800 truncate">
                    {s.title || "Untitled"}
                  </div>
                  <div className="text-[10px] font-mono text-ink-400 mt-0.5">
                    {s.updated_at?.slice(0, 16)}
                  </div>
                </div>
                <button
                  onClick={(e) => deleteSession(s.session_uuid, e)}
                  className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-crimson-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Chat panel */}
      <div className="col-span-9 card flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-paper-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-ink-900">
                Conversational Q&A Agent
              </h2>
              <p className="text-[11px] text-ink-400">
                RAG over telemetry · cost · anomalies · recommendations ·
                actions · playbooks
              </p>
            </div>
          </div>
          {provider !== "all" && <ProviderBadge provider={provider} />}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center mb-5 shadow-sm">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-[var(--color-heading-text)] mb-2">
                Ask anything about your cloud platform
              </h3>
              <p className="text-sm text-[var(--color-secondary-text)] mb-7 max-w-md">
                The agent pulls live data from AWS + Azure, recent
                recommendations, action history, and the optimization playbook
                KB, then answers with citations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {SUGGESTED_PROMPTS.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => send(p.text)}
                      className="text-left p-4 rounded-xl border border-[var(--color-light-border)] bg-[var(--color-input-bg)] hover:border-[#FF8A55] hover:bg-[#FF5A14]/15 transition-all duration-200 group shadow-sm"
                    >
                      <Icon className="w-4 h-4 text-[#FF7A45] mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm text-[var(--color-primary-text)] group-hover:text-[var(--color-heading-text)] leading-snug font-medium">
                        {p.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={clsx(
                  "flex gap-3 animate-fade-up",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={clsx(
                    "max-w-[78%] space-y-2",
                    m.role === "user" ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={clsx(
                      "rounded-xl px-4 py-3 text-sm",
                      m.role === "user"
                        ? "bg-accent-600 text-white rounded-br-sm"
                        : m.error
                          ? "bg-crimson-500/10 border border-crimson-500/30 text-crimson-300 rounded-bl-sm"
                          : "bg-[var(--color-input-bg)] border border-[var(--color-light-border)] text-[var(--color-primary-text)] rounded-bl-sm",
                    )}
                  >
                    {m.role === "user" ? (
                      <div>{m.content}</div>
                    ) : (
                      <MarkdownLite text={m.content} />
                    )}
                  </div>
                  {m.citations && m.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.citations.map((c, idx) => (
                        <CitationBadge key={idx} citation={c} idx={idx} />
                      ))}
                    </div>
                  )}
                  {m.latency_ms != null && (
                    <div className="text-[10px] font-mono text-ink-400">
                      {(m.latency_ms / 1000).toFixed(2)}s ·{" "}
                      {m.citations?.length || 0} citations
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0 animate-pulse-soft">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-paper-200 border border-paper-300 rounded-xl rounded-bl-sm px-4 py-3 text-sm text-ink-500 flex items-center gap-2">
                <Spinner />
                Gathering context across all data sources…
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-paper-300 p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about cost, performance, recommendations, or anomalies…"
              className="input flex-1"
              disabled={sending}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || sending}
              className="btn-primary"
            >
              {sending ? <Spinner /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
          {/* <div className="text-[10px] text-ink-400 mt-2 font-mono">
            Powered by Mistral · context: cost(7d/prior) + utilization + anomalies + recs + actions + playbook KB
          </div> */}
        </div>
      </div>
    </div>
  );
}
