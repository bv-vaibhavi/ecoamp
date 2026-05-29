import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Zap, Calculator, Clock, IndianRupee, FileText,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const COLORS = ["#34d399","#60a5fa","#f59e0b","#f87171","#a78bfa","#fb923c","#e879f9","#34d4c3"];

const DarkTooltip = ({ active, payload, label, unit = "kWh" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:8, padding:"10px 14px" }}>
      <p style={{ fontSize:12, color:"#9ca3af", marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:14, fontWeight:700, color:"#34d399" }}>{payload[0].value} {unit}</p>
    </div>
  );
};

// ─── Usage Calculator ─────────────────────────────────────────────────────────
function UsageCalculator({ appliances, rate }) {
  const [selectedId, setSelectedId] = useState("");
  const [hours, setHours] = useState(1);
  const [days,  setDays]  = useState(1);

  const appliance = appliances.find(a => a._id === selectedId);
  const kWh     = appliance ? +((appliance.watts * hours * days) / 1000).toFixed(3) : 0;
  const cost    = +(kWh * rate).toFixed(2);
  const daily   = appliance ? +((appliance.watts * hours) / 1000).toFixed(3) : 0;
  const monthly = +(daily * 30 * rate).toFixed(0);

  return (
    <div style={card.wrap}>
      <SectionHeader icon={Calculator} title="Usage Calculator" sub="Estimate cost before you run an appliance" />
      <div style={{ padding:20, display:"flex", flexDirection:"column", gap:20 }}>
        <div style={f.field}>
          <label style={f.label}>Appliance</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={f.select}>
            <option value="">— Select an appliance —</option>
            {appliances.map(a => <option key={a._id} value={a._id}>{a.name} ({a.watts}W)</option>)}
          </select>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          {[["Hours per day", hours, setHours, 0.5, 24, 0.5, "h"],
            ["Number of days", days,  setDays,  1,   30, 1,   "d"]].map(([lbl, val, set, min, max, step, unit]) => (
            <div key={lbl} style={f.field}>
              <label style={f.label}>{lbl}</label>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <input type="range" min={min} max={max} step={step} value={val}
                  onChange={e => set(Number(e.target.value))} style={f.slider} />
                <span style={{ fontSize:18, fontWeight:700, color:"#34d399", minWidth:40, textAlign:"right" }}>
                  {val}{unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {appliance ? (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              {[
                [Zap,          "#34d399", kWh,     "kWh",  "Total usage"],
                [IndianRupee,  "#60a5fa", `₹${cost}`, "",  "Estimated cost"],
                [Clock,        "#f59e0b", daily,   "kWh",  "Per day"],
                [IndianRupee,  "#a78bfa", `₹${monthly}`, "","If used 30 days"],
              ].map(([Icon, color, val, unit, lbl]) => (
                <div key={lbl} style={{ background:"#111827", border:"1px solid #1a2235", borderRadius:10, padding:"14px 16px" }}>
                  <Icon size={15} color={color} style={{ marginBottom:8 }} />
                  <div style={{ fontSize:20, fontWeight:700, color }}>{val} <span style={{ fontSize:12, color:"#6b7280" }}>{unit}</span></div>
                  <div style={{ fontSize:10, color:"#4a5568", textTransform:"uppercase", letterSpacing:0.5, marginTop:4 }}>{lbl}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"#0a2e1e", border:"1px solid #0d3d24", borderRadius:8, padding:"12px 16px", fontSize:13, color:"#9ca3af", lineHeight:1.7 }}>
              <span style={{ color:"#34d399", fontWeight:600 }}>{appliance.name}</span> running for{" "}
              <span style={{ color:"#f9fafb", fontWeight:600 }}>{hours}hr{hours!==1?"s":""}/day</span> for{" "}
              <span style={{ color:"#f9fafb", fontWeight:600 }}>{days} day{days!==1?"s":""}</span> will consume{" "}
              <span style={{ color:"#34d399", fontWeight:600 }}>{kWh} kWh</span> and cost{" "}
              <span style={{ color:"#60a5fa", fontWeight:600 }}>₹{cost}</span> at ₹{rate}/unit.
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center", color:"#4a5568", fontSize:13, padding:"12px 0" }}>
            Select an appliance above to calculate
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bill Comparison ──────────────────────────────────────────────────────────
function BillComparison({ appliances, token }) {
  const [billUnits,  setBillUnits]  = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [saved, setSaved] = useState(false);

  // Pre-fill from Vaibhavi's actual bill
  const prefill = () => { setBillUnits("373"); setBillAmount("2754"); };

  const effectiveRate = billUnits && billAmount
    ? +(billAmount / billUnits).toFixed(2) : null;

  const totalApplianceMonthly = appliances.reduce((s, a) => s + (a.watts * 24 * 30) / 1000, 0);

  // Each appliance's share of the actual bill
  const breakdown = appliances.map((a, i) => {
    const appKwh  = (a.watts * 24 * 30) / 1000;
    const share   = totalApplianceMonthly > 0 ? appKwh / totalApplianceMonthly : 0;
    const estCost = billAmount ? +(share * Number(billAmount)).toFixed(0) : 0;
    return { name: a.name, watts: a.watts, appKwh: +appKwh.toFixed(1), estCost, share: +(share * 100).toFixed(1), color: COLORS[i % COLORS.length] };
  }).sort((a, b) => b.estCost - a.estCost);

  const ecoampEstimate = effectiveRate
    ? +(totalApplianceMonthly * effectiveRate).toFixed(0) : null;

  const diff = ecoampEstimate && billAmount
    ? ecoampEstimate - Number(billAmount) : null;

  const saveToProfile = async () => {
    if (!billUnits || !billAmount) return;
    await fetch(`${API}/api/user/profile`, {
      method: "PATCH",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ lastBillUnits: Number(billUnits), lastBillAmount: Number(billAmount), unitRate: effectiveRate }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={card.wrap}>
      <SectionHeader icon={FileText} title="Bill Comparison" sub="Enter your actual electricity bill to see which appliances cost you the most" />
      <div style={{ padding:20, display:"flex", flexDirection:"column", gap:20 }}>

        {/* Input row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto auto", gap:12, alignItems:"flex-end" }}>
          <div style={f.field}>
            <label style={f.label}>Actual Units (kWh)</label>
            <input type="number" value={billUnits} onChange={e => setBillUnits(e.target.value)}
              placeholder="e.g. 373" style={f.input} />
          </div>
          <div style={f.field}>
            <label style={f.label}>Total Bill Amount (₹)</label>
            <input type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)}
              placeholder="e.g. 2754" style={f.input} />
          </div>
          <button onClick={prefill} style={f.ghostBtn} title="Use sample AP bill">
            Use my bill
          </button>
          <button onClick={saveToProfile} style={{ ...f.greenBtn, opacity: (!billUnits || !billAmount) ? 0.5 : 1 }}>
            {saved ? <><CheckCircle size={14}/> Saved!</> : "Save to Profile"}
          </button>
        </div>

        {effectiveRate && (
          <>
            {/* Effective rate + accuracy */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              <div style={card.stat}>
                <div style={{ fontSize:11, color:"#4a5568", textTransform:"uppercase", marginBottom:6 }}>Effective Rate</div>
                <div style={{ fontSize:24, fontWeight:700, color:"#34d399" }}>₹{effectiveRate}<span style={{ fontSize:13, color:"#6b7280" }}>/unit</span></div>
                <div style={{ fontSize:11, color:"#4a5568", marginTop:4 }}>incl. fixed charges & surcharges</div>
              </div>
              <div style={card.stat}>
                <div style={{ fontSize:11, color:"#4a5568", textTransform:"uppercase", marginBottom:6 }}>ECOAMP Estimate</div>
                <div style={{ fontSize:24, fontWeight:700, color:"#60a5fa" }}>
                  {ecoampEstimate != null ? `₹${ecoampEstimate}` : "—"}
                </div>
                <div style={{ fontSize:11, color:"#4a5568", marginTop:4 }}>based on your appliances</div>
              </div>
              <div style={card.stat}>
                <div style={{ fontSize:11, color:"#4a5568", textTransform:"uppercase", marginBottom:6 }}>Difference</div>
                {diff != null ? (
                  <div style={{ fontSize:24, fontWeight:700, color: Math.abs(diff) < 200 ? "#34d399" : "#f59e0b" }}>
                    {diff > 0 ? `+₹${diff}` : `-₹${Math.abs(diff)}`}
                  </div>
                ) : <div style={{ fontSize:24, fontWeight:700 }}>—</div>}
                <div style={{ fontSize:11, color:"#4a5568", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                  {diff != null && Math.abs(diff) < 200
                    ? <><CheckCircle size={11} color="#34d399"/> Great accuracy!</>
                    : diff != null
                      ? <><AlertCircle size={11} color="#f59e0b"/> Untracked devices?</>
                      : null}
                </div>
              </div>
            </div>

            {/* Accuracy insight */}
            {diff != null && (
              <div style={{
                background: Math.abs(diff) < 200 ? "#0a2e1e" : "#2e1e0a",
                border: `1px solid ${Math.abs(diff) < 200 ? "#0d3d24" : "#3d2a0d"}`,
                borderRadius:8, padding:"12px 16px", fontSize:13, color:"#9ca3af", lineHeight:1.7
              }}>
                {Math.abs(diff) < 200
                  ? <>✅ ECOAMP's estimate is within <span style={{ color:"#34d399", fontWeight:600 }}>₹{Math.abs(diff)}</span> of your actual bill — excellent tracking! The small difference is from government surcharges & taxes.</>
                  : diff > 0
                    ? <>⚠️ ECOAMP estimates <span style={{ color:"#f59e0b", fontWeight:600 }}>₹{diff} more</span> than your actual bill. You may have fewer appliances running than assumed (24hrs/day). Toggle appliances OFF when not in use for better accuracy.</>
                    : <>⚠️ Your bill is <span style={{ color:"#f87171", fontWeight:600 }}>₹{Math.abs(diff)} more</span> than ECOAMP's estimate. You likely have untracked appliances — check your home for devices not yet added.</>
                }
              </div>
            )}

            {/* Per-appliance cost breakdown */}
            {breakdown.length > 0 && (
              <div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>
                  Your ₹{billAmount} bill — by appliance
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {breakdown.map((a, i) => (
                    <div key={i}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:10, height:10, borderRadius:"50%", background:a.color }} />
                          <span style={{ fontSize:13, fontWeight:600 }}>{a.name}</span>
                          <span style={{ fontSize:11, color:"#4a5568" }}>{a.watts}W · {a.appKwh} kWh/mo</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <span style={{ fontSize:12, color:"#4a5568" }}>{a.share}%</span>
                          <span style={{ fontSize:14, fontWeight:700, color:a.color }}>₹{a.estCost}</span>
                        </div>
                      </div>
                      {/* Bar */}
                      <div style={{ height:6, background:"#1a2235", borderRadius:99, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${a.share}%`, background:a.color, borderRadius:99, transition:"width 0.5s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fixed charges note */}
                <div style={{ marginTop:16, background:"#111827", border:"1px solid #1a2235", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#4a5568" }}>
                  💡 The remaining ₹{Math.max(0, Number(billAmount) - breakdown.reduce((s,a) => s + a.estCost, 0))} covers fixed charges, customer charges, FPPCA surcharges & electricity duty — these are added by the utility regardless of usage.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, sub }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 20px", borderBottom:"1px solid #1a2235", background:"#0a1020" }}>
      <Icon size={16} color="#34d399" />
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:"#f9fafb" }}>{title}</div>
        {sub && <div style={{ fontSize:11, color:"#4a5568", marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Reports() {
  const { token } = useAuth();
  const [appliances, setAppliances] = useState([]);
  const [userRate,   setUserRate]   = useState(7.38);
  const [view, setView] = useState("monthly");

  useEffect(() => {
    fetch(`${API}/api/appliances`, { headers: { Authorization:`Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setAppliances(d)).catch(() => {});
    fetch(`${API}/api/user/profile`, { headers: { Authorization:`Bearer ${token}` } })
      .then(r => r.json()).then(d => d.unitRate && setUserRate(d.unitRate)).catch(() => {});
  }, [token]);

  const appData = appliances.map((a, i) => ({
    name:    a.name,
    daily:   +((a.watts * 24) / 1000).toFixed(2),
    monthly: +((a.watts * 24 * 30) / 1000).toFixed(1),
    cost:    +((a.watts * 24 * 30 * userRate) / 1000).toFixed(0),
    color:   COLORS[i % COLORS.length],
  }));

  const totalMonthly = appData.reduce((s, a) => s + a.monthly, 0).toFixed(1);
  const totalCost    = appData.reduce((s, a) => s + a.cost, 0).toFixed(0);
  const pieData      = appData.map(a => ({ name: a.name, value: a.monthly }));

  const trend = ["Jan","Feb","Mar","Apr","May","Jun"].map(m => ({
    month: m, units: +((totalMonthly * (0.8 + Math.random() * 0.4))).toFixed(1),
  }));

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Reports</h1>
          <p style={s.sub}>Consumption analysis · ₹{userRate}/unit effective rate</p>
        </div>
        <div style={s.tabs}>
          {["monthly","daily"].map(v => (
            <button key={v} style={{ ...s.tab, ...(view===v ? s.tabActive : {}) }} onClick={() => setView(v)}>
              {v === "monthly" ? "Monthly" : "Daily"}
            </button>
          ))}
        </div>
      </header>

      {/* Summary chips */}
      <div style={s.grid4}>
        {[["Total Devices", appliances.length, ""],
          ["Monthly Usage", totalMonthly, "kWh"],
          ["Monthly Cost",  `₹${totalCost}`, ""],
          ["Avg per Device", appliances.length ? (totalMonthly/appliances.length).toFixed(1) : "0", "kWh"],
        ].map(([l, v, u]) => (
          <div key={l} style={s.chip}>
            <span style={s.chipVal}>{v}<span style={{ fontSize:13, color:"#6b7280", fontWeight:400 }}> {u}</span></span>
            <span style={s.chipLbl}>{l}</span>
          </div>
        ))}
      </div>

      {appliances.length === 0 ? (
        <div style={s.empty}>
          <Zap size={36} color="#34d399" />
          <div style={{ fontSize:15, fontWeight:600 }}>No data yet</div>
          <div style={{ fontSize:13, color:"#4a5568" }}>Add appliances to see reports.</div>
        </div>
      ) : (
        <>
          {/* Charts */}
          <div style={s.chartsRow}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>
                Consumption by Appliance ({view === "monthly" ? "kWh/month" : "kWh/day"})
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={appData} barSize={32} margin={{ top:10, right:10, left:-10, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill:"#4a5568", fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"#4a5568", fontSize:11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill:"#ffffff08" }} />
                  <Bar dataKey={view==="monthly" ? "monthly" : "daily"} radius={[6,6,0,0]}>
                    {appData.map((a,i) => <Cell key={i} fill={a.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ ...s.chartCard, flex:"0 0 260px" }}>
              <div style={s.chartTitle}>Usage Share</div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={88}
                    paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                    {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:8, padding:"8px 12px" }}>
                        <p style={{ fontSize:12, color:"#9ca3af" }}>{payload[0].name}</p>
                        <p style={{ fontSize:14, fontWeight:700, color:"#34d399" }}>{payload[0].value} kWh</p>
                      </div>
                    ) : null
                  } />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11, color:"#6b7280", paddingTop:8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bill Comparison */}
          <BillComparison appliances={appliances} token={token} />

          {/* Usage Calculator */}
          <UsageCalculator appliances={appliances} rate={userRate} />

          {/* Monthly trend */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              Monthly Trend <span style={{ fontSize:11, color:"#4a5568", fontWeight:400 }}>(projected from current config)</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={trend} barSize={32} margin={{ top:10, right:10, left:-10, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="month" tick={{ fill:"#4a5568", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#4a5568", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill:"#ffffff08" }} />
                <Bar dataKey="units" fill="#34d399" radius={[6,6,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed table */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}>Detailed Breakdown</div>
            <div style={s.tableHead}>
              {["Appliance","Wattage","Daily kWh","Monthly kWh","Monthly Cost"].map(h => (
                <span key={h} style={s.th}>{h}</span>
              ))}
            </div>
            {appData.map((a,i) => (
              <div key={i} style={s.tableRow}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:a.color, flexShrink:0 }} />
                  <span style={{ fontSize:13, fontWeight:600 }}>{a.name}</span>
                </div>
                <span style={s.td}>{appliances[i]?.watts}W</span>
                <span style={s.td}>{a.daily} kWh</span>
                <span style={s.td}>{a.monthly} kWh</span>
                <span style={{ ...s.td, color:"#34d399", fontWeight:600 }}>₹{a.cost}</span>
              </div>
            ))}
            <div style={{ ...s.tableRow, borderTop:"2px solid #1a2235", marginTop:4 }}>
              <span style={{ fontSize:13, fontWeight:700 }}>Total</span>
              <span style={s.td} />
              <span style={s.td}>{appData.reduce((s,a) => s+a.daily,0).toFixed(2)} kWh</span>
              <span style={s.td}>{totalMonthly} kWh</span>
              <span style={{ ...s.td, color:"#34d399", fontWeight:700 }}>₹{totalCost}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const s = {
  page: { padding:"24px 28px", display:"flex", flexDirection:"column", gap:20 },
  header: { display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
  title: { fontSize:22, fontWeight:700, margin:0 },
  sub: { fontSize:13, color:"#4a5568", marginTop:4 },
  tabs: { display:"flex", background:"#0d1321", border:"1px solid #1a2235", borderRadius:8, padding:3, gap:2 },
  tab: { background:"none", border:"none", color:"#4a5568", fontSize:13, padding:"6px 14px", borderRadius:6, cursor:"pointer" },
  tabActive: { background:"#0a2e1e", color:"#34d399", fontWeight:600 },
  grid4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 },
  chip: { background:"#0d1321", border:"1px solid #1a2235", borderRadius:10, padding:"14px 18px", display:"flex", flexDirection:"column", gap:4 },
  chipVal: { fontSize:24, fontWeight:700 },
  chipLbl: { fontSize:11, color:"#4a5568", textTransform:"uppercase", letterSpacing:0.5 },
  chartsRow: { display:"flex", gap:16 },
  chartCard: { flex:1, background:"#0d1321", border:"1px solid #1a2235", borderRadius:12, padding:"18px 20px" },
  chartTitle: { fontSize:14, fontWeight:600, marginBottom:14 },
  tableHead: { display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, padding:"10px 0", borderBottom:"1px solid #1a2235", marginBottom:4, marginTop:12 },
  th: { fontSize:11, color:"#374151", textTransform:"uppercase", letterSpacing:0.5 },
  tableRow: { display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, padding:"10px 0", borderBottom:"1px solid #111827", alignItems:"center" },
  td: { fontSize:13, color:"#9ca3af" },
  empty: { display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:60, background:"#0d1321", border:"1px dashed #1a2235", borderRadius:12, textAlign:"center" },
};
const card = {
  wrap: { background:"#0d1321", border:"1px solid #1a2235", borderRadius:12, overflow:"hidden" },
  stat: { background:"#111827", border:"1px solid #1a2235", borderRadius:10, padding:"14px 16px" },
};
const f = {
  field: { display:"flex", flexDirection:"column", gap:8 },
  label: { fontSize:12, color:"#9ca3af", fontWeight:500, textTransform:"uppercase", letterSpacing:0.5 },
  input: { background:"#111827", border:"1px solid #1a2235", borderRadius:8, padding:"10px 12px", color:"#f9fafb", fontSize:14, outline:"none" },
  select: { background:"#111827", border:"1px solid #1a2235", borderRadius:8, padding:"10px 12px", color:"#f9fafb", fontSize:14, outline:"none" },
  slider: { flex:1, accentColor:"#34d399", cursor:"pointer" },
  ghostBtn: { background:"none", border:"1px solid #1a2235", color:"#9ca3af", borderRadius:8, padding:"10px 14px", fontSize:13, cursor:"pointer", whiteSpace:"nowrap" },
  greenBtn: { display:"flex", alignItems:"center", gap:6, background:"#34d399", color:"#0a0f1a", border:"none", borderRadius:8, padding:"10px 16px", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" },
};
