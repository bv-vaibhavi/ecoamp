import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Zap, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ResetPassword() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const [password, setPassword]   = useState("");
  const [confirm,  setConfirm]    = useState("");
  const [showP,    setShowP]      = useState(false);
  const [showC,    setShowC]      = useState(false);
  const [status,   setStatus]     = useState(null);
  const [message,  setMessage]    = useState("");
  const [loading,  setLoading]    = useState(false);

  const strength = password.length === 0 ? null
    : password.length < 6  ? "weak"
    : password.length < 10 ? "fair"
    : "strong";

  const strengthColor = { weak:"#f87171", fair:"#f59e0b", strong:"#34d399" };
  const strengthWidth = { weak:"33%", fair:"66%", strong:"100%" };

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm)
      return setStatus("error") || setMessage("Passwords don't match.");
    if (password.length < 6)
      return setStatus("error") || setMessage("Password must be at least 6 characters.");

    setLoading(true);
    setStatus(null);
    try {
      const res  = await fetch(`${API}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus("success");
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <style>{`@media(max-width:768px){.auth-left{display:none!important}.auth-right{flex:1!important;padding:32px 20px!important}}`}</style>

      {/* Left */}
      <div style={s.left} className="auth-left">
        <div style={s.brand}>
          <Zap size={32} color="#34d399" />
          <span style={s.brandText}>ECOAMP</span>
        </div>
        <h2 style={s.tagline}>Create a new password for your account.</h2>
        <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:14, marginTop:8 }}>
          {["At least 6 characters", "Mix of letters and numbers is stronger", "Don't reuse old passwords"].map(t => (
            <li key={t} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#34d399", flexShrink:0 }} />
              <span style={{ fontSize:14, color:"#9ca3af" }}>{t}</span>
            </li>
          ))}
        </ul>
        <div style={s.glow} />
      </div>

      {/* Right */}
      <div style={s.right} className="auth-right">
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h1 style={s.title}>Set new password</h1>
            <p style={s.sub}>Enter and confirm your new password below.</p>
          </div>

          {status === "success" ? (
            <div style={s.successBox}>
              <CheckCircle size={22} color="#34d399" />
              <div>
                <div style={{ fontWeight:600, color:"#34d399", marginBottom:4 }}>Password updated!</div>
                <div style={{ fontSize:13, color:"#9ca3af" }}>{message}</div>
                <div style={{ fontSize:12, color:"#4a5568", marginTop:6 }}>Redirecting to login in 3 seconds…</div>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} style={s.form}>
              {status === "error" && (
                <div style={s.errorBox}>
                  <AlertCircle size={15} />
                  <span>{message}</span>
                </div>
              )}

              {/* New password */}
              <div style={s.field}>
                <label style={s.label}>New password</label>
                <div style={s.inputWrap}>
                  <Lock size={16} color="#4a5568" style={s.inputIcon} />
                  <input
                    type={showP ? "text" : "password"} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    style={{ ...s.input, paddingRight:40 }}
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowP(p => !p)}>
                    {showP ? <EyeOff size={15} color="#4a5568" /> : <Eye size={15} color="#4a5568" />}
                  </button>
                </div>
                {/* Strength bar */}
                {strength && (
                  <div style={{ marginTop:6 }}>
                    <div style={{ height:4, background:"#1a2235", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:strengthWidth[strength], background:strengthColor[strength], borderRadius:99, transition:"all 0.3s" }} />
                    </div>
                    <div style={{ fontSize:11, color:strengthColor[strength], marginTop:4, textTransform:"capitalize" }}>
                      {strength} password
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div style={s.field}>
                <label style={s.label}>Confirm password</label>
                <div style={s.inputWrap}>
                  <Lock size={16} color="#4a5568" style={s.inputIcon} />
                  <input
                    type={showC ? "text" : "password"} required
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    style={{ ...s.input, paddingRight:40,
                      borderColor: confirm && confirm !== password ? "#f87171" : "1a2235" }}
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowC(p => !p)}>
                    {showC ? <EyeOff size={15} color="#4a5568" /> : <Eye size={15} color="#4a5568" />}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>Passwords don't match</div>
                )}
                {confirm && confirm === password && password.length >= 6 && (
                  <div style={{ fontSize:11, color:"#34d399", marginTop:4 }}>✓ Passwords match</div>
                )}
              </div>

              <button type="submit" disabled={loading}
                style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Updating…" : "Update Password"}
              </button>
            </form>
          )}

          <p style={s.switchText}>
            <Link to="/login" style={s.link}>Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display:"flex", minHeight:"100vh", background:"#0a0f1a", fontFamily:"'Inter','Segoe UI',sans-serif" },
  left: { flex:1, background:"linear-gradient(135deg,#0a2e1e 0%,#0a0f1a 60%)", display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 64px", position:"relative", overflow:"hidden" },
  brand: { display:"flex", alignItems:"center", gap:12, marginBottom:48 },
  brandText: { fontSize:28, fontWeight:800, color:"#f9fafb", letterSpacing:1 },
  tagline: { fontSize:30, fontWeight:700, color:"#f9fafb", lineHeight:1.3, maxWidth:420, marginBottom:24 },
  glow: { position:"absolute", bottom:-100, left:-100, width:400, height:400, background:"radial-gradient(circle,#34d39922 0%,transparent 70%)", pointerEvents:"none" },
  right: { flex:"0 0 480px", display:"flex", alignItems:"center", justifyContent:"center", padding:32 },
  card: { width:"100%", maxWidth:400, background:"#0d1321", border:"1px solid #1a2235", borderRadius:16, padding:"36px 36px 28px" },
  cardHeader: { marginBottom:24 },
  title: { fontSize:22, fontWeight:700, color:"#f9fafb", margin:0 },
  sub: { fontSize:13, color:"#4a5568", marginTop:6 },
  form: { display:"flex", flexDirection:"column", gap:20 },
  field: { display:"flex", flexDirection:"column", gap:8 },
  label: { fontSize:13, fontWeight:500, color:"#9ca3af" },
  inputWrap: { position:"relative", display:"flex", alignItems:"center" },
  inputIcon: { position:"absolute", left:12, pointerEvents:"none" },
  input: { width:"100%", background:"#111827", border:"1px solid #1a2235", borderRadius:8, padding:"11px 12px 11px 38px", color:"#f9fafb", fontSize:14, outline:"none", boxSizing:"border-box" },
  eyeBtn: { position:"absolute", right:10, background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center" },
  submitBtn: { background:"#34d399", color:"#0a0f1a", border:"none", borderRadius:8, padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer" },
  errorBox: { display:"flex", alignItems:"center", gap:8, background:"#2e1212", border:"1px solid #7f1d1d", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:13 },
  successBox: { display:"flex", alignItems:"flex-start", gap:12, background:"#0a2e1e", border:"1px solid #0d3d24", borderRadius:10, padding:"16px" },
  switchText: { textAlign:"center", fontSize:13, color:"#4a5568", marginTop:20 },
  link: { color:"#34d399", textDecoration:"none", fontWeight:600 },
};
