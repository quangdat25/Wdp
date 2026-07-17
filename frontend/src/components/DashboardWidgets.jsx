import React from "react";

export function Card({ title, noPadding, children, style }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        border: "1px solid #E5E7EB",
        overflow: "hidden",
        ...style,
      }}
    >
      {title && (
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E7EB" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#111827" }}>
            {title}
          </h3>
        </div>
      )}
      <div style={{ padding: noPadding ? 0 : "24px" }}>{children}</div>
    </div>
  );
}

export function Button({ icon, label, primary, outline, danger, onClick, style }) {
  let bg = "#F3F4F6";
  let color = "#374151";
  let border = "1px solid transparent";

  if (primary) {
    bg = "#16A34A";
    color = "#ffffff";
  } else if (outline) {
    bg = "transparent";
    color = "#374151";
    border = "1px solid #D1D5DB";
  } else if (danger) {
    bg = "#FEE2E2";
    color = "#EF4444";
  }

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        borderRadius: "8px",
        background: bg,
        color: color,
        border: border,
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "opacity 0.2s",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

export function StatusBadge({ status }) {
  let bg = "#E5E7EB";
  let color = "#374151";
  let label = status;

  const lowerStatus = (status || "").toLowerCase();

  if (lowerStatus === "pending") {
    bg = "#FEF3C7";
    color = "#D97706";
    label = "Chờ xử lý";
  } else if (lowerStatus === "chờ thanh toán" || lowerStatus === "chờ xử lý") {
    bg = "#FEF3C7";
    color = "#D97706";
    label = status;
  } else if (
    lowerStatus === "confirmed" ||
    lowerStatus === "approved" ||
    lowerStatus === "hoàn tất" ||
    lowerStatus === "thành công"
  ) {
    bg = "#DCFCE7";
    color = "#16A34A";
    label = "Thành công";
  } else if (lowerStatus === "đã thanh toán" || lowerStatus === "đang ở") {
    bg = "#DCFCE7";
    color = "#16A34A";
    label = status;
  } else if (lowerStatus === "rejected" || lowerStatus === "cancelled") {
    bg = "#FEE2E2";
    color = "#EF4444";
    label = "Đã hủy";
  } else if (lowerStatus === "đã hủy") {
    bg = "#FEE2E2";
    color = "#EF4444";
    label = status;
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "999px",
        background: bg,
        color: color,
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

export function KpiCard({ title, value, icon, color, trend, sparkline, isNegative }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        border: "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#6B7280", fontWeight: 500 }}>
            {title}
          </p>
          <h2 style={{ margin: 0, fontSize: "24px", color: "#111827", fontWeight: 700 }}>
            {value}
          </h2>
        </div>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: `${color}15`,
            color: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: isNegative ? "#EF4444" : "#10B981",
          }}
        >
          {trend}
        </span>
        {sparkline && (
          <svg width="40" height="20" viewBox="0 0 40 20">
            <path
              d={sparkline}
              fill="none"
              stroke={isNegative ? "#EF4444" : "#10B981"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
