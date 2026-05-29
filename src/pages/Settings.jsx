import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Home, Zap, Bell, Shield, Save, Check, AlertCircle, MapPin } from "lucide-react";
import {
  STATE_OPTIONS, getUtilityOptions, getCategoryOptions,
  getEffectiveRate, TARIFFS
} from "../data/tariffs";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Settings() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name:           "",
    email:          "",
    homeName:       "",
    unitRate:       "7.38",
    currency:       "INR",
    dailyBudget:    "100",
    notifications:  true,
    highUsageAlert: true,
    stateCode:      "AP",
    utilityCode:    "APSPDCL",
    categoryCode:   "domestic",
  });
  const [status,  setStatus]  = useState(null); // null | "saving" | "saved" | "error"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load current profile from DB on mount
  useEffect(() => {
    fetch(`${API}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setForm(f => ({
          ...f,
          name:        data.name        || "",
          email:       data.email       || "",
          homeName:    data.homeName    || "",
          unitRate:     String(data.unitRate    ?? 7.38),
          currency:     data.currency    || "INR",
          dailyBudget:  String(data.dailyBudget ?? 100),
          stateCode:    data.stateCode    || "AP",
          utilityCode:  data.utilityCode  || "APSPDCL",
          categoryCode: data.categoryCode || "domestic",
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handle = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const save = async (e) => {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch(`${API}/api/user/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name:         form.name,
          homeName:     form.homeName,
          unitRate:     Number(form.unitRate),
          currency:     form.currency,
          dailyBudget:  Number(form.dailyBudget),
          stateCode:    form.stateCode,
          utilityCode:  form.utilityCode,
          categoryCode: form.categoryCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus("saved");
      setTimeout(() => setStatus(null), 2500);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Failed to save. Try again.");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  if (loading) return (
    <div style={{ padding:40, color:"#4a5568", fontSize:14 }}>Loading settings…</div>
  );

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Settings</h1>
          <p style={s.sub}>Manage your profile, home, and preferences</p>
        </div>
      </header>

      {status === "error" && (
        <div style={s.errorBox}>
          <AlertCircle size={15} />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={save} style={s.sections}>

        {/* Profile */}
        <Section icon={User} label="Profile">
          <Row label="Full Name">
            <input name="name" value={form.name} onChange={handle} style={s.input} placeholder="Your name" />
          </Row>
          <Row label="Email">
            <input name="email" value={form.email} style={{ ...s.input, opacity:0.5 }} disabled
              title="Email cannot be changed" />
            <span style={s.hint}>Email address cannot be changed.</span>
          </Row>
        </Section>

        {/* Home */}
        <Section icon={Home} label="Home / Location">
          <Row label="Home Name">
            <input name="homeName" value={form.homeName} onChange={handle}
              style={s.input} placeholder="My Home, Office…" />
          </Row>
        </Section>

        {/* Tariff */}
        <Section icon={MapPin} label="Electricity Tariff">
          <Row label="State">
            <select name="stateCode" value={form.stateCode}
              onChange={e => {
                const sc = e.target.value;
                const utils = getUtilityOptions(sc);
                const uc = utils[0]?.code || "";
                const cats = getCategoryOptions(sc, uc);
                const cc = cats[0]?.code || "";
                const rate = getEffectiveRate(sc, uc, cc, 200);
                setForm(f => ({ ...f, stateCode: sc, utilityCode: uc, categoryCode: cc, unitRate: String(rate) }));
              }} style={s.input}>
              {STATE_OPTIONS.map(st => <option key={st.code} value={st.code}>{st.name}</option>)}
            </select>
          </Row>
          <Row label="Utility / DISCOM">
            <select name="utilityCode" value={form.utilityCode}
              onChange={e => {
                const uc = e.target.value;
                const cats = getCategoryOptions(form.stateCode, uc);
                const cc = cats[0]?.code || "";
                const rate = getEffectiveRate(form.stateCode, uc, cc, 200);
                setForm(f => ({ ...f, utilityCode: uc, categoryCode: cc, unitRate: String(rate) }));
              }} style={s.input}>
              {getUtilityOptions(form.stateCode).map(u => <option key={u.code} value={u.code}>{u.name}</option>)}
            </select>
          </Row>
          <Row label="Connection Type">
            <select name="categoryCode" value={form.categoryCode}
              onChange={e => {
                const cc = e.target.value;
                const rate = getEffectiveRate(form.stateCode, form.utilityCode, cc, 200);
                setForm(f => ({ ...f, categoryCode: cc, unitRate: String(rate) }));
              }} style={s.input}>
              {getCategoryOptions(form.stateCode, form.utilityCode).map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <span style={s.hint}>
              Selecting your tariff auto-fills the correct rate below.
            </span>
          </Row>
          {/* Rate preview */}
          <Row label="Calculated Rate">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ fontSize:22, fontWeight:700, color:"#34d399" }}>
                ₹{form.unitRate}<span style={{ fontSize:12, color:"#6b7280", fontWeight:400 }}>/kWh</span>
              </div>
              <div style={{ fontSize:11, color:"#4a5568" }}>
                auto-calculated from your tariff selection
              </div>
            </div>
          </Row>
        </Section>

        {/* Electricity */}
        <Section icon={Zap} label="Electricity Settings">
          <Row label="Rate per Unit (₹/kWh)">
            <input name="unitRate" type="number" min="1" step="0.01"
              value={form.unitRate} onChange={handle}
              style={{ ...s.input, maxWidth:120 }} />
            <span style={s.hint}>
              Check your electricity bill. Your AP bill shows ₹7.38/unit effective rate.
            </span>
          </Row>
          <Row label="Currency">
            <select name="currency" value={form.currency} onChange={handle}
              style={{ ...s.input, maxWidth:120 }}>
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </Row>
          <Row label="Daily Budget (₹)">
            <input name="dailyBudget" type="number" min="0"
              value={form.dailyBudget} onChange={handle}
              style={{ ...s.input, maxWidth:120 }} />
            <span style={s.hint}>
              You'll get a notification when usage hits 80% of this.
            </span>
          </Row>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} label="Notifications">
          <Row label="Enable Notifications">
            <Toggle name="notifications" checked={form.notifications} onChange={handle} />
          </Row>
          <Row label="High Usage Alert">
            <Toggle name="highUsageAlert" checked={form.highUsageAlert} onChange={handle} />
            <span style={s.hint}>Alert when daily usage exceeds your budget.</span>
          </Row>
        </Section>

        {/* Security */}
        <Section icon={Shield} label="Account & Security">
          <Row label="Change Password">
            <button type="button" style={s.outlineBtn}
              onClick={() => window.location.href = "/forgot-password"}>
              Send Reset Email
            </button>
          </Row>
        </Section>

        <div style={s.footer}>
          <button type="submit" disabled={status === "saving"}
            style={{ ...s.saveBtn, opacity: status === "saving" ? 0.7 : 1 }}>
            {status === "saved"
              ? <><Check size={15} /> Saved!</>
              : status === "saving"
              ? "Saving…"
              : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ icon: Icon, label, children }) {
  return (
    <div style={sec.wrap}>
      <div style={sec.header}>
        <Icon size={16} color="#34d399" />
        <span style={sec.label}>{label}</span>
      </div>
      <div style={sec.body}>{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={r.row}>
      <span style={r.label}>{label}</span>
      <div style={r.right}>{children}</div>
    </div>
  );
}

function Toggle({ name, checked, onChange }) {
  return (
    <button type="button"
      style={{ ...t.pill, background: checked ? "#34d399" : "#1a2235" }}
      onClick={() => onChange({ target: { name, type:"checkbox", checked: !checked } })}
    >
      <div style={{ ...t.dot, transform: checked ? "translateX(16px)" : "translateX(0)" }} />
    </button>
  );
}

const s = {
  page: { padding:"24px 28px", display:"flex", flexDirection:"column", gap:24, maxWidth:720 },
  header: { display:"flex", justifyContent:"space-between" },
  title: { fontSize:22, fontWeight:700, margin:0 },
  sub: { fontSize:13, color:"#4a5568", marginTop:4 },
  sections: { display:"flex", flexDirection:"column", gap:20 },
  input: { background:"#111827", border:"1px solid #1a2235", borderRadius:8, padding:"9px 12px", color:"#f9fafb", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" },
  hint: { fontSize:11, color:"#4a5568", marginTop:4 },
  outlineBtn: { background:"none", border:"1px solid #1a2235", color:"#9ca3af", borderRadius:8, padding:"8px 16px", fontSize:13, cursor:"pointer" },
  footer: { display:"flex", justifyContent:"flex-end", paddingTop:8 },
  saveBtn: { display:"flex", alignItems:"center", gap:6, background:"#34d399", color:"#0a0f1a", border:"none", borderRadius:8, padding:"10px 24px", fontSize:14, fontWeight:700, cursor:"pointer" },
  errorBox: { display:"flex", alignItems:"center", gap:8, background:"#2e1212", border:"1px solid #7f1d1d", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:13 },
};
const sec = {
  wrap: { background:"#0d1321", border:"1px solid #1a2235", borderRadius:12, overflow:"hidden" },
  header: { display:"flex", alignItems:"center", gap:8, padding:"14px 20px", borderBottom:"1px solid #1a2235", background:"#0a1020" },
  label: { fontSize:13, fontWeight:600, color:"#f9fafb" },
  body: { padding:"4px 0" },
};
const r = {
  row: { display:"flex", flexDirection:"column", gap:8, padding:"14px 20px", borderBottom:"1px solid #111827" },
  label: { fontSize:12, color:"#9ca3af", fontWeight:500, textTransform:"uppercase", letterSpacing:0.5 },
  right: { display:"flex", flexDirection:"column", gap:4 },
};
const t = {
  pill: { width:36, height:20, borderRadius:99, border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 },
  dot: { position:"absolute", top:3, left:3, width:14, height:14, borderRadius:"50%", background:"#fff", transition:"transform 0.2s" },
};
