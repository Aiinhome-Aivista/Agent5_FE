import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck, Sun, Moon, Sparkles } from "lucide-react";

import { endpoints } from "../api/client";
import { useAppStore } from "../store/store";

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // captcha states
  const [captchaId, setCaptchaId] = useState("");
  const [captchaChallenge, setCaptchaChallenge] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const [loading, setLoading] = useState(false);

  // fetch captcha on page load
  useEffect(() => {
    fetchCaptcha();
  }, []);

  // captcha api
  const fetchCaptcha = async () => {
    try {
      const res = await endpoints.getCaptcha();

      setCaptchaId(res.data.captcha_id);
      setCaptchaChallenge(res.data.challenge);
    } catch (err) {
      console.log(err);
      alert(err.userMessage || "Failed to load captcha");
    }
  };

  // login
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      const payload = {
        email,
        password,
        captcha_token: `${captchaId}:${captchaInput}`,
      };

      const res = await endpoints.login(payload);

      console.log("LOGIN SUCCESS :", res.data);

      // save token if api returns token
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      navigate("/dashboard");
    } catch (err) {
      console.log(err);

      alert(err.userMessage || "Login failed");

      // refresh captcha if login fails
      fetchCaptcha();
      setCaptchaInput("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200 bg-[var(--color-bg)] text-[var(--color-primary-text)] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-light-border)] bg-[var(--color-bg)]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
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
        </div>
      </header>

      {/* Main Login Form Container */}
      <div className="flex-1 px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-md card card-hover p-8 shadow-card">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[#FF5A14]/15 text-[#FF7A45] border border-[#FF8A55]/30 shadow-sm">
              <Lock className="h-6 w-6" />
            </div>

            <h1 className="mt-6 text-2xl font-semibold text-[var(--color-heading-text)] font-display">
              Sign in to Optimization Agent
            </h1>

            <p className="mt-2 text-sm text-[var(--color-secondary-text)]">
              Use your cloud or team credentials to access recommendations and
              telemetry.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* EMAIL */}
            <label className="block text-sm font-medium text-[var(--color-primary-text)]">
              <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-secondary-text)] mb-1">
                <Mail className="h-3.5 w-3.5 text-[#FF7A45]" />
                Email address
              </span>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
                className="input"
              />
            </label>

            {/* PASSWORD */}
            <label className="block text-sm font-medium text-[var(--color-primary-text)]">
              <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-secondary-text)] mb-1">
                <Lock className="h-3.5 w-3.5 text-[#FF7A45]" />
                Password
              </span>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="input"
              />
            </label>

            {/* CAPTCHA */}
            <div className="space-y-4 rounded-2xl border border-[var(--color-light-border)] bg-[var(--color-input-bg)] p-4">
              <div>
                <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-secondary-text)]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#FF7A45]" />
                  Captcha Verification
                </span>

                <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-[var(--color-light-border)] bg-[var(--color-card-bg)] px-4 py-3">
                  <span className="text-xl font-bold tracking-[0.4em] text-[#FF7A45] font-mono">
                    {captchaChallenge || "Loading..."}
                  </span>

                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="text-xs font-semibold text-[#FF7A45] hover:text-[#FF5A14] uppercase tracking-wider"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Enter captcha"
                required
                className="input"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-secondary-text)]">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="font-medium text-[#FF7A45] hover:text-[#FF5A14] transition-colors"
            >
              ← Back to landing page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
