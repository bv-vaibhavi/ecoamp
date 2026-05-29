import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState("enter"); // enter | hold | exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 800);
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#0a0f1a",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: phase === "exit" ? 0 : 1,
      transition: phase === "exit" ? "opacity 0.6s ease" : "none",
    }}>
      {/* Logo */}
      <div style={{
        transform: phase === "enter" ? "scale(0.6) translateY(20px)" : "scale(1) translateY(0px)",
        opacity:   phase === "enter" ? 0 : 1,
        transition: "transform 0.7s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease",
      }}>
        <img
          src="/logo.png"
          alt="ECOAMP"
          style={{ width: 140, height: 140, objectFit: "contain" }}
          onError={e => { e.target.style.display = "none"; }}
        />
      </div>

      {/* App name */}
      <div style={{
        marginTop: 20,
        opacity:   phase === "enter" ? 0 : 1,
        transform: phase === "enter" ? "translateY(10px)" : "translateY(0)",
        transition: "opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s",
      }}>
        <div style={{
          fontSize: 36, fontWeight: 800, letterSpacing: 4,
          color: "#f9fafb", fontFamily: "'Inter','Segoe UI',sans-serif",
        }}>
          ECO<span style={{ color: "#34d399" }}>AMP</span>
        </div>
        <div style={{
          fontSize: 13, color: "#4a5568", textAlign: "center",
          marginTop: 8, letterSpacing: 1,
          opacity:   phase === "hold" ? 1 : 0,
          transition: "opacity 0.5s ease 0.5s",
        }}>
          Know every unit. Save every rupee.
        </div>
      </div>

      {/* Loading bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 3, background: "#1a2235", overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          background: "linear-gradient(90deg, #34d399, #059669)",
          width: phase === "enter" ? "0%" : phase === "hold" ? "70%" : "100%",
          transition: phase === "enter"
            ? "width 0.8s ease"
            : phase === "hold"
            ? "width 1.2s ease"
            : "width 0.5s ease",
          borderRadius: "0 2px 2px 0",
        }} />
      </div>
    </div>
  );
}
