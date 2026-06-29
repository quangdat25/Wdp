import React, { useState } from "react";
import { createViolation } from "../../../api/violationService";
import { showSuccess, showError } from "../../../components/alert"; // Giả sử có sẵn hàm alert

function CreateReportTab() {
  const [violationForm, setViolationForm] = useState({
    studentCode: "",
    studentName: "",
    location: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCreateViolation = async (e) => {
    e.preventDefault();
    if (!violationForm.studentCode || !violationForm.studentName || !violationForm.reason) {
      showError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      const data = await createViolation(violationForm);
      showSuccess(data.message || "Lập biên bản thành công! Chờ quản lý duyệt.");
      
      // Clear form sau khi thành công
      setViolationForm({
        studentCode: "",
        studentName: "",
        location: "Sảnh Tòa Nhà",
        reason: "",
      });
    } catch (err) {
      showError(err.response?.data?.message || "Có lỗi xảy ra khi tạo biên bản!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <h3 style={{ margin: "0 0 20px 0", color: "#0A4E9B" }}>Khai báo biên bản sự vụ quy chế</h3>
      <form onSubmit={handleCreateViolation} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>MSSV vi phạm</label>
            <input
              type="text"
              placeholder="VD: HE150000"
              value={violationForm.studentCode}
              onChange={(e) => setViolationForm({ ...violationForm, studentCode: e.target.value.toUpperCase() })}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14 }}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Họ tên sinh viên</label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn A"
              value={violationForm.studentName}
              onChange={(e) => setViolationForm({ ...violationForm, studentName: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14 }}
              required
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Địa điểm phát hiện</label>
          <input
            type="text"
            placeholder="VD: Sảnh Tòa Nhà, Hành lang tầng 3..."
            value={violationForm.location}
            onChange={(e) => setViolationForm({ ...violationForm, location: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14 }}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Lý do / Hành vi vi phạm chi tiết</label>
          <textarea
            rows="4"
            placeholder="Mô tả cụ thể hành vi vi phạm (VD: Vào muộn lúc 23:45, nồng nặc mùi bia rượu...)"
            value={violationForm.reason}
            onChange={(e) => setViolationForm({ ...violationForm, reason: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14 }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? "#94A3B8" : "#DC2626",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 8,
            padding: "12px 24px",
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 10,
            transition: "all 0.2s"
          }}
        >
          {loading ? "Đang xử lý..." : "Lập Biên Bản & Gửi Lên Manager"}
        </button>
      </form>
    </div>
  );
}

export default CreateReportTab;
