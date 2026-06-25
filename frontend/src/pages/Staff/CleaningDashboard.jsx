import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import authService from "../../api/authService";
import { FaBell, FaExclamationTriangle } from "react-icons/fa";

// Initial fake data right inside the file
const initialCleanTasks = [
  {
    id: "C001",
    room: "103",
    dom: "A",
    type: "Dọn dẹp sau Check-out",
    dueDate: "2026-06-08 12:00",
    assignedTo: "Phạm Thị Liên",
    status: "PENDING",
    description: "Sinh viên khóa cũ vừa dọn đi. Cần lau dọn sạch, chà sàn phòng tắm và gom rác.",
    damageReported: null
  },
  {
    id: "C002",
    room: "204",
    dom: "B",
    type: "Vệ sinh định kỳ",
    dueDate: "2026-06-08 15:30",
    assignedTo: "Phạm Thị Liên",
    status: "CLEANING",
    description: "Vệ sinh hút bụi thường niên định kỳ kỳ hè.",
    damageReported: { description: "Gương phòng tắm bị rạn nứt góc dưới", date: "2026-06-08 09:30", severity: "MEDIUM", ticketId: "T601" }
  },
  {
    id: "C003",
    room: "305",
    dom: "C",
    type: "Chuẩn bị đón tân sinh viên",
    dueDate: "2026-06-07 17:00",
    assignedTo: "Cao Thị Hoa",
    status: "READY",
    description: "Phòng trống đón tân học viên kỳ mới. Đã lau dọn chà sạch sẽ, thay rèm mới.",
    damageReported: null
  }
];

function CleanerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Trang chủ");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
    else setActiveTab("Trang chủ");
  }, [location.search]);

  // State management inside the file
  const [cleanTasks, setCleanTasks] = useState(initialCleanTasks);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Defect reporting modal overlay states
  const [reportingTask, setReportingTask] = useState(null);
  const [damageForm, setDamageForm] = useState({
    description: "",
    severity: "MEDIUM"
  });

  const menuItems = [
    "Trang chủ",
    "Dọn dẹp phòng",
    "Sự cố kỹ thuật"
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/");
    }
  };

  // Mark room clean ready status handler
  const handleMarkReady = (taskId) => {
    const updated = cleanTasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status: "READY" };
      }
      return task;
    });
    setCleanTasks(updated);
    alert("Cập nhật thành công! Trạng thái phòng được ghi nhận Sẵn sàng đón khách.");
  };

  // Housekeeper defect reporting handler
  const handleReportDamageSubmit = (e) => {
    e.preventDefault();
    if (!damageForm.description.trim() || !reportingTask) return;

    const newTicketId = "T" + (Math.floor(Math.random() * 900) + 100);
    const updated = cleanTasks.map(task => {
      if (task.id === reportingTask.id) {
        return {
          ...task,
          damageReported: {
            description: damageForm.description.trim(),
            severity: damageForm.severity,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            ticketId: newTicketId
          }
        };
      }
      return task;
    });

    setCleanTasks(updated);
    alert(`Báo cáo hỏng hóc thành công! Đã tạo phiếu sự vụ sửa chữa ${newTicketId} gửi ban kỹ thuật.`);

    // Clear and close modal
    setDamageForm({ description: "", severity: "MEDIUM" });
    setReportingTask(null);
  };

  const filteredTasks = cleanTasks.filter(task => {
    if (filterStatus === "ALL") return true;
    return task.status === filterStatus;
  });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F5F6F8",
        fontFamily: "'Inter', sans-serif",
      }}
      id="cleaner-dashboard-container"
    >
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main dashboard contents */}
      <main
        style={{
          marginLeft: 270,
          flex: 1,
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {/* Top bar header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              fontSize: 28,
              color: "#0A4E9B",
              fontWeight: 800,
              margin: 0,
            }}
          >
            {activeTab === "Trang chủ" ? "Cleaner Board" : activeTab}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                cursor: "pointer",
              }}
            >
              <FaBell size={18} />
            </div>

            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#00E676",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000000",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              LC
            </div>
          </div>
        </header>

        {/* Dashboard index content */}
        {activeTab === "Trang chủ" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Quick alert bar */}
            <div
              style={{
                background: "#D1E9FA",
                borderRadius: 12,
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #99D1F9"
              }}
            >
              <span style={{ fontSize: 16, color: "#1D4180", fontWeight: 700 }}>
                Kế hoạch hôm nay: Bạn có {cleanTasks.filter(t => t.status !== "READY").length} phòng đang ở diện vệ sinh dọn dẹp bàn giao.
              </span>
              <button
                onClick={() => navigate("/staff/dashboard/cleaner?tab=Dọn dẹp phòng")}
                style={{
                  background: "#0D47A1",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Nhận lịch
              </button>
            </div>

            {/* Operational grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>PHÒNG CHỜ DỌN</span>
                <h3 style={{ fontSize: 28, margin: "8px 0 0", color: "#FF9100", fontWeight: 800 }}>
                  {cleanTasks.filter(t => t.status === 'PENDING').length}
                </h3>
              </div>
              <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>ĐANG DỌN DẸP</span>
                <h3 style={{ fontSize: 28, margin: "8px 0 0", color: "#0A4E9B", fontWeight: 800 }}>
                  {cleanTasks.filter(t => t.status === 'CLEANING').length}
                </h3>
              </div>
              <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>ĐÃ XONG SẴN SÀNG</span>
                <h3 style={{ fontSize: 28, margin: "8px 0 0", color: "#10B981", fontWeight: 800 }}>
                  {cleanTasks.filter(t => t.status === 'READY').length}
                </h3>
              </div>
            </div>

            {/* List of critical cleaning issues */}
            <div style={{ background: "#FFFFFF", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ background: "#0D47A1", padding: "14px 20px", color: "#FFFFFF", fontSize: 18, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Tiến độ phân bổ dọn dẹp các tòa nhà</span>
                <span style={{ fontSize: 12, opacity: 0.9 }}>Cập nhật tự động</span>
              </div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span>Tòa KTX A</span>
                  <strong>{cleanTasks.filter(t => t.dom === "A" && t.status === "READY").length} / {cleanTasks.filter(t => t.dom === "A").length} phòng đã xong</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span>Tòa KTX B</span>
                  <strong>{cleanTasks.filter(t => t.dom === "B" && t.status === "READY").length} / {cleanTasks.filter(t => t.dom === "B").length} phòng đã xong</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span>Tòa KTX C</span>
                  <strong>{cleanTasks.filter(t => t.dom === "C" && t.status === "READY").length} / {cleanTasks.filter(t => t.dom === "C").length} phòng đã xong</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cleaning tasks check lists list */}
        {activeTab === "Dọn dẹp phòng" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Status filters */}
            <div style={{ display: "flex", gap: 8 }}>
              {["ALL", "PENDING", "CLEANING", "READY"].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 14,
                    border: filterStatus === status ? "none" : "1px solid #CBD5E1",
                    background: filterStatus === status ? "#0D47A1" : "white",
                    color: filterStatus === status ? "white" : "#475569",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {status === "ALL" ? "Tất cả" : status === "PENDING" ? "Chờ dọn" : status === "CLEANING" ? "Đang dọn" : "Sẵn sàng"}
                </button>
              ))}
            </div>

            {/* List grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    padding: 20,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <h4 style={{ margin: 0, color: "#0F172A", fontSize: 16 }}>Phòng {task.room} - Tòa {task.dom}</h4>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: 10,
                        fontSize: 10,
                        fontWeight: 700,
                        background: task.status === "PENDING" ? "#FEE2E2" : task.status === "CLEANING" ? "#DBEAFE" : "#D1FAE5",
                        color: task.status === "PENDING" ? "#991B1B" : task.status === "CLEANING" ? "#1E40AF" : "#065F46"
                      }}>
                        {task.status === "PENDING" ? "Chờ dọn" : task.status === "CLEANING" ? "Đang dọn" : "Sẵn sàng"}
                      </span>
                    </div>

                    <p style={{ fontSize: 11, color: "#64748B", margin: "4px 0" }}>Phân loại: <strong>{task.type}</strong> | Hạn: {task.dueDate}</p>
                    <p style={{ fontSize: 13, color: "#475569", margin: "10px 0" }}>{task.description}</p>

                    {task.damageReported && (
                      <div style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 8, padding: 10, fontSize: 12, color: "#991B1B", margin: "8px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
                          <FaExclamationTriangle /> Đã có báo cáo sự cố hư hại:
                        </div>
                        <p style={{ margin: "2px 0 0 0" }}>{task.damageReported.description} (Mã phiếu: {task.damageReported.ticketId})</p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, borderTop: "1px solid #F1F5F9", paddingTop: 12, marginTop: 12 }}>
                    {task.status !== "READY" && (
                      <button
                        onClick={() => handleMarkReady(task.id)}
                        style={{
                          flex: 1,
                          background: "#10B981",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Dọn phòng xong
                      </button>
                    )}

                    {!task.damageReported && task.status !== "READY" && (
                      <button
                        onClick={() => setReportingTask(task)}
                        style={{
                          flex: 1,
                          background: "#EF4444",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Báo cáo hỏng hóc
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reported damages logs */}
        {activeTab === "Sự cố kỹ thuật" && (
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#0A4E9B" }}>Danh Sách Tiện Nghi Sự Cố Đã Báo Cáo</h3>

            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E2E8F0", background: "#F8FAFC" }}>
                  <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>Mã Phiếu kỹ thuật</th>
                  <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>Khu vực Phòng</th>
                  <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>Mô tả Hỏng Hóc</th>
                  <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>Ngày báo</th>
                  <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>Mức độ</th>
                </tr>
              </thead>
              <tbody>
                {cleanTasks.filter(t => t.damageReported).map(t => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <td style={{ padding: 12, fontFamily: "monospace", fontWeight: 700 }}>{t.damageReported.ticketId}</td>
                    <td style={{ padding: 12 }}>Phòng {t.room} - Tòa {t.dom}</td>
                    <td style={{ padding: 12 }}>{t.damageReported.description}</td>
                    <td style={{ padding: 12, fontSize: 13 }}>{t.damageReported.date}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: 12,
                        fontSize: 10,
                        background: t.damageReported.severity === "HIGH" ? "#FEE2E2" : "#FEF3C7",
                        color: t.damageReported.severity === "HIGH" ? "#991B1B" : "#92400E",
                        fontWeight: 700
                      }}>
                        {t.damageReported.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Report Damage Modal Dialog */}
      {reportingTask && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", alignContent: "center", padding: 20 }}>
          {/* Backdrop blur */}
          <div
            onClick={() => setReportingTask(null)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
          />

          <form
            onSubmit={handleReportDamageSubmit}
            style={{ position: "relative", zIndex: 110, background: "white", padding: 24, borderRadius: 16, width: "100%", maxWidth: 450, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
          >
            <h3 style={{ margin: "0 0 16px 0", color: "#EF4444" }}>Báo cáo hư hại vật tư phòng</h3>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Khởi tạo yêu cầu kỹ thuật cho <strong>Phòng {reportingTask.room} (Tòa {reportingTask.dom})</strong></p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Mức độ hư hại</label>
                <select
                  value={damageForm.severity}
                  onChange={(e) => setDamageForm({ ...damageForm, severity: e.target.value })}
                  style={{ padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13, background: "white" }}
                >
                  <option value="LOW">Thấp (Chờ khắc phục)</option>
                  <option value="MEDIUM">Vừa phải</option>
                  <option value="HIGH">Nghiêm trọng (Cản trở sinh hoạt)</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Mô tả chi tiết</label>
                <textarea
                  rows="3"
                  placeholder="Gương vỡ, vòi nước rò rỉ, bóng đèn chớp tắt..."
                  value={damageForm.description}
                  onChange={(e) => setDamageForm({ ...damageForm, description: e.target.value })}
                  style={{ padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyEnd: "flex-end", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setReportingTask(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  background: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#EF4444",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Tạo báo cáo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CleanerDashboard;
