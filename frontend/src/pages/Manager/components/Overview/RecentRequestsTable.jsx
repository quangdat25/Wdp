import React from 'react';
import { Card, StatusBadge } from '../../../../components/DashboardWidgets';
import { FaEllipsisV, FaFilter } from 'react-icons/fa';

export default function RecentRequestsTable({ bookingRequests }) {
  const requests = bookingRequests || [];

  return (
    <Card noPadding>
      <div style={{ padding: "24px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#111827" }}>Đơn đặt phòng gần đây</h3>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ padding: "8px 16px", background: "#fff", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <FaFilter style={{ color: "#6B7280" }} /> Lọc
          </button>
        </div>
      </div>
      
      <div style={{ width: "100%", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              <th style={{ padding: "12px 24px", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Sinh viên</th>
              <th style={{ padding: "12px 24px", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Phòng</th>
              <th style={{ padding: "12px 24px", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Loại đơn</th>
              <th style={{ padding: "12px 24px", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Trạng thái</th>
              <th style={{ padding: "12px 24px", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {requests.slice(0, 5).map((req, i) => {
              return (
                <tr key={req._id || i} style={{ borderBottom: "1px solid #E7EFEA", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#4B5563" }}>
                      {req.initials}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>{req.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>{req.code}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 600, color: "#111827" }}>{req.room === "--" ? "Chưa xếp" : req.room}</td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ fontSize: 13, color: "#4B5563" }}>Đặt phòng mới</span>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <StatusBadge status={req.status} />
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer" }}><FaEllipsisV /></button>
                  </td>
                </tr>
              );
            })}
            {bookingRequests.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: "32px", textAlign: "center", color: "#6B7280" }}>
                  Không có đơn đặt phòng nào gần đây
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "16px 24px", borderTop: "1px solid #E5E7EB", textAlign: "center" }}>
        <button style={{ color: "#16A34A", background: "none", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Xem tất cả đơn
        </button>
      </div>
    </Card>
  );
}
