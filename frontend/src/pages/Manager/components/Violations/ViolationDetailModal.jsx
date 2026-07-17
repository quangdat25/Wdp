import React, { useState } from "react";
import { FaTimes, FaCheck, FaUndoAlt } from "react-icons/fa";
import ViolationStatusBadge from "./ViolationStatusBadge";
import { formatDateTime } from "../../../../utils/date";

export default function ViolationDetailModal({
  violation,
  onClose,
  onApprove,
  onReject,
  onRevoke
}) {
  const [points, setPoints] = useState(5);
  const [revokeReason, setRevokeReason] = useState("");

  if (!violation) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(2px)"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 20,
        width: 600,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 10
        }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>
            Chi tiết vi phạm
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}>
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Sinh viên */}
          <div>
            <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#4B5563" }}>Thông tin sinh viên</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
                {violation.studentId?.fullName?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>{violation.studentId?.fullName}</p>
                <p style={{ margin: "2px 0 0", fontSize: 14, color: "#6B7280" }}>MSV: {violation.studentId?.studentCode} • Tòa {violation.buildingId?.name} • Phòng {violation.studentId?.roomId?.roomNumber}</p>
              </div>
            </div>
          </div>

          {/* Chi tiết */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "#6B7280" }}>Trạng thái</p>
              <ViolationStatusBadge status={violation.status} />
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "#6B7280" }}>Ngày báo cáo</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#111827" }}>{formatDateTime(violation.createdAt)}</p>
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "#6B7280" }}>Địa điểm vi phạm</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#111827" }}>{violation.location}</p>
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "#6B7280" }}>Người báo cáo</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#111827" }}>{violation.securityId?.fullName}</p>
            </div>
            {(violation.status === "APPROVED" || violation.status === "REVOKED") && (
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 13, color: "#6B7280" }}>Điểm bị trừ</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#EF4444" }}>-{violation.pointsDeducted} CFD</p>
              </div>
            )}
          </div>

          {/* Lý do */}
          <div>
            <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "#4B5563" }}>Lý do vi phạm</h4>
            <div style={{ background: "#F9FAFB", padding: 16, borderRadius: 12, border: "1px solid #E5E7EB" }}>
              <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.5 }}>
                {violation.reason}
              </p>
            </div>
          </div>

          {violation.status === "REVOKED" && (
            <div>
              <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "#4B5563" }}>Lý do thu hồi</h4>
              <div style={{ background: "#FFFBEB", padding: 16, borderRadius: 12, border: "1px solid #FDE68A" }}>
                <p style={{ margin: 0, fontSize: 14, color: "#B45309", lineHeight: 1.5 }}>
                  {violation.revokeReason}
                </p>
              </div>
            </div>
          )}

          {/* Input Action cho Pending */}
          {violation.status === "PENDING" && (
            <div style={{ marginTop: 8 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4B5563", marginBottom: 8 }}>
                Mức điểm phạt (nếu duyệt)
              </label>
              <input
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                style={{ width: 120, padding: "10px 16px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14 }}
              />
            </div>
          )}

          {/* Input Action cho Revoke */}
          {violation.status === "APPROVED" && (
            <div style={{ marginTop: 8 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4B5563", marginBottom: 8 }}>
                Lý do thu hồi (Bắt buộc nếu thu hồi)
              </label>
              <textarea
                rows={2}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Nhập lý do..."
                style={{ width: "100%", padding: "10px 16px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "inherit" }}
              />
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid #E5E7EB",
          background: "#F9FAFB",
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20
        }}>
          <button onClick={onClose} style={{ padding: "10px 20px", background: "#fff", border: "1px solid #D1D5DB", borderRadius: 8, fontWeight: 600, color: "#4B5563", cursor: "pointer" }}>
            Đóng
          </button>
          
          {violation.status === "PENDING" && (
            <>
              <button onClick={() => onReject(violation._id)} style={{ padding: "10px 20px", background: "#FEE2E2", border: "none", borderRadius: 8, fontWeight: 600, color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <FaTimes /> Từ chối
              </button>
              <button onClick={() => onApprove(violation, points)} style={{ padding: "10px 20px", background: "#22C55E", border: "none", borderRadius: 8, fontWeight: 600, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <FaCheck /> Duyệt
              </button>
            </>
          )}

          {violation.status === "APPROVED" && (
            <button onClick={() => onRevoke(violation, revokeReason)} style={{ padding: "10px 20px", background: "#F59E0B", border: "none", borderRadius: 8, fontWeight: 600, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <FaUndoAlt /> Thu hồi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
