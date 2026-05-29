import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Search, TrendingUp, TrendingDown, MoreHorizontal,
  Zap, Wind, Tv, Lightbulb, Wifi, Monitor, Coffee
} from "lucide-react";
import NotificationBell from "../components/NotificationBell";
import { DashboardSkeleton } from "../components/Skeleton";
import useCountUp from "../hooks/useCountUp";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ICON_MAP = { Wind, Tv, Lightbulb, Wifi, Monitor, Coffee, Zap };

const hourlyData = [
  { time: "12AM", units: 1.2 }, { time: "3AM",  units: 0.8 },
  { time: "6AM",  units: 1.5 }, { time: "9AM",  units: 3.2 },
  { time: "12PM", units: 4.8 }, { time: "3PM",  units: 4.1 },
  { time: "6PM",  units: 5.6 }, { time: "9PM",  units: 6.2 },
  { time: "11PM", units: 3.4 },
];
const weeklyData = [
  { day: "Mon", units: 18.4 }, { day: "Tue", units: 22.1 },
  { day: "Wed", units: 19.8 }, { day: "Thu", units: 25.3 },
  { day: "Fri", units: 28.6 }, { day: "Sat", units: 32.1 },
  { day: "Sun", units: 24.5 },
];

function StatCard({ title, value, unit, sub, trend, trendVal, isNumeric = false, decimals = 1 }) {
  const up = trend === "up";
  const numVal = isNumeric ? parseFloat(value) || 0 : null;
  const counted = useCountUp(numVal, 1200, decimals);
  const displayVal = isNumeric ? counted : value;

  return (
    <div style={{ ...s.statCard, animation: "slideUp 0.4s ease forwards" }}>
      <div style={s.statTop}>
        <span style={s.statTitle}>{title}</span>
        <MoreHorizontal size={16} color="#4a5568" />
      </div>
      <div style={s.statValue}>
        {displayVal}<span style={s.statUnit}>{unit}</span>
      </div>
      <div style={s.statBottom}>
        <span style={{ ...s.badge, background: up ? "#0d2e1f" : "#2e1212", color: up ? "#34d399" : "#f87171" }}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trendVal}
        </span>
        <span style={s.statSub}>{sub}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { token, user } = useAuth();
  const [appliances, setAppliances] = useState([]);
  const [period,     setPeriod]     = useState("Today");
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/appliances`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => Array.isArray(data) && setAppliances(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const totalUnits = appliances.reduce((s, a) => s + (a.isOn ? (a.watts * 24) / 1000 : 0), 0).toFixed(1);
  const totalCost  = (totalUnits * 8).toFixed(2); // ₹8 per unit estimate
  const activeCount = appliances.filter(a => a.isOn).length;
  const top = [...appliances].sort((a, b) => b.watts - a.watts)[0];

  if (loading) return <DashboardSkeleton />;

  return (
    <div style={s.page}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .search-box { display: flex; }
        .charts-row { display: flex; gap: 16px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
        @media (max-width: 768px) {
          .search-box { display: none !important; }
          .charts-row { flex-direction: column !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 400px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* Topbar */}
      <header style={s.topbar}>
        <div>
          <h1 style={s.pageTitle}>Dashboard</h1>
          <p style={s.pageSub}>Welcome back, {user?.name?.split(" ")[0] || "there"} 👋</p>
        </div>
        <div style={s.topRight}>
          <div style={s.searchBox} className="search-box">
            <Search size={15} color="#4a5568" />
            <input style={s.searchInput} placeholder="Search…" />
          </div>
          <NotificationBell />
        </div>
      </header>

      {/* Stats */}
      <div style={s.grid4} className="stats-grid">
        <StatCard title="Units Today"    value={totalUnits}   unit=" kWh" sub="estimated"                        trend="up"   trendVal="+8.4%" isNumeric decimals={1} />
        <StatCard title="Estimated Cost" value={totalCost}    unit=""     sub="today"                              trend="up"   trendVal="+5.2%" isNumeric decimals={0} />
        <StatCard title="Active Devices" value={activeCount}  unit=""     sub={`of ${appliances.length} added`}    trend="down" trendVal="-2"    isNumeric decimals={0} />
        <StatCard title="Top Consumer"   value={top ? top.name : "—"} unit="" sub={top ? `${top.watts}W` : "No appliances yet"} trend="up" trendVal={top ? "+12%" : "—"} />
      </div>

      {/* Charts */}
      <div style={s.chartsRow} className="charts-row">
        <div style={s.chartCard}>
          <div style={s.chartHeader}>
            <div>
              <div style={s.chartTitle}>Consumption Today</div>
              <div style={s.chartSub}>Hourly unit usage (kWh)</div>
            </div>
            <div style={s.tabs}>
              {["Today", "Week"].map(p => (
                <button key={p} style={{ ...s.tab, ...(period === p ? s.tabActive : {}) }} onClick={() => setPeriod(p)}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={period === "Week" ? weeklyData.map(d => ({ time: d.day, units: d.units })) : hourlyData}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" tick={{ fill: "#4a5568", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4a5568", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8, color: "#f9fafb" }} />
              <Area type="monotone" dataKey="units" stroke="#34d399" strokeWidth={2} fill="url(#cg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...s.chartCard, flex: "0 0 300px" }}>
          <div style={s.chartHeader}>
            <div>
              <div style={s.chartTitle}>Weekly Summary</div>
              <div style={s.chartSub}>Daily totals (kWh)</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#4a5568", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4a5568", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8, color: "#f9fafb" }} />
              <Bar dataKey="units" fill="#34d399" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top appliances quick list */}
      {appliances.length > 0 && (
        <div style={s.tableCard}>
          <div style={s.chartTitle}>Top Appliances by Power</div>
          <div style={s.chartSub} >Sorted by wattage · Add more in the Appliances tab</div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {[...appliances].sort((a, b) => b.watts - a.watts).slice(0, 5).map(a => {
              const Icon = ICON_MAP[a.icon] || Zap;
              return (
                <div key={a._id} style={s.appRow}>
                  <div style={{ ...s.appIcon, background: a.isOn ? "#0a2e1e" : "#1a1f2e" }}>
                    <Icon size={16} color={a.isOn ? "#34d399" : "#4a5568"} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={s.appName}>{a.name}</div>
                    <div style={{ fontSize: 11, color: "#4a5568" }}>{a.watts}W · {a.room}</div>
                  </div>
                  <div style={{ fontSize: 13, color: "#f9fafb", fontWeight: 600 }}>
                    {((a.watts * 24) / 1000).toFixed(2)} kWh/day
                  </div>
                  <div style={{ ...s.statusDot, background: a.isOn ? "#34d399" : "#374151" }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {appliances.length === 0 && (
        <div style={s.emptyCard}>
          <Zap size={32} color="#34d399" />
          <div style={s.emptyTitle}>No appliances added yet</div>
          <div style={s.emptySub}>Go to the Appliances page to add your first device and start tracking consumption.</div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  pageTitle: { fontSize: 22, fontWeight: 700, margin: 0 },
  pageSub: { fontSize: 13, color: "#4a5568", marginTop: 4 },
  topRight: { display: "flex", alignItems: "center", gap: 12 },
  searchBox: { display: "flex", alignItems: "center", gap: 8, background: "#0d1321", border: "1px solid #1a2235", borderRadius: 8, padding: "8px 12px" },
  searchInput: { background: "none", border: "none", outline: "none", color: "#9ca3af", fontSize: 13, width: 180 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, position: "relative", display: "flex", alignItems: "center" },
  dot: { position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "#34d399" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 },
  statCard: { background: "#0d1321", border: "1px solid #1a2235", borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 },
  statTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  statTitle: { fontSize: 12, color: "#4a5568", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 },
  statValue: { fontSize: 26, fontWeight: 700 },
  statUnit: { fontSize: 13, color: "#6b7280", fontWeight: 400 },
  statBottom: { display: "flex", alignItems: "center", gap: 8 },
  statSub: { fontSize: 11, color: "#4a5568" },
  badge: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 20 },
  chartsRow: { display: "flex", gap: 16 },
  chartCard: { flex: 1, background: "#0d1321", border: "1px solid #1a2235", borderRadius: 12, padding: "18px 20px" },
  chartHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  chartTitle: { fontSize: 14, fontWeight: 600 },
  chartSub: { fontSize: 11, color: "#4a5568", marginTop: 2 },
  tabs: { display: "flex", background: "#111827", borderRadius: 8, padding: 3, gap: 2 },
  tab: { background: "none", border: "none", color: "#4a5568", fontSize: 12, padding: "4px 10px", borderRadius: 6, cursor: "pointer" },
  tabActive: { background: "#0a2e1e", color: "#34d399", fontWeight: 600 },
  tableCard: { background: "#0d1321", border: "1px solid #1a2235", borderRadius: 12, padding: "18px 20px" },
  appRow: { display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #111827" },
  appIcon: { width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" },
  appName: { fontSize: 13, fontWeight: 600, color: "#e5e7eb" },
  statusDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  emptyCard: { background: "#0d1321", border: "1px dashed #1a2235", borderRadius: 12, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" },
  emptyTitle: { fontSize: 16, fontWeight: 600 },
  emptySub: { fontSize: 13, color: "#4a5568", maxWidth: 320 },
};
