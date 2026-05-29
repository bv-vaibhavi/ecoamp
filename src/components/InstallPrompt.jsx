import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [prompt,    setPrompt]    = useState(null);
  const [visible,   setVisible]   = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setVisible(false);
  };

  if (!visible || installed) return null;

  return (
    <div style={s.banner}>
      <div style={s.left}>
        <img src="/logo.png" alt="ECOAMP" style={{ width: 36, height: 36, objectFit: "contain" }} />
        <div>
          <div style={s.title}>Install ECOAMP</div>
          <div style={s.sub}>Add to home screen for the best experience</div>
        </div>
      </div>
      <div style={s.actions}>
        <button style={s.installBtn} onClick={install}>
          <Download size={14} />
          Install
        </button>
        <button style={s.closeBtn} onClick={() => setVisible(false)}>
          <X size={16} color="#4a5568" />
        </button>
      </div>
    </div>
  );
}

const s = {
  banner: {
    position: "fixed", bottom: 72, left: 12, right: 12, zIndex: 100,
    background: "#0d1321", border: "1px solid #34d399",
    borderRadius: 12, padding: "12px 14px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    boxShadow: "0 8px 32px #00000060",
    animation: "slideUp 0.3s ease",
  },
  left: { display: "flex", alignItems: "center", gap: 10 },
  title: { fontSize: 13, fontWeight: 700, color: "#f9fafb" },
  sub: { fontSize: 11, color: "#4a5568", marginTop: 2 },
  actions: { display: "flex", alignItems: "center", gap: 8 },
  installBtn: {
    display: "flex", alignItems: "center", gap: 5,
    background: "#34d399", color: "#0a0f1a",
    border: "none", borderRadius: 8,
    padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
  },
  closeBtn: {
    background: "none", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", padding: 4,
  },
};
