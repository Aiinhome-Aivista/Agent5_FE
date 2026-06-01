import { Download, FileText, Calendar } from "lucide-react";
import { endpoints } from "../api/client";
import { Section } from "../components/UI";

export default function Reports() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Section
        title="Weekly Report"
        subtitle="Auto-generated Word document with executive summary, anomalies, recommendations, and forecast"
      >
        <div className="card p-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold text-ink-900">
                Platform Optimization Weekly Report
              </h3>
              <p className="text-sm text-ink-500 mt-1 leading-relaxed">
                Comprehensive .docx covering the past week's cost, performance,
                and optimization activity. Includes top anomalies, pending
                recommendations with savings projections, executed actions with
                realized savings, and a forward-looking 30-day forecast.
              </p>
              <div className="flex items-center gap-2 mt-4 text-[11px] text-ink-400 font-mono">
                <Calendar className="w-3 h-3" />
                Generated on-demand · Format: .docx
              </div>
              <a
                href={endpoints.weeklyReportUrl()}
                className="btn-primary mt-5 inline-flex"
                download
              >
                <Download className="w-3.5 h-3.5" />
                Download report
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Report contents">
        <div className="card divide-y divide-paper-300">
          {[
            {
              title: "Executive Summary",
              desc: "Total spend, savings realized, savings pipeline, anomaly count",
            },
            {
              title: "Top Anomalies",
              desc: "Most impactful telemetry events with severity and deviation",
            },
            {
              title: "Pending Recommendations",
              desc: "Open optimizations with projected monthly savings",
            },
            {
              title: "Actions Executed",
              desc: "All executions in window with status and outcome",
            },
            {
              title: "Forward Forecast",
              desc: "30-day cost projection with optimization scenarios",
            },
          ].map((s) => (
            <div key={s.title} className="px-4 py-3 flex items-start gap-3">
              <div className="w-1 h-1 rounded-full bg-accent-400 mt-2.5" />
              <div>
                <div className="text-sm text-ink-800 font-medium">
                  {s.title}
                </div>
                <div className="text-xs text-ink-400 mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
