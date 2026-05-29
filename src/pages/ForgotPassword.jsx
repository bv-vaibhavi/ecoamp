import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState(null); // null | "success" | "error"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res  = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus("success");
      setMessage(data.message);
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
        <h2 style={s.tagline}>No worries — we'll get you back in seconds.</h2>
        <p style={{ fontSize:14, color:"#4a5568", maxWidth:360, lineHeight:1.7 }}>
          Enter your registered email and we'll send you a secure link to reset your password. The link expires in 1 hour.
        </p>
        <div style={s.glow} />
      </div>

      {/* Right */}
      <div style={s.right} className="auth-right">
        <div style={s.card}>
          <Link to="/login" style={s.backLink}>
            <ArrowLeft size={15} /> Back to Sign In
          </Link>

          <div style={s.cardHeader}>
            <h1 style={s.title}>Forgot password?</h1>
            <p style={s.sub}>We'll send a reset link to your email.</p>
          </div>

          {status === "success" ? (
            <div style={s.successBox}>
              <CheckCircle size={20} color="#34d399" />
              <div>
                <div style={{ fontWeight:600, color:"#34d399", marginBottom:4 }}>Check your inbox!</div>
                <div style={{ fontSize:13, color:"#9ca3af" }}>{message}</div>
                <div style={{ fontSize:12, color:"#4a5568", marginTop:8 }}>
                  Didn't get it? Check spam or{" "}
                  <button style={s.retryBtn} onClick={() => { setStatus(null); setEmail(""); }}>
                    try again
                  </button>.
                </div>
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

              <div style={s.field}>
                <label style={s.label}>Email address</label>
                <div style={s.inputWrap}>
                  <Mail size={16} color="#4a5568" style={s.inputIcon} />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={s.input}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          )}

          <p style={s.switchText}>
            Remembered it?{" "}
            <Link to="/login" style={s.link}>Sign in</Link>
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
  tagline: { fontSize:30, fontWeight:700, color:"#f9fafb", lineHeight:1.3, maxWidth:420, marginBottom:20 },
  glow: { position:"absolute", bottom:-100, left:-100, width:400, height:400, background:"radial-gradient(circle,#34d39922 0%,transparent 70%)", pointerEvents:"none" },
  right: { flex:"0 0 480px", display:"flex", alignItems:"center", justifyContent:"center", padding:32 },
  card: { width:"100%", maxWidth:400, background:"#0d1321", border:"1px solid #1a2235", borderRadius:16, padding:"36px 36px 28px" },
  backLink: { display:"flex", alignItems:"center", gap:6, color:"#4a5568", fontSize:13, textDecoration:"none", marginBottom:24 },
  cardHeader: { marginBottom:24 },
  title: { fontSize:22, fontWeight:700, color:"#f9fafb", margin:0 },
  sub: { fontSize:13, color:"#4a5568", marginTop:6 },
  form: { display:"flex", flexDirection:"column", gap:20 },
  field: { display:"flex", flexDirection:"column", gap:8 },
  label: { fontSize:13, fontWeight:500, color:"#9ca3af" },
  inputWrap: { position:"relative", display:"flex", alignItems:"center" },
  inputIcon: { position:"absolute", left:12, pointerEvents:"none" },
  input: { width:"100%", background:"#111827", border:"1px solid #1a2235", borderRadius:8, padding:"11px 12px 11px 38px", color:"#f9fafb", fontSize:14, outline:"none", boxSizing:"border-box" },
  submitBtn: { background:"#34d399", color:"#0a0f1a", border:"none", borderRadius:8, padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer" },
  errorBox: { display:"flex", alignItems:"center", gap:8, background:"#2e1212", border:"1px solid #7f1d1d", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:13 },
  successBox: { display:"flex", alignItems:"flex-start", gap:12, background:"#0a2e1e", border:"1px solid #0d3d24", borderRadius:10, padding:"16px" },
  retryBtn: { background:"none", border:"none", color:"#34d399", cursor:"pointer", fontSize:12, padding:0, textDecoration:"underline" },
  switchText: { textAlign:"center", fontSize:13, color:"#4a5568", marginTop:20 },
  link: { color:"#34d399", textDecoration:"none", fontWeight:600 },
};
