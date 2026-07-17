import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import {
  getAllSemesters,
  createSemester,
  updateSemester,
  setActiveSemester,
  deleteSemester,
} from "../../api/semesterService";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { Modal } from "antd";

function SemesterManagement() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    name: "Spring",
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
  });

  const { confirm } = Modal;

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const res = await getAllSemesters();
      setSemesters(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setFormData({
      name: "Spring",
      year: new Date().getFullYear(),
      startDate: "",
      endDate: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sem) => {
    setEditMode(true);
    setSelectedId(sem._id);
    setFormData({
      name: sem.name,
      year: sem.year,
      startDate: sem.startDate ? sem.startDate.split("T")[0] : "",
      endDate: sem.endDate ? sem.endDate.split("T")[0] : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateSemester(selectedId, {
          startDate: formData.startDate,
          endDate: formData.endDate,
        });
      } else {
        await createSemester(formData);
      }
      setShowModal(false);
      fetchSemesters();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi lưu kỳ học");
    }
  };

  const handleSetActive = async (id) => {
    try {
      await setActiveSemester(id);
      fetchSemesters();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi đổi kỳ hiện hành");
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa kỳ học này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      async onOk() {
        try {
          await deleteSemester(id);
          fetchSemesters();
        } catch (error) {
          alert(error.response?.data?.message || "Lỗi xóa kỳ học");
        }
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fbff 0%, #f3f8f6 100%)",
        display: "flex",
      }}
    >
      <Sidebar />

      <main
        style={{
          marginLeft: 270,
          width: "calc(100% - 270px)",
          padding: "24px 28px 32px",
        }}
      >
        <div
          style={{
            marginBottom: 24,
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(148, 163, 184, 0.16)",
            borderRadius: 24,
            padding: "22px 24px",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: 34, color: "#1e4f8f", margin: 0 }}>
              <FaCalendarAlt style={{ marginRight: 12, verticalAlign: "middle" }} />
              Quản lý kỳ học
            </h1>
          </div>
          <button
            onClick={handleOpenCreate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "12px 20px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(22, 163, 74, 0.22)",
            }}
          >
            <FaPlus /> Tạo kỳ học mới
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 16px 42px rgba(15, 23, 42, 0.07)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Đang tải...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Kỳ học</th>
                  <th style={thStyle}>Năm</th>
                  <th style={thStyle}>Ngày bắt đầu</th>
                  <th style={thStyle}>Ngày kết thúc</th>
                  <th style={thStyle}>Trạng thái</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {semesters.map((sem) => (
                  <tr key={sem._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{sem.name}</span>
                    </td>
                    <td style={tdStyle}>{sem.year}</td>
                    <td style={tdStyle}>{new Date(sem.startDate).toLocaleDateString("vi-VN")}</td>
                    <td style={tdStyle}>{new Date(sem.endDate).toLocaleDateString("vi-VN")}</td>
                    <td style={tdStyle}>
                      {sem.isActive ? (
                        <span style={activeTagStyle}>
                          <FaCheckCircle style={{ marginRight: 4 }} /> Đang hoạt động
                        </span>
                      ) : (
                        <span style={inactiveTagStyle}>Không hoạt động</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {!sem.isActive && (
                        <button
                          onClick={() => handleSetActive(sem._id)}
                          style={actionBtnStyle("#3b82f6", "rgba(59, 130, 246, 0.1)")}
                          title="Đặt làm kỳ hiện hành"
                        >
                          <FaCheckCircle /> Set Active
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(sem)}
                        style={actionBtnStyle("#f59e0b", "rgba(245, 158, 11, 0.1)")}
                        title="Sửa"
                      >
                        <FaEdit />
                      </button>
                      {!sem.isActive && (
                        <button
                          onClick={() => handleDelete(sem._id)}
                          style={actionBtnStyle("#ef4444", "rgba(239, 68, 68, 0.1)")}
                          title="Xóa"
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {semesters.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                      Chưa có kỳ học nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal form */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ margin: "0 0 20px", color: "#1e293b" }}>
              {editMode ? "Sửa kỳ học" : "Tạo kỳ học mới"}
            </h2>
            <form onSubmit={handleSubmit}>
              {!editMode && (
                <>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Tên kỳ học</label>
                    <select
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={inputStyle}
                      required
                    >
                      <option value="Spring">Spring (Xuân)</option>
                      <option value="Summer">Summer (Hè)</option>
                      <option value="Fall">Fall (Thu)</option>
                    </select>
                  </div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Năm học</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>
                </>
              )}
              {editMode && (
                <div style={{ marginBottom: 16, color: "#64748b" }}>
                  Đang sửa: <strong>{formData.name} - {formData.year}</strong>
                </div>
              )}
              <div style={formGroupStyle}>
                <label style={labelStyle}>Ngày bắt đầu</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Ngày kết thúc</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#475569",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: "none",
                    background: "#22c55e",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "16px",
  textAlign: "left",
  color: "#475569",
  fontWeight: 700,
  fontSize: 14,
  borderBottom: "2px solid #e2e8f0",
};

const tdStyle = {
  padding: "16px",
  color: "#64748b",
  fontSize: 14,
};

const activeTagStyle = {
  padding: "6px 12px",
  borderRadius: 12,
  background: "#dcfce7",
  color: "#16a34a",
  fontWeight: 600,
  fontSize: 12,
  display: "inline-flex",
  alignItems: "center",
};

const inactiveTagStyle = {
  padding: "6px 12px",
  borderRadius: 12,
  background: "#f1f5f9",
  color: "#64748b",
  fontWeight: 600,
  fontSize: 12,
};

const actionBtnStyle = (color, bg) => ({
  background: bg,
  color: color,
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  marginLeft: 8,
  cursor: "pointer",
  fontSize: 14,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
});

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(15, 23, 42, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "#fff",
  borderRadius: 24,
  padding: 32,
  width: "100%",
  maxWidth: 480,
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
};

const formGroupStyle = {
  marginBottom: 16,
};

const labelStyle = {
  display: "block",
  marginBottom: 8,
  color: "#475569",
  fontWeight: 600,
  fontSize: 14,
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  color: "#1e293b",
  outline: "none",
  boxSizing: "border-box",
};

export default SemesterManagement;
