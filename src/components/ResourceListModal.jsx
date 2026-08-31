import { X, Server, Database, Activity, Monitor } from "lucide-react";
import clsx from "clsx";

export default function ResourceListModal({ open, onClose, groupedResources }) {
  if (!open) return null;

  const getTypeIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("sql") || t.includes("db") || t.includes("database")) return Database;
    if (t.includes("databricks") || t.includes("cluster") || t.includes("workspace")) return Activity;
    if (t.includes("vm") || t.includes("ec2") || t.includes("compute")) return Monitor;
    return Server;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-card-bg)] border border-[var(--color-light-border)] rounded-xl2 shadow-pop w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[var(--color-light-border)] flex items-center justify-between bg-[var(--color-app-bg)]">
          <h3 className="font-display font-semibold text-[var(--color-heading-text)] text-base">
            Monitored Resources
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--color-secondary-text)] hover:text-[var(--color-primary-text)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">
          {Object.keys(groupedResources).length === 0 ? (
            <div className="text-center text-[var(--color-secondary-text)] text-sm py-10">
              No resources found.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedResources).map(([group, items]) => (
                <div key={group} className="space-y-3">
                  <div className="text-xs font-semibold text-[var(--color-secondary-text)] uppercase tracking-wider sticky top-0 bg-[var(--color-card-bg)]/90 backdrop-blur pb-1 border-b border-[var(--color-light-border)]">
                    {group}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item) => {
                      const Icon = getTypeIcon(item.type);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-light-border)] hover:border-[#FF5A14]/30 hover:bg-[#FF5A14]/5 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[var(--color-input-bg)] flex items-center justify-center text-[var(--color-secondary-text)] flex-shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[var(--color-primary-text)] truncate" title={item.name}>
                              {item.name}
                            </div>
                            <div className="text-[11px] text-[var(--color-secondary-text)] font-mono mt-0.5 truncate uppercase" title={item.type}>
                              {item.type || "Unknown Type"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--color-light-border)] flex justify-end bg-[var(--color-app-bg)]">
          <button
            onClick={onClose}
            className="btn-primary py-1.5 px-4 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
