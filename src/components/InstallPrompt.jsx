import { useState, useEffect } from "react";
import { Download, X, Share, Plus } from "lucide-react";

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

// ── iOS step-by-step bottom sheet ─────────────────────────────────────────────
function IOSGuide({ onClose }) {
  const steps = [
    {
      icon: <Share size={20} color="#34d399" />,
      label: "Tap the Share button",
      sub: "The box-with-arrow icon at the bottom of Safari",
    },
    {
      icon: <Plus size={20} color="#34d399" />,
      label: 'Tap "Add to Home Screen"',
      sub: "Scroll down in the share sheet if needed",
    },
    {
      icon: (
        <span style={{ fontSize: 18, fontWeight: 700, color: "#34d399" }}>✓</span>
      ),
      label: 'Tap "Add" to confirm',
      sub: "ECOAMP will appear on your home screen",
    },
  ];

  return (
    <div style={modal.overlay}>
      <div style={modal.box}>
        {/* header */}
        <div style={modal.header}>
          <img
            src="/logo.png"
            alt="ECOAMP"
            style={{ width: 40, height: 40, objectFit: "contain" }}
          />
          <div>
            <div style={modal.title}>Install ECOAMP</div>
            <div style={modal.sub}>Follow these steps in Safari</div>
          </div>
          <button style={modal.closeBtn} onClick={onClose}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        <div style={modal.divider} />

        {/* steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {steps.map((step, i) => (
            <div key={i} style={modal.stepRow}>
              <div style={modal.stepNum}>{i + 1}</div>
              <div style={modal.stepIcon}>{step.icon}</div>
              <div>
                <div style={modal.stepLabel}>{step.label}</div>
                <div style={modal.stepSub}>{step.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* tip */}
        <div style={modal.tip}>
          💡 Works best in Safari. If you're using Chrome or another browser,
          open this page in Safari first.
        </div>

        {/* bottom hint */}
        <div style={modal.arrowHint}>
          <Share size={14} color="#34d399" style={{ marginRight: 6 }} /