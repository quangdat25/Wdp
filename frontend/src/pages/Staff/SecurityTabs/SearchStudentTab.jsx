import React from "react";

function SearchStudentTab({ students, selectedStudent, setSelectedStudent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <h4 style={{ margin: "0 0 12px 0", color: "#64748B" }}>Tra cứu học vụ & chỉ số uy tín (CFD Profile)</h4>
        <div style={{ display: "flex", gap: 12 }}>
          <select
            value={selectedStudent ? selectedStudent.id : ""}
            onChange={(e) => {
              const studentObj = students.find(s => s.id === e.target.value);
              setSelectedStudent(studentObj);
            }}
            style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, background: "white" }}
          >
            <option value="">-- Chọn sinh viên để xem lý lịch chi tiết --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.id}) - Phòng {s.room}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedStudent ? (
        <div style={{ background: "#FFFFFF", padding: 28, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #F1F5F9", paddingBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, color: "#0F172A" }}>{selectedStudent.name}</h2>
              <span style={{ fontSize: 14, color: "#64748B" }}>Mã sinh viên: <strong>{selectedStudent.id}</strong> | Phòng: {selectedStudent.room} - Tòa {selectedStudent.dom}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>ĐIỂM CFD UY TÍN</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: selectedStudent.cfdScore >= 80 ? "#10B981" : selectedStudent.cfdScore >= 50 ? "#F59E0B" : "#EF4444" }}>
                {selectedStudent.cfdScore} / 100
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <h4 style={{ margin: "0 0 12px 0", color: "#0A4E9B" }}>Thông tin liên hệ</h4>
              <p style={{ margin: "6px 0", fontSize: 14 }}>Số điện thoại: <strong>{selectedStudent.phone}</strong></p>
              <p style={{ margin: "6px 0", fontSize: 14 }}>Email: <strong>{selectedStudent.email}</strong></p>
            </div>
            <div>
              <h4 style={{ margin: "0 0 12px 0", color: "#0A4E9B" }}>Người bảo hộ / Phụ huynh</h4>
              <p style={{ margin: "6px 0", fontSize: 14 }}>Họ tên: <strong>{selectedStudent.parentName}</strong></p>
              <p style={{ margin: "6px 0", fontSize: 14 }}>SĐT liên hệ: <strong>{selectedStudent.parentPhone}</strong></p>
            </div>
          </div>

          <div>
            <h4 style={{ margin: "0 0 12px 0", color: "#0A4E9B" }}>Tiền án vi phạm nội quy ({selectedStudent.violations.length})</h4>
            {selectedStudent.violations.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedStudent.violations.map((violation) => (
                  <div key={violation.id} style={{ border: "1px solid #F1F5F9", padding: 12, borderRadius: 8, background: "#F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#EF4444" }}>[{violation.type}]</strong> - Ngày: {violation.date}
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748B" }}>{violation.description}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#DC2626" }}>-{violation.pointsDeducted} CFD</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#10B981", fontWeight: 600, fontStyle: "italic", fontSize: 13 }}>Không có tiền lệ vi phạm. Sinh viên gương mẫu!</div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ border: "2px dashed #CBD5E1", borderRadius: 16, padding: 48, textAlign: "center", color: "#64748B" }}>
          Vui lòng chọn thông tin sinh viên từ danh mục thả bên trên để hiển thị lịch sử nghiệp vụ.
        </div>
      )}
    </div>
  );
}

export default SearchStudentTab;
