import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Bell, Zap, AlertTriangle, BarChart2, X, CheckCheck, Trash2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ICON_MAP = {
  bell:  <Bell size={14} color="#60a5fa" />,
  zap:   <Zap size={14} color="#f59e0b" />,
  alert: <AlertTriangle size={14} color="#f87171" />,
  chart: <BarChart2 size={14} color="#34d399" />,
};

const TYPE_COLOR = {
  high_usage:      "#f59e0b",
  budget_warning:  "#f87171",
  appliance_on:    "#60a5fa",
  weekly_summary:  "#34d399",
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const { token } = useAuth();
  const [open,         setOpen]         = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread,       setUnread]       = useState(0);
  const ref = useRef(null);

  const load = async () => {
    try {
      const res  = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [token]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id) => {
    await fetch(`${API}/api/notifications/${id}/read`, {
      method: "PATCH", headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  const markAllRead = async () => {
    await fetch(`${API}/api/notifications/read-all`, {
      method: "PATCH", headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  const clearAll = async () => {
    await fetch(`${API}/api/notifications/clear`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button style={s.bellBtn} onClick={() => { setOpen(o => !o); if (!open) load(); }}>
        <Bell size={18} color="#9ca3af" />
        {unread > 0 && (
          <span style={s.badge}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={s.dropdown}>
          {/* Header */}
          <div style={s.dropHeader}>
            <span style={s.dropTitle}>Notifications</span>
            <div style={{ display: "flex", gap: 8 }}>
              {unread > 0 && (
                <button style={s.textBtn} onClick={markAllRead} title="Mark all read">
                  <CheckCheck size={14} color="#34d399" />
                </button>
              )}
              {notifications.length > 0 && (
                <button style={s.textBtn} onClick={clearAll} title="Clear all">
                  <Trash2 size={14} color="#4a5568" />
                </button>
              )}
              <button style={s.textBtn} onClick={() => setOpen(false)}>
                <X size={14} color="#4a5568" />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={s.list}>
            {notifications.length === 0 ? (
              <div style={s.empty}>
                <Bell size={24} color="#1a2235" />
                <div style={{ fontSize: 13, color: "#4a5568", marginTop: 8 }}>No notifications yet</div>
                <div style={{ fontSize: 11, color: "#374151", marginTop: 4 }}>
                  We'll alert you about high usage and budget warnings
                </div>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  style={{ ...s.item, background: n.read ? "transparent" : "#0d1f14" }}
                  onClick={() => !n.read && markRead(n._id)}
                >
                  <div style={{ ...s.iconBox, background: `${TYPE_COLOR[n.type]}18`, border: `1px solid ${TYPE_COLOR[n.type]}30` }}>
                    {ICON_MAP[n.icon] || ICON_MAP.bell}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.itemTitle}>
                      {n.title}
                      {!n.read && <span style={s.unreadDot} />}
                    </div>
                    <div style={s.itemMsg}>{n.message}</div>
                    <div style={s.itemTime}>{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {unread > 0 && (
            <div style={s.dropFooter}>
              <button style={s.markAllBtn} onClick={markAllRead}>
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  bellBtn: { position: "relative", background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center" },
  badge: { position: "absolute", top: 2, right: 2, background: "#f87171", color: "#fff", fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  dropdown: { position: "absolute", top: "calc(100% + 8px)", right: 0, width: 340, background: "#0d1321", border: "1px solid #1a2235", borderRadius: 12, boxShadow: "0 20px 60px #00000060", zIndex: 200, overflow: "hidden" },
  dropHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #1a2235" },
  dropTitle: { fontSize: 14, fontWeight: 700, color: "#f9fafb" },
  textBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 },
  list: { maxHeight: 380, overflowY: "auto" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", textAlign: "center" },
  item: { display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid #111827", cursor: "pointer", transition: "background 0.15s" },
  iconBox: { width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  itemTitle: { fontSize: 13, fontWeight: 600, color: "#f9fafb", display: "flex", alignItems: "center", gap: 6, marginBottom: 3 },
  unreadDot: { width: 6, height: 6, borderRadius: "50%", background: "#34d399", flexShrink: 0 },
  itemMsg: { fontSize: 12, color: "#6b7280", lineHeight: 1.5 },
  itemTime: { fontSize: 11, color: "#374151", marginTop: 4 },
  dropFooter: { padding: "10px 16px", borderTop: "1px solid #1a2235" },
  markAllBtn: { background: "none", border: "none", color: "#34d399", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 },
};
