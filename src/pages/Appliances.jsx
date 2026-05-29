import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AppliancesSkeleton } from "../components/Skeleton";
import { Plus, Pencil, Trash2, Zap, Wind, Tv, Lightbulb, Wifi, Monitor, Coffee, WashingMachine, X, Check } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ICONS = [
  { key: "Zap",            Icon: Zap,            label: "Generic" },
  { key: "Wind",           Icon: Wind,           label: "AC / Fan" },
  { key: "Tv",             Icon: Tv,             label: "TV" },
  { key: "Lightbulb",      Icon: Lightbulb,      label: "Light" },
  { key: "Wifi",           Icon: Wifi,           label: "Router" },
  { key: "Monitor",        Icon: Monitor,        label: "PC / Monitor" },
  { key: "Coffee",         Icon: Coffee,         label: "Coffee Maker" },
  { key: "WashingMachine", Icon: WashingMachine, label: "Washing Machine" },
];

const ICON_MAP = Object.fromEntries(ICONS.map(({ key, Icon }) => [key, Icon]));

const ROOMS = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Other"];

const EMPTY = { name: "", watts: "", room: "Living Room", icon: "Zap", isOn: false };

function ApplianceModal({ appliance, onSave, onClose }) {
  const [form, setForm] = useState(appliance || EMPTY);
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={m.overlay}>
      <div style={m.modal}>
        <div style={m.modalHeader}>
          <h2 style={m.modalTitle}>{appliance ? "Edit Appliance" : "Add Appliance"}</h2>
          <button style={m.closeBtn} onClick={onClose}><X size={18} color="#9ca3af" /></button>
        </div>

        <div style={m.form}>
          <div style={m.field}>
            <label style={m.label}>Appliance Name</label>
            <input name="name" value={form.name} onChange={handle}
              placeholder="e.g. Bedroom AC" style={m.input} required />
          </div>

          <div style={m.field}>
            <label style={m.label}>Power (Watts)</label>
            <input name="watts" type="number" min="1" value={form.watts} onChange={handle}
              placeholder="e.g. 1500" style={m.input} required />
            <span style={m.hint}>Check the label on your appliance or its manual.</span>
          </div>

          <div style={m.field}>
            <label style={m.label}>Room</label>
            <select name="room" value={form.room} onChange={handle} style={m.input}>
              {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={m.field}>
            <label style={m.label}>Icon</label>
            <div style={m.iconGrid}>
              {ICONS.map(({ key, Icon, label }) => (
                <button key={key} type="button"
                  style={{ ...m.iconBtn, ...(form.icon === key ? m.iconBtnActive : {}) }}
                  onClick={() => setForm({ ...form, icon: key })}
                  title={label}
                >
                  <Icon size={18} color={form.icon === key ? "#34d399" : "#6b7280"} />
                </button>
              ))}
            </div>
          </div>

          <div style={m.field}>
            <label style={m.label}>Currently On?</label>
            <button type="button"
              style={{ ...m.toggleBtn, background: form.isOn ? "#0a2e1e" : "#111827", borderColor: form.isOn ? "#34d399" : "#1a2235" }}
              onClick={() => setForm({ ...form, isOn: !form.isOn })}
            >
              <div style={{ ...m.toggleDot, transform: form.isOn ? "translateX(20px)" : "translateX(0)", background: form.isOn ? "#34d399" : "#374151" }} />
              <span style={{ fontSize: 13, color: form.isOn ? "#34d399" : "#4a5568", marginLeft: 8 }}>
                {form.isOn ? "On" : "Off"}
              </span>
            </button>
          </div>
        </div>

        <div style={m.modalFooter}>
          <button style={m.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={m.saveBtn} onClick={() => {
            if (!form.name || !form.watts) return;
            onSave({ ...form, watts: Number(form.watts) });
          }}>
            <Check size={15} />
            {appliance ? "Save Changes" : "Add Appliance"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Appliances() {
  const { token } = useAuth();
  const [appliances,  setAppliances]  = useState([]);
  const [modal,       setModal]       = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);
  const [loading,     setLoading]     = useState(true);

  const load = () =>
    fetch(`${API}/api/appliances`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setAppliances(d)).catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [token]);

  const save = async (form) => {
    const isEdit = modal && modal._id;
    const url = isEdit ? `${API}/api/appliances/${modal._id}` : `${API}/api/appliances`;
    const method = isEdit ? "PUT" : "POST";
    await fetch(url, {
      method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setModal(null);
    load();
  };

  const toggle = async (a) => {
    await fetch(`${API}/api/appliances/${a._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...a, isOn: !a.isOn }),
    });
    load();
  };

  const remove = async (id) => {
    setDeletingId(id);
    await fetch(`${API}/api/appliances/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    setDeletingId(null);
    load();
  };

  const totalWatts = appliances.filter(a => a.isOn).reduce((s, a) => s + a.watts, 0);
  const totalKwh   = ((totalWatts * 24) / 1000).toFixed(1);

  if (loading) return <AppliancesSkeleton />;

  return (
    <div style={s.page}>
      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Appliances</h1>
          <p style={s.sub}>Manage your devices and track per-appliance consumption</p>
        </div>
        <button style={s.addBtn} onClick={() => setModal("add")}>
          <Plus size={16} /> Add Appliance
        </button>
      </header>

      {/* Summary chips */}
      <div style={s.chips}>
        {[
          ["Total Devices", appliances.length],
          ["Currently On",  appliances.filter(a => a.isOn).length],
          ["Live Load",     `${totalWatts} W`],
          ["Daily Estimate",`${totalKwh} kWh`],
        ].map(([l, v]) => (
          <div key={l} style={s.chip}>
            <span style={s.chipVal}>{v}</span>
            <span style={s.chipLbl}>{l}</span>
          </div>
        ))}
      </div>

      {/* Room groups */}
      {ROOMS.filter(r => appliances.some(a => a.room === r)).map(room => (
        <div key={room} style={s.roomGroup}>
          <div style={s.roomLabel}>{room}</div>
          <div style={s.cardGrid}>
            {appliances.filter(a => a.room === room).map((a, idx) => {
              const Icon = ICON_MAP[a.icon] || Zap;
              const dailyKwh = ((a.watts * 24) / 1000).toFixed(2);
              const dailyCost = (dailyKwh * 8).toFixed(2);
              return (
                <div key={a._id} style={{ ...s.card, border: `1px solid ${a.isOn ? "#0a3d2b" : "#1a2235"}`, animation: `slideUp 0.3s ease ${idx * 0.05}s both` }}>
                  <div style={s.cardTop}>
                    <div style={{ ...s.iconBox, background: a.isOn ? "#0a2e1e" : "#1a1f2e" }}>
                      <Icon size={20} color={a.isOn ? "#34d399" : "#4a5568"} />
                    </div>
                    <div style={s.cardActions}>
                      <button style={s.actionBtn} onClick={() => setModal(a)} title="Edit">
                        <Pencil size={14} color="#6b7280" />
                      </button>
                      <button style={s.actionBtn} onClick={() => remove(a._id)} title="Delete"
                        disabled={deletingId === a._id}>
                        <Trash2 size={14} color="#6b7280" />
                      </button>
                    </div>
                  </div>
                  <div style={s.cardName}>{a.name}</div>
                  <div style={s.cardWatts}>{a.watts}W</div>

                  <div style={s.cardStats}>
                    <div>
                      <div style={s.cardStatVal}>{dailyKwh}</div>
                      <div style={s.cardStatLbl}>kWh/day</div>
                    </div>
                    <div>
                      <div style={s.cardStatVal}>₹{dailyCost}</div>
                      <div style={s.cardStatLbl}>cost/day</div>
                    </div>
                  </div>

                  {/* On/Off toggle */}
                  <button style={{ ...s.toggleRow, borderTop: "1px solid #1a2235" }} onClick={() => toggle(a)}>
                    <span style={{ fontSize: 12, color: a.isOn ? "#34d399" : "#4a5568" }}>
                      {a.isOn ? "● ON" : "○ OFF"}
                    </span>
                    <div style={{ ...s.pill, background: a.isOn ? "#34d399" : "#1a2235" }}>
                      <div style={{ ...s.pillDot, transform: a.isOn ? "translateX(14px)" : "translateX(0)" }} />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {appliances.length === 0 && (
        <div style={s.empty}>
          <Zap size={36} color="#34d399" />
          <div style={{ fontSize: 16, fontWeight: 600 }}>No appliances yet</div>
          <div style={{ fontSize: 13, color: "#4a5568", maxWidth: 280, textAlign: "center" }}>
            Click "Add Appliance" to start tracking your devices.
          </div>
        </div>
      )}

      {modal && (
        <ApplianceModal
          appliance={modal === "add" ? null : modal}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

const s = {
  page: { padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 22, fontWeight: 700, margin: 0 },
  sub: { fontSize: 13, color: "#4a5568", marginTop: 4 },
  addBtn: { display: "flex", alignItems: "center", gap: 6, background: "#34d399", color: "#0a0f1a", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  chips: { display: "flex", gap: 16 },
  chip: { background: "#0d1321", border: "1px solid #1a2235", borderRadius: 10, padding: "12px 20px", display: "flex", flexDirection: "column", gap: 4 },
  chipVal: { fontSize: 22, fontWeight: 700 },
  chipLbl: { fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: 0.5 },
  roomGroup: { display: "flex", flexDirection: "column", gap: 12 },
  roomLabel: { fontSize: 12, color: "#4a5568", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 },
  card: { background: "#0d1321", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8 },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  iconBox: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  cardActions: { display: "flex", gap: 4 },
  actionBtn: { background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" },
  cardName: { fontSize: 14, fontWeight: 600, color: "#e5e7eb" },
  cardWatts: { fontSize: 12, color: "#4a5568" },
  cardStats: { display: "flex", gap: 16, marginTop: 4 },
  cardStatVal: { fontSize: 15, fontWeight: 700 },
  cardStatLbl: { fontSize: 10, color: "#4a5568", textTransform: "uppercase" },
  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, marginTop: 4, background: "none", border: "none", cursor: "pointer", width: "100%" },
  pill: { width: 32, height: 18, borderRadius: 99, position: "relative", transition: "background 0.2s" },
  pillDot: { position: "absolute", top: 3, left: 3, width: 12, height: 12, borderRadius: "50%", background: "#0a0f1a", transition: "transform 0.2s" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 60, background: "#0d1321", border: "1px dashed #1a2235", borderRadius: 12 },
};

const m = {
  overlay: { position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "#0d1321", border: "1px solid #1a2235", borderRadius: 16, width: "100%", maxWidth: 440, padding: 28, display: "flex", flexDirection: "column", gap: 20 },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: 700, margin: 0 },
  closeBtn: { background: "none", border: "none", cursor: "pointer", display: "flex" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { background: "#111827", border: "1px solid #1a2235", borderRadius: 8, padding: "10px 12px", color: "#f9fafb", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  hint: { fontSize: 11, color: "#4a5568" },
  iconGrid: { display: "flex", gap: 8, flexWrap: "wrap" },
  iconBtn: { background: "#111827", border: "1px solid #1a2235", borderRadius: 8, padding: 10, cursor: "pointer", display: "flex" },
  iconBtnActive: { background: "#0a2e1e", borderColor: "#34d399" },
  toggleBtn: { display: "flex", alignItems: "center", border: "1px solid", borderRadius: 8, padding: "8px 12px", cursor: "pointer", width: "fit-content" },
  toggleDot: { width: 14, height: 14, borderRadius: "50%", transition: "all 0.2s" },
  modalFooter: { display: "flex", gap: 10, justifyContent: "flex-end" },
  cancelBtn: { background: "none", border: "1px solid #1a2235", color: "#9ca3af", borderRadius: 8, padding: "9px 18px", fontSize: 13, cursor: "pointer" },
  saveBtn: { display: "flex", alignItems: "center", gap: 6, background: "#34d399", color: "#0a0f1a", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
};
