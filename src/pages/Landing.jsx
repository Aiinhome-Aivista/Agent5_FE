import { useNavigate } from "react-router-dom";
import {
  Activity,
  Lightbulb,
  PlayCircle,
  Sparkles,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Section } from "../components/UI";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-ink-900">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-2 text-sm font-medium text-accent-700 shadow-sm">
              Platform optimization agent for FinOps teams
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-display font-semibold tracking-tight text-ink-900 sm:text-5xl">
                Optimize cloud cost, performance, and reliability from a single
                agent.
              </h1>
              <p className="max-w-2xl text-base text-ink-600 sm:text-lg">
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
                className="inline-flex items-center justify-center rounded-lg border border-paper-300 bg-white px-6 py-3 text-sm font-semibold text-ink-700 hover:bg-paper-100"
              >
                Explore demo
              </a>
            </div>
          </div>

          {/* <div className="rounded-[2rem] border border-paper-300 bg-white/90 p-8 shadow-card">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center text-sm text-ink-500">
                <div>
                  <div className="text-3xl font-semibold text-ink-900">
                    100%
                  </div>
                  <div className="mt-1">Cloud coverage</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-ink-900">4</div>
                  <div className="mt-1">Agent stages</div>
                </div>
              </div>
              <div className="rounded-3xl border border-paper-200 bg-paper-50 p-5">
                <div className="text-sm uppercase tracking-widest text-ink-400">
                  Live pipeline
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-ink-900">
                      Telemetry
                    </div>
                    <div className="text-xs text-ink-500 mt-1">
                      Metric ingestion, anomaly detection, and context capture.
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-ink-900">
                      Recommendations
                    </div>
                    <div className="text-xs text-ink-500 mt-1">
                      Actionable opportunities prioritized by savings and risk.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        <div className="mt-20 space-y-10" id="scope">
          <Section title="Project overview">
            <div className="grid gap-4 lg:grid-cols-3">
              {FEATURES.map(({ title, description, icon: Icon }) => (
                <div key={title} className="card p-6 border-paper-300">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-ink-900">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm text-ink-600">{description}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Project scope">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card p-6 border-paper-300">
                <h2 className="text-lg font-semibold text-ink-900">
                  What this agent manages
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-ink-600">
                  <li>Telemetry collection from cloud providers</li>
                  <li>Anomaly detection and idle resource discovery</li>
                  <li>Cost-saving recommendations and risk scoring</li>
                  <li>Action execution and rollback workflows</li>
                  <li>AI-powered chat for operational context</li>
                </ul>
              </div>
              <div className="card p-6 border-paper-300">
                <h2 className="text-lg font-semibold text-ink-900">
                  Who benefits
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-ink-600">
                  <li>FinOps leaders evaluating cloud spend</li>
                  <li>Platform engineers monitoring performance</li>
                  <li>Cloud architects designing cost-aware infrastructure</li>
                  <li>DevOps teams coordinating rollout and rollback</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="How this agent works">
            <div className="grid gap-4 lg:grid-cols-4">
              {STEPS.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-paper-300 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-ink-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-600">{description}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
