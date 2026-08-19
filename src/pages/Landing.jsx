import { useNavigate } from "react-router-dom";
import {
  Activity,
  Lightbulb,
  Sparkles,
  MessageSquare,
  Zap,
  Sun,
  Moon,
} from "lucide-react";
import { Section } from "../components/UI";
import { useAppStore } from "../store/store";

const FEATURES = [
  {
    title: "Telemetry-driven visibility",
    description:
      "Collect cloud metrics, identify idle resources, and surface anomalous spend across AWS and Azure.",
    icon: Activity,
  },
  {
    title: "Automated recommendations",
    description:
      "Analyze usage patterns and generate concrete optimization actions ready for review and execution.",
    icon: Lightbulb,
  },
  {
    title: "Execution-ready actions",
    description:
      "Approve, execute, or roll back infrastructure changes with a single click.",
    icon: Zap,
  },
];

const STEPS = [
  {
    title: "Scan cloud telemetry",
    description:
      "Ingest metrics and anomaly data from your connected accounts.",
    icon: Sparkles,
  },
  {
    title: "Analyze cost and usage",
    description:
      "Detect inefficient resources and estimate savings from targeted actions.",
    icon: Activity,
  },
  {
    title: "Recommend optimizations",
    description:
      "Prioritize the highest value opportunities across compute, storage, and services.",
    icon: Lightbulb,
  },
  {
    title: "Execute or collaborate",
    description:
      "Approve recommendations, run rollbacks, or ask the agent for context in chat.",
    icon: MessageSquare,
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppStore();

  return (
    <div className="min-h-screen transition-colors duration-200 bg-[var(--color-bg)] text-[var(--color-primary-text)]">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-light-border)] bg-[var(--color-bg)]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5A14] to-[#FF7A45] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-base text-[var(--color-heading-text)] tracking-tight block leading-none">
                Platform Agent
              </span>
              <span className="text-[10px] font-mono text-[var(--color-secondary-text)] uppercase tracking-wider">
                FinOps & Optimization
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[var(--color-light-border)] text-[var(--color-primary-text)] hover:bg-[var(--color-input-bg)] hover:border-[#FF8A55] transition-colors"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[#FF7A45]" />
              ) : (
                <Moon className="w-4 h-4 text-[#4A4A4A]" />
              )}
            </button>

            <button
              onClick={() => navigate("/login")}
              className="btn-primary text-xs px-4 py-2"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FF5A14]/15 border border-[#FF8A55]/30 px-4 py-1.5 text-xs font-semibold text-[#FF7A45] shadow-sm">
              Platform optimization agent for FinOps teams
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-display font-semibold tracking-tight text-[var(--color-heading-text)] sm:text-5xl">
                Optimize cloud cost, performance, and reliability from a single
                agent.
              </h1>
              <p className="max-w-2xl text-base text-[var(--color-secondary-text)] sm:text-lg">
                This agent combines telemetry, anomaly detection, recommendation
                orchestration, and execution workflows to help engineering and
                finance teams reduce waste and keep cloud infrastructure lean.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/login")}
                className="btn-primary inline-flex items-center justify-center px-6 py-3 text-sm font-semibold"
              >
                Sign in
              </button>
              <a
                href="#scope"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--color-light-border)] bg-[var(--color-card-bg)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-text)] hover:border-[#FF8A55] hover:text-[#FF5A14] hover:bg-[var(--color-input-bg)] transition-all duration-200 shadow-sm"
              >
                Explore demo
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 space-y-12" id="scope">
          <Section title="Project overview">
            <div className="grid gap-6 lg:grid-cols-3">
              {FEATURES.map(({ title, description, icon: Icon }) => (
                <div key={title} className="card card-hover p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF5A14]/15 text-[#FF7A45] border border-[#FF8A55]/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-[var(--color-heading-text)]">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--color-secondary-text)] leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Project scope">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card card-hover p-6">
                <h2 className="text-lg font-semibold text-[var(--color-heading-text)]">
                  What this agent manages
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-[var(--color-secondary-text)]">
                  <li className="flex items-center gap-2"><span className="text-[#FF5A14]">▸</span> Telemetry collection from cloud providers</li>
                  <li className="flex items-center gap-2"><span className="text-[#FF5A14]">▸</span> Anomaly detection and idle resource discovery</li>
                  <li className="flex items-center gap-2"><span className="text-[#FF5A14]">▸</span> Cost-saving recommendations and risk scoring</li>
                  <li className="flex items-center gap-2"><span className="text-[#FF5A14]">▸</span> Action execution and rollback workflows</li>
                  <li className="flex items-center gap-2"><span className="text-[#FF5A14]">▸</span> AI-powered chat for operational context</li>
                </ul>
              </div>
              <div className="card card-hover p-6">
                <h2 className="text-lg font-semibold text-[var(--color-heading-text)]">
                  Who benefits
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-[var(--color-secondary-text)]">
                  <li className="flex items-center gap-2"><span className="text-[#FF5A14]">▸</span> FinOps leaders evaluating cloud spend</li>
                  <li className="flex items-center gap-2"><span className="text-[#FF5A14]">▸</span> Platform engineers monitoring performance</li>
                  <li className="flex items-center gap-2"><span className="text-[#FF5A14]">▸</span> Cloud architects designing cost-aware infrastructure</li>
                  <li className="flex items-center gap-2"><span className="text-[#FF5A14]">▸</span> DevOps teams coordinating rollout and rollback</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="How this agent works">
            <div className="grid gap-6 lg:grid-cols-4">
              {STEPS.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="card card-hover p-6 rounded-2xl"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-input-bg)] text-[#FF7A45] border border-[var(--color-light-border)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-heading-text)]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-secondary-text)] leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
