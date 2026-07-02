import React from "react";

function OverviewTab({ gateLogs, students, navigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Quick alert */}
      <div
        style={{
          background: "#FFEEC2",
          borderRadius: 12,
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid #FFD085"
        }}
      >
        <span style={{ fontSize: 16, color: "#9E5700", fontWeight: 700 }}>
          Cảnh báo an ninh: Phát hiện {gateLogs.filter(l => l.status === 'LATE').length} trường hợp ký túc vào muộn quá 23h hôm nay.
        </span>
        <button
          onClick={() => navigate("/staff/dashboard/security/history")}
          style={{
            background: "#D84315",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          Xem ngay
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>TỔNG SỐ XE RA VÀO / NGÀY</span>
          <h3 style={{ fontSize: 28, margin: "8px 0 0", color: "#0A4E9B", fontWeight: 800 }}>8,421</h3>
        </div>
        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>SINH VIÊN ĐÃ ĐIỂM DANH</span>
          <h3 style={{ fontSize: 28, margin: "8px 0 0", color: "#10B981", fontWeight: 800 }}>98.2%</h3>
        </div>
        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>VI PHẠM GHI NHẬN HÔM NAY</span>
          <h3 style={{ fontSize: 28, margin: "8px 0 0", color: "#EF4444", fontWeight: 800 }}>{students.reduce((acc, curr) => acc + curr.violations.length, 0)}</h3>
        </div>
      </div>

      {/* Recent violations card logs */}
      <div style={{ background: "#FFFFFF", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ background: "#0A4E9B", padding: "14px 20px", color: "#FFFFFF", fontSize: 18, fontWeight: 700 }}>
          Nhật Ký Vi Phạm An Ninh Mới Nhất
        </div>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          {students.flatMap(s => s.violations.map(v => ({ ...v, studentName: s.name, studentId: s.id, room: s.room, dom: s.dom }))).map((violation, index) => (
            <div
              key={index}
              style={{
                padding: "16px 20px",
                background: index % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <strong style={{ color: "#EF4444" }}>[{violation.type}]</strong> - {violation.studentName} ({violation.studentId})
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748B" }}>
                  Phòng {violation.room} - Tòa {violation.dom} • Lý do: {violation.description}
                </p>
              </div>
              <div style={{ fontWeight: 700, color: "#DC2626", fontSize: 13 }}>
                -{violation.pointsDeducted} điểm CFD
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
