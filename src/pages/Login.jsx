import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      login(data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <style>{`@media(max-width:768px){.auth-left{display:none!important}.auth-right{flex:1!important;padding:32px 20px!important}}`}</style>
      {/* Left panel */}
      <div style={s.left} className="auth-left">
        <div style={s.brand}>
          <Zap size={32} color="#34d399" />
          <span style={s.brandText}>ECOAMP</span>
        </div>
        <h2 style={s.tagline}>Know what's consuming your electricity — down to every appliance.</h2>
        <div style={s.statsRow}>
          {[["8+", "Appliances tracked"], ["Real-time", "Usage monitoring"], ["₹ Saved", "Every month"]].map(([v, l]) => (
            <div key={l} style={s.statChip}>
              <span style={s.statVal}>{v}</span>
              <span style={s.statLbl}>{l}</span>
            </div>
          ))}
        </div>
        {/* decorative glow */}
        <div style={s.glow} />
      </div>

      {/* Right panel - form */}
      <div style={s.right} className="auth-right">
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h1 style={s.title}>Welcome back</h1>
            <p style={s.sub}>Sign in to your ECOAMP account</p>
          </div>

          {error && (
            <div style={s.errorBox}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <div style={s.inputWrap}>
                <Mail size={16} color="#4a5568" style={s.inputIcon} />
                <input
                  name="email" type="email" required
                  value={form.email} onChange={handle}
                  placeholder="you@example.com"
                  style={s.input}
                />
              </div>
            </div>

            <div style={s.field}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <label style={s.label}>Password</label>
                <Link to="/forgot-password" style={{ fontSize:12, color:"#34d399", textDecoration:"none" }}>
                  Forgot password?
                </Link>
              </div>
              <div style={s.inputWrap}>
                <Lock size={16} color="#4a5568" style={s.inputIcon} />
                <input
                  name="password" type={showPass ? "text" : "password"} required
                  value={form.password} onChange={handle}
                  placeholder="••••••••"
                  style={{ ...s.input, paddingRight: 40 }}
                />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff size={15} color="#4a5568" /> : <Eye size={15} color="#4a5568" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p style={s.switchText}>
            Don't have an account?{" "}
            <Link to="/signup" style={s.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: "flex", minHeight: "100vh", background: "#0a0f1a", fontFamily: "'Inter','Segoe UI',sans-serif" },
  left: { flex: 1, background: "linear-gradient(135deg,#0a2e1e 0%,#0a0f1a 60%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px", position: "relative", overflow: "hidden", minWidth: 0 },
  brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 48 },
  brandText: { fontSize: 28, fontWeight: 800, color: "#f9fafb", letterSpacing: 1 },
  tagline: { fontSize: 32, fontWeight: 700, color: "#f9fafb", lineHeight: 1.3, maxWidth: 420, marginBottom: 48 },
  statsRow: { display: "flex", gap: 24 },
  statChip: { display: "flex", flexDirection: "column", gap: 4 },
  statVal: { fontSize: 22, fontWeight: 700, color: "#34d399" },
  statLbl: { fontSize: 12, color: "#4a5568" },
  glow: { position: "absolute", bottom: -100, left: -100, width: 400, height: 400, background: "radial-gradient(circle,#34d39922 0%,transparent 70%)", pointerEvents: "none" },
  right: { flex: "0 0 480px", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 },
  card: { width: "100%", maxWidth: 400, background: "#0d1321", border: "1px solid #1a2235", borderRadius: 16, padding: "40px 36px" },
  cardHeader: { marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 700, color: "#f9fafb", margin: 0 },
  sub: { fontSize: 13, color: "#4a5568", marginTop: 6 },
  errorBox: { display: "flex", alignItems: "center", gap: 8, background: "#2e1212", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 20 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 500, color: "#9ca3af" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: 12, pointerEvents: "none" },
  input: { width: "100%", background: "#111827", border: "1px solid #1a2235", borderRadius: 8, padding: "11px 12px 11px 38px", color: "#f9fafb", fontSize: 14, outline: "none", boxSizing: "border-box" },
  eyeBtn: { position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" },
  submitBtn: { background: "#34d399", color: "#0a0f1a", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 },
  switchText: { textAlign: "center", fontSize: 13, color: "#4a5568", marginTop: 24 },
  link: { color: "#34d399", textDecoration: "none", fontWeight: 600 },
};
