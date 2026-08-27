import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Cloud, ChevronDown, RefreshCcw } from "lucide-react";
import clsx from "clsx";
import { endpoints } from "../api/client";
import { useAppStore } from "../store/store";
import { ProviderBadge } from "./UI";

export default function EnvironmentSelector() {
  const { provider, accountId, setProvider, setAccountId, pushToast } =
    useAppStore();
  const [accounts, setAccounts] = useState([]);
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const load = async () => {
    try {
      const { data } = await endpoints.accounts();
      setAccounts(data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    load();
  }, []);

  const detect = async () => {
    setDetecting(true);
    try {
      const { data } = await endpoints.autoDetectAccounts();
      await load();
      pushToast({
        type: "success",
        message: `Detected ${data.accounts?.length || 0} account(s)`,
      });
    } catch (e) {
      pushToast({
        type: "error",
        message: e.userMessage || "Auto-detect failed",
      });
    } finally {
      setDetecting(false);
    }
  };

  const filtered =
    provider === "all"
      ? accounts
      : accounts.filter((a) => a.provider === provider);
  const selected = accounts.find((a) => a.account_identifier === accountId);
  const availableProviders = ["all", ...new Set(accounts.map((a) => a.provider))];

  return (
    <div className="flex items-center gap-2">
      {/* Provider switcher */}
      <div className="flex bg-paper-200 border border-paper-300 rounded-lg p-0.5">
        {availableProviders.map((p) => (
          <button
            key={p}
            onClick={() => setProvider(p)}
            className={clsx(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors uppercase tracking-wider",
              provider === p
                ? "bg-accent-600 text-white"
                : "text-ink-500 hover:text-ink-800",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Account dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-paper-200 border border-paper-300 rounded-lg px-2.5 py-1.5 text-sm hover:border-paper-300 transition-colors min-w-[10rem]"
          title="Select account"
        >
          <Cloud className="w-3.5 h-3.5 text-ink-400" />
          <span className="text-ink-700">
            {selected ? selected.display_name : "All accounts"}
          </span>
          <ChevronDown className="w-3 h-3 text-ink-400" />
        </button>

        {open &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setOpen(false)}
              />
              <div className="fixed right-5 top-14 w-72 z-[9999] card animate-fade-up">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setAccountId(null);
                      setOpen(false);
                    }}
                    className={clsx(
                      "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-paper-200 flex items-center justify-between",
                      !accountId && "bg-paper-100",
                    )}
                  >
                    <span className="text-ink-800">All accounts</span>
                    <span className="text-xs text-ink-400">
                      {accounts.length}
                    </span>
                  </button>
                  <div className="my-1 border-t border-paper-300" />
                  {filtered.length === 0 && (
                    <div className="px-3 py-4 text-xs text-ink-400 text-center">
                      No accounts registered
                    </div>
                  )}
                  {filtered.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        setAccountId(acc.account_identifier);
                        setOpen(false);
                      }}
                      className={clsx(
                        "w-full text-left px-3 py-2 rounded-md hover:bg-paper-200 flex items-center justify-between gap-2",
                        accountId === acc.account_identifier && "bg-paper-100",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="text-sm text-ink-800 truncate">
                          {acc.display_name}
                        </div>
                        <div className="text-[10px] font-mono text-ink-400 truncate">
                          {acc.account_identifier}
                        </div>
                      </div>
                      <ProviderBadge provider={acc.provider} />
                    </button>
                  ))}
                  <div className="my-1 border-t border-paper-300" />
                  <button
                    onClick={detect}
                    disabled={detecting}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-paper-200 flex items-center gap-2 text-accent-600 disabled:text-ink-400"
                  >
                    <RefreshCcw
                      className={clsx(
                        "w-3.5 h-3.5",
                        detecting && "animate-spin",
                      )}
                    />
                    {detecting ? "Detecting…" : "Auto-detect from credentials"}
                  </button>
                </div>
              </div>
            </>,
            document.body,
          )}
      </div>
    </div>
  );
}
