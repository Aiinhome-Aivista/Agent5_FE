import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Clock, XCircle, Zap } from "lucide-react";

export function RiskPill({ risk }) {
  const styles =
    {
      low: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      medium: "bg-amber-100 text-amber-800 border border-amber-300",
      high: "bg-red-100 text-red-800 border border-red-300",
    }[risk] || "bg-paper-100 text-ink-600 border border-paper-300";

  return <span className={clsx("pill font-medium", styles)}>{risk}</span>;
}
export function SeverityPill({ severity }) {
  return <RiskPill risk={severity} />;
}

export function StatusPill({ status }) {
  const map = {
    pending: {
      cls: "bg-paper-200 text-ink-800 border-paper-400",
      icon: Clock,
    },

    approved: {
      cls: "bg-violet-500/15 text-violet-700 border-violet-500/25",
      icon: CheckCircle2,
    },

    executed: {
      cls: "bg-accent-100 text-emerald-800 border-accent-300",
      icon: Zap,
    },

    succeeded: {
      cls: "bg-accent-100 text-emerald-800 border-accent-300",
      icon: CheckCircle2,
    },

    failed: {
      cls: "bg-red-500/15 text-red-700 border-red-500/25",
      icon: XCircle,
    },

    rejected: {
      cls: "bg-paper-200 text-ink-700 border-paper-400",
      icon: XCircle,
    },

    expired: {
      cls: "bg-paper-200 text-ink-600 border-paper-300",
      icon: AlertTriangle,
    },

    rolled_back: {
      cls: "bg-amber-500/15 text-amber-700 border-amber-500/25",
      icon: AlertTriangle,
    },

    dry_run: {
      cls: "bg-violet-500/15 text-violet-700 border-violet-500/25",
      icon: Zap,
    },

    initiated: {
      cls: "bg-paper-200 text-ink-800 border-paper-400",
      icon: Clock,
    },
  };
  const entry = map[status] || {
    cls: "bg-paper-100 text-ink-500 border-paper-300",
    icon: Clock,
  };
  const Icon = entry.icon;
  return (
    <span className={clsx("pill border", entry.cls)}>
      <Icon className="w-3 h-3" />
      {status?.replace("_", " ")}
    </span>
  );
}

export function ProviderBadge({ provider }) {
  const cls =
    provider === "aws"
      ? "bg-[#ff9900]/10 text-[#ffb84d] border-[#ff9900]/25"
      : provider === "azure"
        ? "bg-[#0078d4]/10 text-[#3da7e8] border-[#0078d4]/25"
        : "bg-paper-100 text-ink-500 border-paper-300";
  return (
    <span className={clsx("pill border font-mono", cls)}>
      {provider?.toUpperCase()}
    </span>
  );
}

export function MetricCard({ label, value, sub, accent = false, icon: Icon, children }) {
  return (
    <div
      className={clsx(
        "card p-5 relative overflow-visible card-hover",
        accent && "shadow-sm",
      )}
    >
      <div className="flex items-start justify-between">
        <div className={clsx("stat-label", "text-[var(--color-secondary-text)]")}>{label}</div>
        {Icon && <Icon className="w-4 h-4 text-[var(--color-secondary-text)]" />}
      </div>
      <div className="stat-num mt-2">{value}</div>
      {sub && <div className="text-xs text-[var(--color-secondary-text)] mt-1.5">{sub}</div>}
      {children && <div className="mt-3 relative z-10">{children}</div>}
      {accent && (
        <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-[#FF5A14]/10 blur-3xl rounded-full pointer-events-none" />
      )}
    </div>
  );
}

export function Section({ title, action, children, subtitle }) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink-900">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card p-12 flex flex-col items-center text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-paper-200 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-ink-400" />
        </div>
      )}
      <h3 className="text-ink-800 font-medium">{title}</h3>
      {description && (
        <p className="text-sm text-ink-400 mt-1 max-w-md">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ className }) {
  return (
    <div
      className={clsx(
        "animate-spin-slow w-4 h-4 border-2 border-[#FFB394] border-t-[#FF5A14] rounded-full",
        className,
      )}
    />
  );
}

export function LoadingBlock({ label = "Loading…" }) {
  return (
    <div className="card p-10 flex items-center justify-center gap-3 text-sm text-ink-400">
      <Spinner />
      {label}
    </div>
  );
}

// Currency-aware money formatter. `currency` is an ISO 4217 code (USD, INR, EUR…).
// Returns localized symbols ($, ₹, €) and compact suffixes (K, M, B).
export function fmtMoney(n, currency = "USD") {
  if (n == null || isNaN(n)) return "—";
  const v = Number(n);
  // Symbol via Intl
  const symbol = (() => {
    try {
      return (
        new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
          currencyDisplay: "narrowSymbol",
          maximumFractionDigits: 0,
        })
          .formatToParts(1)
          .find((p) => p.type === "currency")?.value || currency + " "
      );
    } catch {
      return currency + " ";
    }
  })();
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000)
    return `${symbol}${(v / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${symbol}${(v / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${symbol}${(v / 1_000).toFixed(1)}K`;
  return `${symbol}${v.toFixed(abs < 10 ? 2 : 0)}`;
}

// Back-compat — defaults to USD
export function fmtUSD(n) {
  return fmtMoney(n, "USD");
}

export function fmtNum(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString();
}

export function fmtPct(n, digits = 1) {
  if (n == null) return "—";
  return `${Number(n).toFixed(digits)}%`;
}

// ---------------------------------------------------------------------------
// SavingsSummary — side-by-side current vs projected spend + aggregated benefit
// All values are USD. `data` is the payload from GET /recommendations/summary/savings
// ---------------------------------------------------------------------------
export function SavingsSummary({ data, loading }) {
  if (loading) return <LoadingBlock label="Calculating savings…" />;
  if (!data) return null;

  const current = Number(data.current_monthly_spend_usd || 0);
  const projected = Number(data.projected_monthly_spend_usd || 0);
  const benefit = Number(data.total_aggregated_benefit_usd || 0);
  const realized = Number(data.realized_savings_to_date_usd || 0);
  const pct = Number(data.savings_pct_of_spend || 0);

  const max = Math.max(current, projected, 1);
  const curW = Math.round((current / max) * 100);
  const projW = Math.round((projected / max) * 100);

  return (
    <div className="card card-hover p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-display text-base font-semibold text-[var(--color-heading-text)]">
            Projected Savings (USD)
          </h3>
          <p className="text-xs text-[var(--color-secondary-text)] mt-0.5">
            If all {data.open_recommendation_count} open recommendations are applied
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-display font-semibold text-[#FF7A45] tabular-nums">
            {fmtUSD(benefit)}/mo
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-secondary-text)]">
            total aggregated benefit · {fmtPct(pct, 1)} of spend
          </div>
        </div>
      </div>

      {/* Side-by-side comparison bars */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--color-secondary-text)]">Current monthly spend</span>
            <span className="font-mono text-[var(--color-heading-text)]">{fmtUSD(current)}</span>
          </div>
          <div className="h-3 rounded-full bg-[var(--color-input-bg)] border border-[var(--color-light-border)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-placeholder)] rounded-full transition-all duration-300"
              style={{ width: `${curW}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--color-secondary-text)]">Projected spend post-optimization</span>
            <span className="font-mono text-[#FF7A45] font-semibold">{fmtUSD(projected)}</span>
          </div>
          <div className="h-3 rounded-full bg-[var(--color-input-bg)] border border-[var(--color-light-border)] overflow-hidden">
            <div
              className="h-full bg-[#FF5A14] rounded-full transition-all duration-300"
              style={{ width: `${projW}%` }}
            />
          </div>
        </div>
      </div>

      {/* Realized savings (audit trail) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-light-border)] px-4 py-3 hover:border-[#FF8A55] hover:bg-[#FF5A14]/10 transition-all duration-200 cursor-pointer shadow-sm">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-secondary-text)] font-medium">
            Realized to date
          </div>
          <div className="text-xl font-display font-semibold text-emerald-500 tabular-nums mt-0.5">
            {fmtUSD(realized)}
          </div>
        </div>
        <div className="rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-light-border)] px-4 py-3 hover:border-[#FF8A55] hover:bg-[#FF5A14]/10 transition-all duration-200 cursor-pointer shadow-sm">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-secondary-text)] font-medium">
            Already applied
          </div>
          <div className="text-xl font-display font-semibold text-[var(--color-heading-text)] tabular-nums mt-0.5">
            {fmtUSD(data.executed_savings_usd)}
          </div>
        </div>
      </div>
    </div>
  );
}
