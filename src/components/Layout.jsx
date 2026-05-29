import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Zap, BarChart2, Settings,
  Menu, X, Home, LogOut, ChevronDown
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import PageTransition from "./PageTransition";
import InstallPrompt from "./InstallPrompt";

const navItems = [
  { path: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { path: "/appliances", label: "Appliances", icon: Zap },
  { path: "/reports",    label: "Reports",    icon: BarChart2 },
  { path: "/settings",   label: "Settings",   icon: Settings },
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false); // sidebar closed by default on mobile
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate("/login"); };
  const go = (path) => { navigate(path); setOpen(false); };

  return (
    <div style={s.root}>
      {/* ── Desktop Sidebar ── */}
      <aside style={{ ...s.sidebar, width: open ? 240 : 72 }} className="desktop-sidebar">
        <div style={s.sidebarHeader}>
          <div style={s.logo}>
            <img src="/logo.png" alt="ECOAMP" style={{ width:28, height:28, objectFit:"contain" }}
              onError={e => { e.target.style.display="none"; }} />
            {open && <span style={s.logoText}>ECOAMP</span>}
          </div>
          <button style={s.iconBtn} onClick={() => setOpen(o => !o)}>
            {open ? <X size={18} color="#9ca3af" /> : <Menu size={18} color="#9ca3af" />}
          </button>
        </div>

        {open && (
          <div style={s.locationChip}>
            <Home size={13} color="#34d399" />
            <span style={{ fontSize:12, color:"#9ca3af" }}>{user?.homeName || "My Home"}</span>
            <ChevronDown size={13} color="#4a5568" />
          </div>
        )}

        <nav style={s.nav}>
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = pathname === path;
            return (
              <button key={path}
                style={{ ...s.navItem, ...(active ? s.navActive : {}) }}
                onClick={() => go(path)}
              >
                <Icon size={18} color={active ? "#34d399" : "#6b7280"} />
                {open && <span style={{ color: active ? "#f9fafb" : "#6b7280", fontSize:14 }}>{label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={s.footer}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
          {open && (
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:"#f9fafb", fontWeight:600 }}>{user?.name || "User"}</div>
              <div style={{ fontSize:11, color:"#4a5568" }}>Home Owner</div>
            </div>
          )}
          {open && (
            <button style={s.iconBtn} onClick={handleLogout}>
              <LogOut size={16} color="#4a5568" />
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div style={s.mobileTopBar} className="mobile-topbar">
        <div style={s.logo}>
          <img src="/logo.png" alt="ECOAMP" style={{ width:24, height:24, objectFit:"contain" }}
            onError={e => { e.target.style.display="none"; }} />
          <span style={{ ...s.logoText, fontSize:16 }}>ECOAMP</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <NotificationBell />
          <button style={s.iconBtn} onClick={() => setOpen(o => !o)}>
            {open ? <X size={22} color="#9ca3af" /> : <Menu size={22} color="#9ca3af" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {open && (
        <div style={s.mobileOverlay} className="mobile-overlay" onClick={() => setOpen(false)}>
          <div style={s.mobileDrawer} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"20px 20px 12px" }}>
              <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>{user?.name}</div>
                <div style={{ fontSize:12, color:"#4a5568" }}>{user?.homeName || "My Home"}</div>
              </div>
            </div>
            <nav style={{ padding:"8px 12px", display:"flex", flexDirection:"column", gap:4 }}>
              {navItems.map(({ path, label, icon: Icon }) => {
                const active = pathname === path;
                return (
                  <button key={path}
                    style={{ ...s.navItem, ...(active ? s.navActive : {}), padding:"12px 16px" }}
                    onClick={() => go(path)}
                  >
                    <Icon size={20} color={active ? "#34d399" : "#6b7280"} />
                    <span style={{ color: active ? "#f9fafb" : "#6b7280", fontSize:15 }}>{label}</span>
                  </button>
                );
              })}
            </nav>
            <div style={{ padding:"16px 20px", borderTop:"1px solid #1a2235", marginTop:"auto" }}>
              <button style={{ ...s.navItem, padding:"10px 16px", width:"100%" }} onClick={handleLogout}>
                <LogOut size={18} color="#4a5568" />
                <span style={{ color:"#6b7280", fontSize:14 }}>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main style={s.main}>
        <PageTransition>{children}</PageTransition>
      </main>

      <InstallPrompt />

      {/* ── Mobile Bottom Nav ── */}
      <nav style={s.bottomNav} className="mobile-bottomnav">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <button key={path} style={s.bottomNavItem} onClick={() => go(path)}>
              <Icon size={22} color={active ? "#34d399" : "#4a5568"} />
              <span style={{ fontSize:10, color: active ? "#34d399" : "#4a5568", marginTop:3, fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Responsive CSS */}
      <style>{`
        .desktop-sidebar { display: flex !important; }
        .mobile-topbar   { display: none !important; }
        .mobile-overlay  { display: flex !important; }
        .mobile-bottomnav{ display: none !important; }

        @media (max-width: 768px) {
          .desktop-sidebar  { display: none !important; }
          .mobile-topbar    { display: flex !important; }
          .mobile-bottomnav { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

const s = {
  root: { display:"flex", height:"100vh", background:"#0a0f1a", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#f9fafb", overflow:"hidden", position:"relative" },
  sidebar: { background:"#0d1321", borderRight:"1px solid #1a2235", display:"flex", flexDirection:"column", transition:"width 0.2s ease", flexShrink:0, overflow:"hidden" },
  sidebarHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 16px 12px" },
  logo: { display:"flex", alignItems:"center", gap:10 },
  logoText: { fontSize:18, fontWeight:800, color:"#f9fafb", letterSpacing:1 },
  locationChip: { display:"flex", alignItems:"center", gap:6, margin:"0 12px 12px", padding:"6px 10px", background:"#111827", borderRadius:8, cursor:"pointer" },
  nav: { flex:1, padding:"8px", display:"flex", flexDirection:"column", gap:2 },
  navItem: { display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:8, border:"none", background:"transparent", cursor:"pointer", width:"100%", transition:"background 0.15s" },
  navActive: { background:"#0a2e1e" },
  footer: { display:"flex", alignItems:"center", gap:10, padding:"16px", borderTop:"1px solid #1a2235" },
  avatar: { width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#34d399,#059669)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 },
  main: { flex:1, overflow:"auto", display:"flex", flexDirection:"column" },
  iconBtn: { background:"none", border:"none", cursor:"pointer", padding:6, borderRadius:8, display:"flex", alignItems:"center" },
  // Mobile
  mobileTopBar: { display:"none", position:"fixed", top:0, left:0, right:0, zIndex:50, background:"#0d1321", borderBottom:"1px solid #1a2235", padding:"12px 16px", alignItems:"center", justifyContent:"space-between" },
  mobileOverlay: { position:"fixed", inset:0, background:"#000c", zIndex:60, display:"none", alignItems:"flex-start", justifyContent:"flex-start" },
  mobileDrawer: { background:"#0d1321", width:280, height:"100%", display:"flex", flexDirection:"column", borderRight:"1px solid #1a2235", overflowY:"auto" },
  bottomNav: { display:"none", position:"fixed", bottom:0, left:0, right:0, background:"#0d1321", borderTop:"1px solid #1a2235", zIndex:50 },
  bottomNavItem: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 0 8px", background:"none", border:"none", cursor:"pointer" },
};
