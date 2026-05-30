import { useState, useEffect } from "react";
import {
  LayoutDashboard, Zap, BarChart2, Settings,
  ChevronRight, ChevronLeft, X, Sparkles,
} from "lucide-react";

const STORAGE_KEY = "ecoamp_onboarding_done";

const steps = [
  {
    icon: <Sparkles size={36} color="#34d399" />,
    title: "Welcome to ECOAMP! 🎉",
    body: "ECOAMP shows you exactly which appliance in your home is consuming how much electricity — so you're never guessing when the bill arrives.",
    highlight: null,
  },
  {
    icon: <LayoutDashboard size={36} color="#34d399" />,
    title: "Dashboard",
    body: "Your energy at a glance. See today's total consumption, a live breakdown by room, and how you compare to yesterday — all in one screen.",
    highlight: "dashboard",
  },
  {
    icon: <Zap size={36} color="#34d399" />,
    title: "Appliances",
    body: "Add every appliance — your AC, fridge, washing machine, TV — with its wattage and usage hours. ECOAMP calculates the units and cost for each one.",
    highlight: "appliances",
  },
  {
    icon: <BarChart2 size={36} color="#34d399" />,
    title: "Reports",
    body: "Explore weekly and monthly charts, see your top energy-consuming appliances ranked, and spot trends that help you cut down your bill.",
    highlight: "reports",
  },
  {
    icon: <Settings size={36} color="#34d399" />,
    title: "Settings",
    body: "Set your electricity tariff (₹ per unit), give your home a name, and configure notification preferences. Accurate rates = accurate cost estimates.",
    highlight: "settings",
  },
];

export default function OnboardingTour() {
  const [step, setStep]       = useState(0);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Slight delay so the dashboard loads first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const finish = () => {
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
      setExiting(false);
    }, 300);
  };

  const next = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else finish();
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  if (!visible) return null;

  const current = steps[step];
  const isLast  = step === steps.length - 1;

  return (
    <div style={{
      ...s.overlay,
      opacity: exiting ? 0 : 1,
      transition: "opacity 0.3s ease",
    }}>
      <div style={{
        ...s.card,
        transform: exiting ? "translateY(30px)" : "translateY(0)",
        transition: "transform 0.3s ease, opacity 0.3s ease",
        opacity: exiting ? 0 : 1,
      }}>
        {/* skip */}
        <button style={s.skipBtn} onClick={finish} title="Skip tour">
          <X size={16} color="#6b7280" />
        </button>

        {/* icon */}
        <div style={s.iconWrap}>{current.icon}</div>

        {/* step title */}
        <h2 style={s.title}>{current.title}</h2>

        {/* body */}
        <p style={s.body}>{current.body}</p>

        {/* progress dots */}
        <div style={s.dots}>
          {steps.map((_, i) => (
            <button
              key={i}
              style={{ ...s.dot, ...(i === step ? s.dotActive : {}) }}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* nav buttons */}
        <div style={s.navRow}>
          <button
            style={{ ...s.navBtn, opacity: step === 0 ? 0.3 : 1 }}
            onClick={prev}
            disabled={step === 0}
          >
            <ChevronLeft size={18} />
            Back
          </button>

          <button style={s.primaryBtn} onClick={next}>
            {isLast ? "Get Started" : "Next"}
            {!isLast && <ChevronRight size={18} />}
          </button>
        </div>

        {/* step counter */}
        <div style={s.counter}>
          {step + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 300,
    background: "rgba(0,0,0,0.82)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    background: "#0d1321",
    border: "1px solid #1e2d3d",
    borderRadius: 24,
    padding: "36px 28px 28px",
    width: "100%",
    maxWidth: 400,
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
    textAlign: "center",
  },
  skipBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 6,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0a2e1e, #0d3a26)",
    border: "2px solid #34d39940",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 0 30px #34d39920",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "#f9fafb",
    margin: "0 0 12px",
    lineHeight: 1.3,
  },
  body: {
    fontSize: 14,
    color: "#9ca3af",
    lineHeight: 1.7,
    margin: "0 0 24px",
  },
  dots: {
    display: "flex",
    justifyContent: "center",
    gap: 7,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#1e2d3d",
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "background 0.2s, transform 0.2s",
  },
  dotActive: {
    background: "#34d399",
    transform: "scale(1.25)",
  },
  navRow: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#111827",
    border: "1px solid #1e2d3d",
    borderRadius: 12,
    padding: "10px 18px",
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#34d399",
    border: "none",
    borderRadius: 12,
    padding: "10px 22px",
    color: "#0a0f1a",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  counter: {
    marginTop: 16,
    fontSize: 11,
    color: "#374151",
    letterSpacing: 0.5,
  },
};
