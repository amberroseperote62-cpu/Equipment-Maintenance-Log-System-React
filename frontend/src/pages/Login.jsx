import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import api, { errMsg } from "../api";

export default function Login() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!f.email || (mode !== "forgot" && f.password.length < 8))
      return setMsg({ err: "Enter an email and a password of at least 8 characters." });
    setBusy(true);
    try {
      if (mode === "login") await login(f);
      else if (mode === "register") await register(f);
      else
        setMsg({
          ok: (await api.post("/forgot-password", { email: f.email })).data.message,
        });
    } catch (er) {
      setMsg({ err: errMsg(er) });
    } finally {
      setBusy(false);
    }
  };

  const titles = { login: "Welcome back", register: "Create account", forgot: "Reset password" };
  const subtitles = {
    login: "Sign in to your maintenance system",
    register: "Register as a room in-charge",
    forgot: "We'll send a reset link to your email",
  };

  return (
    <div className="auth-page">
      <form className="auth" onSubmit={submit}>
        <div className="auth-header">
          <div className="auth-logo">🔧</div>
          <h2>{titles[mode]}</h2>
          <p>{subtitles[mode]}</p>
        </div>

        {mode === "register" && (
          <input
            placeholder="Full name"
            value={f.name}
            onChange={set("name")}
            required
            autoComplete="name"
          />
        )}
        <input
          type="email"
          placeholder="Email address"
          value={f.email}
          onChange={set("email")}
          required
          autoComplete="email"
        />
        {mode !== "forgot" && (
          <input
            type="password"
            placeholder="Password (min. 8 characters)"
            value={f.password}
            onChange={set("password")}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        )}
        {mode === "register" && (
          <input
            type="password"
            placeholder="Confirm password"
            value={f.password_confirmation}
            onChange={set("password_confirmation")}
            autoComplete="new-password"
          />
        )}

        {msg?.err && <div className="err">⚠ {msg.err}</div>}
        {msg?.ok && <div className="ok">✓ {msg.ok}</div>}

        <button disabled={busy} style={{ marginTop: 4 }}>
          {busy ? (
            <>
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Please wait…
            </>
          ) : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
        </button>

        <div className="links">
          <a href="#" onClick={(e) => { e.preventDefault(); setMode("login"); setMsg(null); }}>
            Sign in
          </a>
          <span style={{ color: "var(--border2)" }}>·</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setMode("register"); setMsg(null); }}>
            Register
          </a>
          <span style={{ color: "var(--border2)" }}>·</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setMode("forgot"); setMsg(null); }}>
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  );
}
