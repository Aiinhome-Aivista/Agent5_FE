import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Lightbulb,
  PlayCircle,
  MessageSquare,
  FileText,
  BookOpen,
  Settings,
  Sparkles,
  Zap,
  LogOut,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import EnvironmentSelector from "./EnvironmentSelector";
import Toasts from "./Toasts";
import { endpoints } from "../api/client";
import { useAppStore } from "../store/store";
import { Spinner } from "./UI";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/telemetry", label: "Telemetry", icon: Activity },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/rulebook", label: "Rulebook", icon: BookOpen },
  { to: "/actions", label: "Actions", icon: PlayCircle },
  { to: "/chat", label: "RAG Chat", icon: MessageSquare },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

import ScanProgressModal from "./ScanProgressModal";

export default function Layout() {
  const { provider, pushToast } = useAppStore();
  const [scanning, setScanning] = useState(false);
  const [scanRunId, setScanRunId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const runScan = async () => {
    setScanning(true);
    setModalOpen(true);
    try {
      // Kick off ASYNC scan — returns immediately with a scan_run_id we poll
      const { data } = await endpoints.runScanAsync(provider || "all", false);
      setScanRunId(data.scan_run_id);
    } catch (e) {
      pushToast({
        type: "error",
        message: e.userMessage || "Scan failed to start",
      });
      setModalOpen(false);
    } finally {
      setScanning(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setScanRunId(null);
    // Hint to currently-loaded pages: refresh by reloading the current route
    window.dispatchEvent(new CustomEvent("scan:completed"));
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 h-full border-r border-[#5C5C5C] bg-[#4A4A4A] text-white flex flex-col">
        <div
          onClick={() => navigate("/")}
          className="px-5 py-5 border-b border-[#5C5C5C] cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#FF5A14] to-[#FF7A45] flex items-center justify-center shadow-sm flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-display font-semibold text-white text-sm tracking-tight leading-tight">
                Optimization
                <br />
                Agent
              </div>
            </div>
          </div>
          <div className="text-[10px] text-[#B0B0B0] mt-2.5 font-mono tracking-wider uppercase">
            FinOps · AIOps · v1.0
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group",
                  isActive
                    ? "bg-[#FF5A14] text-white font-medium shadow-sm"
                    : "text-[#D8D8D8] hover:text-white hover:bg-[#585858] border border-transparent",
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-[#5C5C5C]">
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#B0B0B0]">
                Six-Agent Pipeline
              </div>
              <div className="text-[10px] text-[#B0B0B0] mt-1 leading-relaxed">
                Telemetry → Analyzer → Action → Chat
              </div>
            </div>

            <button
              onClick={() => {
                // Clear auth/session data
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/");
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-[#D8D8D8] bg-[#FFFFFF] flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-medium text-[#666666]">
              Platform Performance & Cost Optimization
            </h1>
            <span className="pill bg-[#FFF7F2] text-[#FF5A14] border border-[#FF8A55]/40 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A14] animate-pulse-soft" />
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <EnvironmentSelector />
            <button
              onClick={runScan}
              disabled={scanning}
              className="btn-primary"
              title="Run telemetry + analyzer pipeline"
            >
              {scanning ? <Spinner /> : <Zap className="w-3.5 h-3.5" />}
              {scanning ? "Scanning…" : "Run scan"}
            </button>
          </div>
        </header>

        <main id="main-scroll" className="flex-1 min-w-0 overflow-y-auto p-6 animate-fade-up">
          <Outlet />
        </main>
      </div>
      <Toasts />
      <ScanProgressModal
        runId={scanRunId}
        open={modalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
