import React from "react";

export default function ViolationStatusBadge({ status }) {
  let config = { label: status, bg: "#F3F4F6", color: "#4B5563" };

  switch (status) {
    case "PENDING":
      config = { label: "Chờ xử lý", bg: "#FEF3C7", color: "#D97706" };
      break;
    case "APPROVED":
      config = { label: "Đã duyệt", bg: "#DCFCE7", color: "#16A34A" };
      break;
    case "REJECTED":
      config = { label: "Từ chối", bg: "#FEE2E2", color: "#DC2626" };
      break;
    case "REVOKED":
      config = { label: "Đã thu hồi", bg: "#F3F4F6", color: "#4B5563" };
      break;
    default:
      break;
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
