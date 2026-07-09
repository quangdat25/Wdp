import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export function Card({ title, subtitle, children, noPadding, style }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E7EFEA", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", padding: noPadding ? 0 : 24, display: "flex", flexDirection: "column", ...style }}>
      {(title || subtitle) && !noPadding && (
        <div style={{ marginBottom: children ? 16 : 0 }}>
          {title && <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>{title}</h3>}
          {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>{subtitle}</p>}
        </div>
      )}
      {noPadding && title && (
        <div style={{ padding: "24px 24px 0" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

export function KpiCard({ title, value, icon, color, trend, sparkline, isNegative }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #E7EFEA", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          {icon}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: isNegative ? "#EF4444" : "#22C55E", background: isNegative ? "#FEE2E2" : "#DCFCE7", padding: "4px 8px", borderRadius: 999 }}>
          {isNegative ? <FaArrowDown size={10} /> : <FaArrowUp size={10} />} {trend}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#6B7280", marginBottom: 4 }}>{title}</p>
      <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "#111827" }}>{value}</p>
      <svg style={{ position: "absolute", bottom: -5, left: 0, width: "100%", height: 40 }} viewBox="0 0 40 20" preserveAspectRatio="none">
        <path d={sparkline} fill="none" stroke={color} strokeWidth="2" opacity="0.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Button({ icon, label, primary, outline, danger, onClick, style }) {
  const isPrimary = primary;
  const isOutline = outline;
  const isDanger = danger;

  let bg = "#fff";
  let color = "#374151";
  let border = "1px solid #E7EFEA";

  if (isPrimary) {
    bg = "#22C55E";
    color = "#fff";
    border = "none";
  } else if (isOutline) {
    bg = "#fff";
    color = "#22C55E";
    border = "2px solid #22C55E";
  } else if (isDanger) {
    bg = "#fff";
    color = "#EF4444";
    border = "2px solid #EF4444";
  }

  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", gap: 12, borderRadius: 12, border: border, background: bg, color: color, cursor: "pointer", transition: "all 0.2s", ...style }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; if(isOutline) e.currentTarget.style.background="#f0fdf4"; if(isDanger) e.currentTarget.style.background="#fef2f2"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; if(isOutline||isDanger) e.currentTarget.style.background="#fff"; }}>
      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
    </button>
  );
}

export function StatusBadge({ status, colorOverride, bgOverride }) {
  let bg = "#F3F4F6";
  let text = "#374151";

  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'RESOLVED':
    case 'COMPLETED':
      bg = "#DCFCE7";
      text = "#16A34A";
      break;
    case 'PENDING':
    case 'IN_PROGRESS':
    case 'OPEN':
      bg = "#FEF3C7";
      text = "#D97706";
      break;
    case 'REJECTED':
    case 'MAINTENANCE':
    case 'URGENT':
      bg = "#FEE2E2";
      text = "#DC2626";
      break;
    case 'AVAILABLE':
      bg = "#E0E7FF";
      text = "#4F46E5";
      break;
    case 'FULL':
      bg = "#F3F4F6";
      text = "#4B5563";
      break;
    default:
      break;
  }

  if (colorOverride) text = colorOverride;
  if (bgOverride) bg = bgOverride;

  return (
    <span style={{ padding: "4px 8px", background: bg, color: text, borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}
