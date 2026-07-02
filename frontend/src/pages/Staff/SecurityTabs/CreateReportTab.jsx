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
    <div className="bg-[#F6FAF5] rounded-2xl p-7 shadow-sm border border-gray-200">
      <h3 className="m-0 mb-5 text-[#0A4E9B] text-xl font-bold">Khai báo biên bản sự vụ quy chế</h3>
      <form onSubmit={handleCreateViolation} className="flex flex-col gap-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">MSSV vi phạm</label>
            <input
              type="text"
              placeholder="VD: HE150000"
              value={violationForm.studentCode}
              onChange={(e) => setViolationForm({ ...violationForm, studentCode: e.target.value.toUpperCase() })}
              className="p-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Họ tên sinh viên</label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn A"
              value={violationForm.studentName}
              onChange={(e) => setViolationForm({ ...violationForm, studentName: e.target.value })}
              className="p-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700">Địa điểm phát hiện</label>
          <input
            type="text"
            placeholder="VD: Sảnh Tòa Nhà, Hành lang tầng 3..."
            value={violationForm.location}
            onChange={(e) => setViolationForm({ ...violationForm, location: e.target.value })}
            className="p-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700">Lý do / Hành vi vi phạm chi tiết</label>
          <textarea
            rows="4"
            placeholder="Mô tả cụ thể hành vi vi phạm (VD: Vào muộn lúc 23:45, nồng nặc mùi bia rượu...)"
            value={violationForm.reason}
            onChange={(e) => setViolationForm({ ...violationForm, reason: e.target.value })}
            className="p-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-2.5 py-3 px-6 rounded-lg text-white font-bold text-[15px] border-none transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 cursor-pointer"}`}
        >
          {loading ? "Đang xử lý..." : "Lập Biên Bản & Gửi Lên Manager"}
        </button>
      </form>
    </div>
  );
}

export default CreateReportTab;
