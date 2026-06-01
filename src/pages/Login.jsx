import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck } from "lucide-react";

import { endpoints } from "../api/client"; // adjust path if needed

export default function Login() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-16 flex items-center justify-center">
      <div className="w-full max-w-md rounded-[2rem] border border-paper-300 bg-white p-8 shadow-card">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-accent-50 text-accent-700">
            <Lock className="h-6 w-6" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold text-ink-900">
            Sign in to Optimization Agent
          </h1>

          <p className="mt-2 text-sm text-ink-500">
            Use your cloud or team credentials to access recommendations and
            telemetry.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* EMAIL */}
          <label className="block text-sm font-medium text-ink-700">
            <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink-400">
              <Mail className="h-3.5 w-3.5" />
              Email address
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
              className="input mt-2"
            />
          </label>

          {/* PASSWORD */}
          <label className="block text-sm font-medium text-ink-700">
            <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink-400">
              <Lock className="h-3.5 w-3.5" />
              Password
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              className="input mt-2"
            />
          </label>

          {/* CAPTCHA */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Captcha Verification
              </span>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3">
                <span className="text-xl font-bold tracking-[0.4em] text-slate-800">
                  {captchaChallenge || "Loading..."}
                </span>

                <button
                  type="button"
                  onClick={fetchCaptcha}
                  className="text-sm font-medium text-accent-700 hover:text-accent-800"
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

        <div className="mt-6 text-center text-sm text-ink-500">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-medium text-accent-700 hover:text-accent-800"
          >
            Back to landing page
          </button>
        </div>
      </div>
    </div>
  );
}
