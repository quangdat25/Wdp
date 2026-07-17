import React from "react";
import { FaEye, FaCheck, FaTimes, FaUndoAlt } from "react-icons/fa";

export default function ViolationActionMenu({
  violation,
  onView,
  onApprove,
  onReject,
  onRevoke,
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
      <button
        title="Xem chi tiết"
        onClick={() => onView(violation)}
        style={{
          background: "#F3F4F6",
          color: "#4B5563",
          border: "none",
          width: 28,
          height: 28,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#E5E7EB")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#F3F4F6")}
      >
        <FaEye size={14} />
      </button>

      {violation.status === "PENDING" && (
        <>
          <button
            title="Duyệt"
            onClick={() => onApprove(violation)}
            style={{
              background: "#DCFCE7",
              color: "#16A34A",
              border: "none",
              width: 28,
              height: 28,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#BBF7D0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#DCFCE7")}
          >
            <FaCheck size={14} />
          </button>
          <button
            title="Từ chối"
            onClick={() => onReject(violation._id)}
            style={{
              background: "#FEE2E2",
              color: "#DC2626",
              border: "none",
              width: 28,
              height: 28,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FECACA")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#FEE2E2")}
          >
            <FaTimes size={14} />
          </button>
        </>
      )}

      {violation.status === "APPROVED" && (
        <button
          title="Thu hồi"
          onClick={() => onRevoke(violation)}
          style={{
            background: "#FEF3C7",
            color: "#D97706",
            border: "none",
            width: 28,
            height: 28,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#FDE68A")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#FEF3C7")}
        >
          <FaUndoAlt size={14} />
        </button>
      )}
    </div>
  );
}
