import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err.message ||
      "Request failed";
    err.userMessage = msg;
    return Promise.reject(err);
  },
);

// ---------- Endpoints ----------
export const endpoints = {
  // ================= AUTH =================
  getCaptcha: () => api.get("/auth/captcha"),

  login: (data) => api.post("/auth/login", data),
  // dashboard / telemetry
  dashboard: () => api.get("/telemetry/dashboard/overview"),
  telemetry: (params) => api.get("/telemetry/snapshots", { params }),
  costSummary: (params) => api.get("/telemetry/cost/summary", { params }),
  cost: (params) => api.get("/telemetry/cost", { params }),
  anomalies: (params) => api.get("/telemetry/anomalies", { params }),

  // recommendations
  recommendations: (params) => api.get("/recommendations", { params }),
  recommendation: (id) => api.get(`/recommendations/${id}`),
  savingsSummary: (params) =>
    api.get("/recommendations/summary/savings", { params }),
  decideRecommendation: (id, decision, actor) =>
    api.post(`/recommendations/${id}/decision`, {
      decision,
      user_email: actor,
    }),
  executeRecommendation: (id, actor, dry_run = false) =>
    api.post(`/recommendations/${id}/execute`, null, {
      params: { actor, force_dry_run: dry_run },
    }),

  // rules (dynamic rulebook)
  rules: (params) => api.get("/rules", { params }),
  createRule: (data) => api.post("/rules", data),
  updateRule: (id, data) => api.patch(`/rules/${id}`, data),
  approveRule: (id, approved_by = "ui-user") =>
    api.post(`/rules/${id}/approve`, null, { params: { approved_by } }),
  deleteRule: (id) => api.delete(`/rules/${id}`),

  // actions
  actions: (params) => api.get("/actions", { params }),
  action: (id) => api.get(`/actions/${id}`),
  rollback: (id, actor) =>
    api.post(`/actions/${id}/rollback`, null, { params: { actor } }),

  // scan
  runScan: (provider = "all", dry_run = false) =>
    api.post("/scan/run", { provider: provider || "all", dry_run }),
  runScanAsync: (provider = "all", dry_run = false) =>
    api.post("/scan/run-async", { provider: provider || "all", dry_run }),
  scanStatus: () => api.get("/scan/status"),

  // chat
  chat: (payload) => api.post("/chat", payload),
  chatSessions: () => api.get("/chat/sessions"),
  chatSession: (uuid) => api.get(`/chat/sessions/${uuid}/messages`),
  deleteChatSession: (uuid) => api.delete(`/chat/sessions/${uuid}`),

  // reports
  weeklyReportUrl: () => "/api/reports/weekly",

  // runbooks
  uploadRunbook: (formData) =>
    api.post("/upload/document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // admin
  health: () => api.get("/admin/health"),
  seedPlaybooks: (force = false) =>
    api.post("/admin/seed-playbooks", null, { params: { force } }),
  vectorCounts: () => api.get("/admin/vector-counts"),
  settings: () => api.get("/admin/settings"),

  // accounts (credentials managed via UI)
  accounts: () => api.get("/accounts"),
  getAccount: (id) => api.get(`/accounts/${id}`),
  testCredentials: (payload) => api.post("/accounts/test", payload),
  createAccount: (data) => api.post("/accounts", data),
  updateAccount: (id, data) => api.patch(`/accounts/${id}`, data),
  testSavedAccount: (id) => api.post(`/accounts/${id}/test`),
  deleteAccount: (id) => api.delete(`/accounts/${id}`),
  toggleAccount: (id) => api.patch(`/accounts/${id}/toggle`),
};

export default api;
