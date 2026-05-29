// Reusable skeleton loader components

function SkeletonBox({ width = "100%", height = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: "linear-gradient(90deg, #111827 25%, #1a2235 50%, #111827 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
      ...style,
    }} />
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SkeletonBox width={180} height={26} />
          <SkeletonBox width={120} height={14} />
        </div>
        <SkeletonBox width={200} height={36} radius={8} />
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ background: "#0d1321", border: "1px solid #1a2235", borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <SkeletonBox width="60%" height={12} />
            <SkeletonBox width="80%" height={28} />
            <SkeletonBox width="50%" height={12} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1, background: "#0d1321", border: "1px solid #1a2235", borderRadius: 12, padding: 20 }}>
          <SkeletonBox width={160} height={16} style={{ marginBottom: 16 }} />
          <SkeletonBox width="100%" height={200} radius={8} />
        </div>
        <div style={{ flex: "0 0 300px", background: "#0d1321", border: "1px solid #1a2235", borderRadius: 12, padding: 20 }}>
          <SkeletonBox width={120} height={16} style={{ marginBottom: 16 }} />
          <SkeletonBox width="100%" height={200} radius={8} />
        </div>
      </div>
    </div>
  );
}

export function AppliancesSkeleton() {
  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <SkeletonBox width={160} height={26} />
        <SkeletonBox width={120} height={36} radius={8} />
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {[...Array(4)].map((_, i) => <SkeletonBox key={i} width={120} height={64} radius={10} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ background: "#0d1321", border: "1px solid #1a2235", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <SkeletonBox width={40} height={40} radius={10} />
            <SkeletonBox width="70%" height={14} />
            <SkeletonBox width="40%" height={12} />
            <SkeletonBox width="100%" height={8} radius={4} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkeletonBox;
