import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, Mail, Lock, User, Home, Eye, EyeOff, AlertCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", homeName: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      login(data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name",     label: "Full name",     type: "text",     icon: User,  placeholder: "Your full name",   autoComplete: "off" },
    { name: "email",    label: "Email address", type: "email",    icon: Mail,  placeholder: "you@example.com",  autoComplete: "email" },
    { name: "homeName", label: "Home / Location name", type: "text", icon: Home, placeholder: "My Home, Office…", autoComplete: "off" },
  ];

  return (
    <div style={s.page}>
      <style>{`@media(max-width:768px){.auth-left{display:none!important}.auth-right{flex:1!important;padding:32px 20px!important}}`}</style>
      <div style={s.left} className="auth-left">
        <div style={s.brand}>
          <Zap size={32} color="#34d399" />
          <span style={s.brandText}>ECOAMP</span>
        </div>
        <h2 style={s.tagline}>Start tracking. Start saving. Every unit counts.</h2>
        <ul style={s.featureList}>
          {["Add your appliances manually", "Track live consumption per device", "Get monthly cost estimates", "Expand to smart plugs later"].map(f => (
            <li key={f} style={s.featureItem}>
              <span style={s.dot} />
              <span style={{ fontSize: 14, color: "#9ca3af" }}>{f}</span>
            </li>
          ))}
        </ul>
        <div style={s.glow} />
      </div>

      <div style={s.right} className="auth-right">
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h1 style={s.title}>Create your account</h1>
            <p style={s.sub}>Free to use. No hardware needed to start.</p>
          </div>

          {error && (
            <div style={s.errorBox}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} style={s.form}>
            {fields.map(({ name, label, type, icon: Icon, placeholder }) => (
              <div key={name} style={s.field}>
                <label style={s.label}>{label}</label>
                <div style={s.inputWrap}>
                  <Icon size={16} color="#4a5568" style={s.inputIcon} />
                  <input
                    name={name} type={type} required
                    value={form[name]} onChange={handle}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    style={s.input}
                  />
                </div>
              </div>
            ))}

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={s.inputWrap}>
                <Lock size={16} color="#4a5568" style={s.inputIcon} />
                <input
                  name="password" type={showPass ? "text" : "password"} required
                  value={form.password} onChange={handle}
                  placeholder="Min. 6 characters"
                  style={{ ...s.input, paddingRight: 40 }}
                />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff size={15} color="#4a5568" /> : <Eye size={15} color="#4a5568" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p style={s.switchText}>
            Already have an account?{" "}
            <Link to="/login" style={s.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: "flex", minHeight: "100vh", background: "#0a0f1a", fontFamily: "'Inter','Segoe UI',sans-serif" },
  left: { flex: 1, background: "linear-gradient(135deg,#0a2e1e 0%,#0a0f1a 60%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px", position: "relative", overflow: "hidden" },
  brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 48 },
  brandText: { fontSize: 28, fontWeight: 800, color: "#f9fafb", letterSpacing: 1 },
  tagline: { fontSize: 32, fontWeight: 700, color: "#f9fafb", lineHeight: 1.3, maxWidth: 420, marginBottom: 40 },
  featureList: { listStyle: "none", display: "flex", flexDirection: "column", gap: 14 },
  featureItem: { display: "flex", alignItems: "center", gap: 12 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#34d399", flexShrink: 0 },
  glow: { position: "absolute", bottom: -100, left: -100, width: 400, height: 400, background: "radial-gradient(circle,#34d39922 0%,transparent 70%)", pointerEvents: "none" },
  right: { flex: "0 0 480px", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 },
  card: { width: "100%", maxWidth: 400, background: "#0d1321", border: "1px solid #1a2235", borderRadius: 16, padding: "40px 36px" },
  cardHeader: { marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 700, color: "#f9fafb", margin: 0 },
  sub: { fontSize: 13, color: "#4a5568", marginTop: 6 },
  errorBox: { display: "flex", alignItems: "center", gap: 8, background: "#2e1212", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 20 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
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
