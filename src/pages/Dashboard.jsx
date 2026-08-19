import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Server,
  Lightbulb,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { endpoints } from "../api/client";
import { useAppStore } from "../store/store";
import {
  MetricCard,
  Section,
  LoadingBlock,
  fmtMoney,
  fmtUSD,
  fmtNum,
  ProviderBadge,
  SeverityPill,
} from "../components/UI";

const PIE_COLORS = [
  "#FF5A14", // Primary Orange
  "#8B5CF6", // Vivid Violet
  "#10B981", // Emerald Green
  "#0EA5E9", // Sky Blue
  "#F59E0B", // Golden Amber
  "#EC4899", // Rose Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
];

function TooltipCard({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="card p-3 text-xs font-mono">
      <div className="text-[var(--color-secondary-text)] mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-[var(--color-primary-text)]">{p.name}:</span>
          <span className="text-[var(--color-heading-text)] font-medium">
            {formatter ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { provider, accountId, setCurrency } = useAppStore();
  const [overview, setOverview] = useState(null);
  const [costData, setCostData] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = {};
    if (provider !== "all") params.provider = provider;
    if (accountId) params.account_id = accountId;

    Promise.all([
      endpoints.dashboard().catch(() => ({ data: null })),
      endpoints
        .costSummary({ ...params, days: 30 })
        .catch(() => ({ data: null })),
      endpoints
        .anomalies({ ...params, limit: 5, status: "open" })
        .catch(() => ({ data: [] })),
    ])
      .then(([o, c, a]) => {
        if (!mounted) return;
        console.log("overview", o.data);
        setOverview(o.data);
        setCostData(c.data);
        setAnomalies(a.data || []);
        // Detect currency from backend and broadcast to the rest of the app
        const detected = c.data?.currency || o.data?.currency;
        if (detected) setCurrency(detected);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [provider, accountId, setCurrency]);

  if (loading) return <LoadingBlock label="Loading dashboard…" />;

  // Currency is forced to USD across the UI
  const currency = "USD";
  const fmt = (v) => fmtMoney(v, currency);

  const byDay = (costData?.by_day || []).map((d) => ({
    date: d.date?.slice(5) || d.usage_date?.slice(5),
    cost: Number(d.cost ?? d.cost_usd ?? d.total_cost_usd ?? 0),
  }));
  const byService = (costData?.by_service || []).slice(0, 6).map((s) => ({
    name: s.service || s.service_name,
    cost: Number(s.cost ?? s.cost_usd ?? s.total_cost_usd ?? 0),
  }));

  const current30d =
    overview?.total_spend_30d ??
    overview?.total_spend_30d_usd ??
    (byDay.length > 0
      ? byDay.reduce((sum, d) => sum + d.cost, 0)
      : (overview?.total_spend_7d ?? overview?.total_spend_7d_usd ?? 0));
  const potentialSavings =
    overview?.potential_monthly_savings ??
    overview?.potential_monthly_savings_usd ??
    0;
  const projected30d = Math.max(0, current30d - potentialSavings);

  const impactData = [
    { name: "Current", value: current30d, fill: "var(--color-light-border)" },
    { name: "Projected", value: projected30d, fill: "#FF7A45" },
  ];

  return (
    <div className="space-y-6">
      {/* Optimization Impact */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingDown className="w-5 h-5 text-[#FF5A14]" />
          <h3 className="text-lg font-display font-semibold text-[var(--color-heading-text)]">
            Optimization Impact
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-light-border)]">
            <div className="flex flex-col pt-4 sm:pt-0">
              <span className="text-sm text-[var(--color-secondary-text)] font-medium mb-1">
                Current Spend (30d)
              </span>
              <span className="text-3xl font-display font-semibold text-[var(--color-heading-text)]">
                {fmt(current30d)}
              </span>
            </div>
            <div className="flex flex-col pt-4 sm:pt-0 sm:pl-6">
              <span className="text-sm text-[var(--color-secondary-text)] font-medium mb-1">
                Projected Spend
              </span>
              <span className="text-3xl font-display font-semibold text-[#FF7A45]">
                {fmt(projected30d)}
              </span>
            </div>
            <div className="flex flex-col pt-4 sm:pt-0 sm:pl-6">
              <span className="text-sm text-[var(--color-secondary-text)] font-medium mb-1">
                Total Benefit
              </span>
              <span className="text-3xl font-display font-semibold text-emerald-500">
                {fmt(potentialSavings)}
                <span className="text-lg font-normal opacity-70 ml-1">/mo</span>
              </span>
            </div>
          </div>
          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-[var(--color-light-border)] pt-6 lg:pt-0 lg:pl-8">
            <ResponsiveContainer width="100%" height={100}>
              <BarChart
                data={impactData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={85}
                  tick={{ fill: "var(--color-secondary-text)", fontSize: 13, fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  content={<TooltipCard formatter={(v) => fmt(v)} />}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
                  {impactData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Spend (30d)"
          value={fmt(overview?.total_spend_7d ?? overview?.total_spend_7d_usd)}
          sub="Across selected scope"
          accent
          icon={DollarSign}
        />
        <MetricCard
          label="Potential savings/mo"
          value={fmt(
            overview?.potential_monthly_savings ??
              overview?.potential_monthly_savings_usd,
          )}
          sub="From pending recommendations"
          icon={TrendingDown}
        />
        <MetricCard
          label="Open anomalies"
          value={fmtNum(overview?.open_anomalies)}
          sub="Unresolved telemetry events"
          icon={AlertTriangle}
        />
        <MetricCard
          label="Pending recs"
          value={fmtNum(overview?.pending_recommendations)}
          sub="Awaiting approval"
          icon={Lightbulb}
        />
        <MetricCard
          label="Resources monitored"
          value={fmtNum(overview?.resources_monitored)}
          sub="EC2 · RDS · Azure VM · …"
          icon={Server}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily cost trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="stat-label text-ink-400">Daily cost trend</div>
              <div className="text-sm text-ink-700 mt-1">Last 30 days</div>
            </div>
            <div className="text-xs text-ink-400 font-mono">{currency}</div>
          </div>
          {byDay.length === 0 ? (
            <div className="text-center text-sm text-ink-400 py-12">
              No cost data yet — run a scan to ingest.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={byDay}
                margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
              >
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5A14" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#FF5A14" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => fmt(v)} width={70} />
                <Tooltip
                  content={<TooltipCard formatter={(v) => fmt(v)} />}
                  cursor={{
                    stroke: "#FF5A14",
                    strokeOpacity: 0.2,
                    strokeWidth: 1,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#FF5A14"
                  strokeWidth={2}
                  fill="url(#g1)"
                  name="Daily cost"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Cost by service */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="stat-label text-ink-400">Top services</div>
              <div className="text-sm text-ink-700 mt-1">By 30-day cost</div>
            </div>
          </div>
          {byService.length === 0 ? (
            <div className="text-center text-sm text-ink-400 py-12">
              No service data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byService}
                  dataKey="cost"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                  stroke="var(--color-card-bg)"
                  strokeWidth={2}
                >
                  {byService.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipCard formatter={(v) => fmt(v)} />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "var(--color-secondary-text)" }}
                  iconSize={8}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent anomalies */}
      <Section
        title="Recent anomalies"
        subtitle="Unresolved telemetry events detected by the Telemetry Agent"
      >
        {anomalies.length === 0 ? (
          <div className="card p-6 text-sm text-ink-400 text-center">
            No open anomalies. The system is healthy.
          </div>
        ) : (
          <div className="card divide-y divide-paper-300 overflow-hidden">
            {anomalies.map((a) => (
              <div
                key={a.id}
                className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-paper-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <SeverityPill severity={a.severity} />
                  <ProviderBadge provider={a.provider} />
                  <div className="min-w-0">
                    <div className="text-sm text-ink-800 truncate">
                      {a.description}
                    </div>
                    <div className="text-[11px] font-mono text-ink-400 truncate">
                      {a.resource_id} · {a.anomaly_type}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-ink-400 font-mono whitespace-nowrap">
                  {a.deviation_pct != null
                    ? `${Number(a.deviation_pct).toFixed(1)}% deviation`
                    : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
