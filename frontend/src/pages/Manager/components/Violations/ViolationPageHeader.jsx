import React from "react";
import { FaExclamationCircle, FaCheckCircle, FaTimesCircle, FaUndoAlt } from "react-icons/fa";

function StatCard({ title, count, icon, color, bg }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      padding: 16,
      display: "flex",
      alignItems: "center",
      gap: 16,
      border: "1px solid #E7EFEA",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: bg,
        color: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 13, color: "#6B7280", fontWeight: 600 }}>{title}</p>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#111827" }}>{count}</p>
      </div>
    </div>
  );
}

export default function ViolationPageHeader({ stats }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 700, color: "#111827" }}>
          Quản lý kỷ luật
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#6B7280" }}>
          Xem xét và xử lý các biên bản vi phạm kỷ luật của sinh viên do nhân viên báo cáo.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard 
          title="Chờ xử lý" 
          count={stats.pending} 
          icon={<FaExclamationCircle />} 
          color="#F59E0B" 
          bg="#FEF3C7" 
        />
        <StatCard 
          title="Đã duyệt" 
          count={stats.approved} 
          icon={<FaCheckCircle />} 
          color="#22C55E" 
          bg="#DCFCE7" 
        />
        <StatCard 
          title="Từ chối" 
          count={stats.rejected} 
          icon={<FaTimesCircle />} 
          color="#EF4444" 
          bg="#FEE2E2" 
        />
        <StatCard 
          title="Đã thu hồi" 
          count={stats.revoked} 
          icon={<FaUndoAlt />} 
          color="#6B7280" 
          bg="#F3F4F6" 
        />
      </div>
    </div>
  );
}
