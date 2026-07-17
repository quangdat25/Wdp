import React from "react";
import ViolationStatusBadge from "./ViolationStatusBadge";
import ViolationActionMenu from "./ViolationActionMenu";
import { formatDateTime } from "../../../../utils/date";

export default function ViolationTable({
  violations,
  onView,
  onApprove,
  onReject,
  onRevoke,
}) {
  if (!violations || violations.length === 0) {
    return (
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: 64,
        textAlign: "center",
        border: "1px solid #E7EFEA",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: "#111827" }}>
          Không tìm thấy biên bản vi phạm
        </h3>
        <p style={{ margin: 0, fontSize: 14, color: "#6B7280", maxWidth: 400, marginInline: "auto" }}>
          Hiện tại không có biên bản vi phạm nào khớp với bộ lọc đã chọn. Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #E7EFEA",
      overflow: "hidden"
    }}>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Sinh viên</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Địa điểm</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Lý do vi phạm</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Người báo cáo</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Ngày tạo</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Trạng thái</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {violations.map((v) => {
              const nameInitials = v.studentId?.fullName?.substring(0, 2).toUpperCase() || "SV";

              return (
                <tr 
                  key={v._id} 
                  style={{ borderBottom: "1px solid #E7EFEA", transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "#DCFCE7",
                        color: "#16A34A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700
                      }}>
                        {nameInitials}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>
                          {v.studentId?.fullName || "N/A"}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>
                          {v.studentId?.studentCode || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#374151" }}>
                      Tòa {v.buildingId?.name || "N/A"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>
                      Phòng {v.studentId?.roomId?.roomNumber || "N/A"}
                    </p>
                  </td>
                  <td style={{ padding: "16px 24px", maxWidth: 250 }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {v.reason}
                    </p>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>{v.securityId?.fullName || "N/A"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>Nhân viên</p>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: 14, color: "#6B7280" }}>
                    {formatDateTime(v.createdAt)}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <ViolationStatusBadge status={v.status} />
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <ViolationActionMenu 
                      violation={v}
                      onView={onView}
                      onApprove={onApprove}
                      onReject={onReject}
                      onRevoke={onRevoke}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
