import React, { useState } from "react";
import { FaSearch, FaPlusCircle } from "react-icons/fa";

function GateHistoryTab({ gateLogs, setGateLogs, students, setSelectedStudent, navigate }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = gateLogs.filter(log => 
    log.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.studentId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.room.includes(searchQuery)
  );

  return (
    <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyBetween: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", width: 300 }}>
          <input
            type="text"
            placeholder="Lọc sinh viên/Số phòng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 32px",
              border: "1px solid #CBD5E1",
              borderRadius: 8,
              fontSize: 14
            }}
          />
          <FaSearch style={{ position: "absolute", left: 10, top: 12, color: "#94A3B8" }} />
        </div>
        
        <button
          onClick={() => {
            const newLog = {
              id: "G" + (gateLogs.length + 101),
              studentId: "SV001",
              studentName: "Nguyễn Hoàng Nam",
              room: "302",
              dom: "A",
              time: new Date().toISOString().replace('T', ' ').substring(0, 19),
              direction: "IN",
              status: "NORMAL"
            };
            setGateLogs([newLog, ...gateLogs]);
          }}
          style={{
            background: "#10B981",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <FaPlusCircle /> Quét thẻ ảo (Simulate Tap)
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #E2E8F0", background: "#F8FAFC" }}>
            <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>Sinh viên</th>
            <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>MSSV</th>
            <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>Phòng/Hệ</th>
            <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>Thời gian</th>
            <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>Hướng</th>
            <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>Trạng thái</th>
            <th style={{ padding: 12, fontSize: 13, color: "#64748B", textAlign: "center" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map(log => (
            <tr key={log.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
              <td style={{ padding: 12, fontWeight: 600 }}>{log.studentName}</td>
              <td style={{ padding: 12, fontFamily: "monospace" }}>{log.studentId}</td>
              <td style={{ padding: 12 }}>Phòng {log.room} - Tòa {log.dom}</td>
              <td style={{ padding: 12, fontSize: 13 }}>{log.time}</td>
              <td style={{ padding: 12 }}>
                <span style={{
                  padding: "3px 8px",
                  borderRadius: 12,
                  fontSize: 11,
                  background: log.direction === "IN" ? "#D1FAE5" : "#DBEAFE",
                  color: log.direction === "IN" ? "#065F46" : "#1E40AF",
                  fontWeight: 700
                }}>
                  {log.direction}
                </span>
              </td>
              <td style={{ padding: 12 }}>
                <span style={{
                  padding: "3px 8px",
                  borderRadius: 12,
                  fontSize: 11,
                  background: log.status === "LATE" ? "#FEE2E2" : "#F1F5F9",
                  color: log.status === "LATE" ? "#991B1B" : "#475569",
                  fontWeight: 700
                }}>
                  {log.status === "LATE" ? "Vào trễ" : "Bình thường"}
                </span>
              </td>
              <td style={{ padding: 12, textAlign: "center" }}>
                <button
                  onClick={() => {
                    const studentObj = students.find(s => s.id === log.studentId);
                    setSelectedStudent(studentObj);
                    navigate("/staff/dashboard/security/search");
                  }}
                  style={{
                    background: "#E2E8F0",
                    border: "none",
                    color: "#334155",
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Thông tin SV
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GateHistoryTab;
