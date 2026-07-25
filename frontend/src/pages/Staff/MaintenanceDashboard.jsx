import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../api/authService";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { Pagination } from "antd";
import { getStaffTickets, updateTicketStatus } from "../../api/ticketService";
import "./MaintenanceDashboard.css";

function MaintenanceDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("Trang chủ");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [activeTask, setActiveTask] = useState(null);
  const [toast, setToast] = useState(null);
  const [resolutionText, setResolutionText] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.endsWith("/tasks")) {
      setActiveTab("Danh sách sự cố");
    } else if (path.endsWith("/create")) {
      setActiveTab("Lập phiếu sự cố");
    } else {
      setActiveTab("Trang chủ");
    }
    setCurrentPage(1);
  }, [location.pathname]);

  const fetchTasks = async (selectTaskId = null) => {
    try {
      setLoading(true);
      const res = await getStaffTickets();
      if (res.data?.success) {
        const list = res.data.data || [];
        setTasks(list);
        if (selectTaskId) {
          const updatedTask = list.find((t) => t._id === selectTaskId);
          if (updatedTask) {
            setActiveTask(updatedTask);
          }
        }
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
      showToast("Lỗi khi tải danh sách sự cố", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const handleUpdateStatus = async (taskId, nextStatus) => {
    try {
      const statusMap = {
        PENDING: "pending",
        IN_PROGRESS: "in_progress",
        COMPLETED: "completed",
      };
      const apiStatus = statusMap[nextStatus] || "pending";
      const res = await updateTicketStatus(taskId, { status: apiStatus });
      if (res.data?.success) {
        showToast("Cập nhật trạng thái sự cố thành công!", "success");
        await fetchTasks(taskId);
      } else {
        showToast("Không thể cập nhật trạng thái.", "error");
      }
    } catch (err) {
      console.error("Update task status error:", err);
      showToast(
        "Gặp lỗi hoặc trạng thái cập nhật không được cấp phép.",
        "error",
      );
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === "ALL") return true;
    const s = t.status?.toUpperCase();
    if (filterStatus === "PENDING") {
      return s === "PENDING" || s === "ASSIGNED";
    }
    return s === filterStatus;
  });

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F5F6F8",
        fontFamily: "'Inter', sans-serif",
      }}
      id="maintenance-dashboard-container"
    >
      <Sidebar />

      <main className="maintenance-main">
        <Header avatarText="MT" />

        {/* Dynamic header title */}
        <h1
          style={{
            fontSize: 28,
            color: "#0A4E9B",
            fontWeight: 800,
            marginBottom: 24,
            marginTop: 0,
          }}
        >
          {activeTab === "Trang chủ" ? "Maintenance Board" : activeTab}
        </h1>

        {/* Overview Tab Content */}
        {activeTab === "Trang chủ" && (
          <div className="maintenance-tab-content-wrapper">
            {/* Quick alert bar */}
            <div className="maintenance-quick-alert-bar">
              <span className="maintenance-alert-text">
                Bạn có {tasks.filter(t => t.status?.toLowerCase() === "pending").length} sự cố sửa chữa CHƯA TIẾP NHẬN được phân công hôm nay.
              </span>
              <button
                onClick={() => {
                  setFilterStatus("PENDING");
                  navigate("/staff/dashboard/maintenance/tasks");
                }}
                className="maintenance-alert-btn"
              >
                Nhận việc
              </button>
            </div>

            {/* Dashboard stats cards */}
            <div className="dashboard-stats-grid">
              <div className="stat-card">
                <span className="stat-card-title">SỐ TASK ĐƯỢC GIAO</span>
                <h3 className="stat-card-value assigned">
                  {tasks.filter(
                    (t) =>
                      t.status?.toUpperCase() === "PENDING" ||
                      t.status?.toUpperCase() === "ASSIGNED"
                  ).length}
                </h3>
              </div>
              <div className="stat-card">
                <span className="stat-card-title">SỐ ĐANG XỬ LÝ</span>
                <h3 className="stat-card-value in-progress">
                  {tasks.filter((t) => t.status?.toUpperCase() === "IN_PROGRESS").length}
                </h3>
              </div>
              <div className="stat-card">
                <span className="stat-card-title">SỐ ĐÃ HOÀN THÀNH</span>
                <h3 className="stat-card-value completed">
                  {tasks.filter((t) => t.status?.toUpperCase() === "COMPLETED").length}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Ticket List and Details Tab Content */}
        {activeTab === "Danh sách sự cố" && (
          <div className="split-panel">
            {/* Left side list */}
            <div className="ticket-list-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 18, color: "#0A4E9B" }}>
                  Danh Sách Phiếu Việc
                </h3>

                {/* Status selector select dropdown */}
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                    background: "white",
                  }}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="IN_PROGRESS">Đang sửa chữa</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                </select>
              </div>

              <div className="tickets-container-list">
                {filteredTasks.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#64748B", padding: 24 }}>
                    Không có sự cố nào khớp với điều kiện lọc.
                  </div>
                ) : (
                  paginatedTasks.map((task) => {
                    const isSelected =
                      activeTask &&
                      ((activeTask._id && task._id && activeTask._id === task._id) ||
                        (activeTask.id && task.id && activeTask.id === task.id));
                    const severityClass =
                      task.severity === "HIGH"
                        ? "high"
                        : task.severity === "MEDIUM"
                          ? "medium"
                          : "low";
                    const statusColor =
                      task.status?.toUpperCase() === "PENDING" ||
                      task.status?.toUpperCase() === "ASSIGNED"
                        ? "#F59E0B"
                        : task.status?.toUpperCase() === "IN_PROGRESS"
                          ? "#2563EB"
                          : "#10B981";
                    const statusLabel =
                      task.status?.toUpperCase() === "PENDING" ||
                      task.status?.toUpperCase() === "ASSIGNED"
                        ? "Chờ xử lý"
                        : task.status?.toUpperCase() === "IN_PROGRESS"
                          ? "Đang tiến hành"
                          : "Đã xong";

                    return (
                      <div
                        key={task._id || task.id}
                        onClick={() => setActiveTask(task)}
                        className={`ticket-card ${isSelected ? "selected" : ""}`}
                      >
                        <div className="ticket-card-header">
                          <div>
                            <span className="ticket-id-tag">
                              PHIẾU: {task._id ? task._id.substring(18) : task.id}
                            </span>
                            <h4 className="ticket-room-label">
                              Phòng {task.roomNumber || task.room} - Tòa{" "}
                              {task.buildingName || task.dom}
                            </h4>
                          </div>
                          <span className={`priority-badge ${severityClass}`}>
                            {task.severity}
                          </span>
                        </div>

                        <p
                          className="ticket-desc"
                          style={{
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {task.description}
                        </p>

                        <div className="ticket-meta-row">
                          <span>
                            {/* Linh kiện: <strong>{task.type}</strong> */}
                          </span>
                          <span
                            className="status-badge-inline"
                            style={{ color: statusColor }}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {filteredTasks.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: "1px solid #E2E8F0"
                  }}
                >
                  <Pagination
                    simple
                    current={currentPage}
                    total={filteredTasks.length}
                    pageSize={pageSize}
                    onChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </div>

            {/* Right side detailed editor panel */}
            {activeTask ? (
              <div className="detail-view-card">
                <h3>Phác Thảo Chi Tiết Yêu Cầu</h3>
                <span className="detail-meta-text">
                  Hồ sơ phiếu:{" "}
                  <strong>
                    {activeTask._id ? activeTask._id.substring(18) : activeTask.id}
                  </strong>{" "}
                  | Khởi tạo:{" "}
                  {activeTask.createdAt
                    ? new Date(activeTask.createdAt).toLocaleDateString("vi-VN")
                    : activeTask.date}
                </span>

                {/* Visual state selector */}
                <div className="action-status-card">
                  <div className="detail-label-bold" style={{ marginBottom: 8 }}>
                    TIẾN TRÌNH THỰC HIỆN
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(activeTask.status?.toUpperCase() === "PENDING" || activeTask.status?.toUpperCase() === "ASSIGNED") ? (
                      <button
                        onClick={() =>
                          handleUpdateStatus(activeTask._id || activeTask.id, "IN_PROGRESS")
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          fontSize: 13,
                          fontWeight: 700,
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          background: "#2563EB",
                          color: "white",
                        }}
                      >
                        Tiếp Nhận Sửa Chữa (Tiến Hành)
                      </button>
                    ) : activeTask.status?.toUpperCase() === "IN_PROGRESS" ? (
                      <span style={{ fontSize: 13, color: "#2563EB", fontWeight: 700 }}>
                        ⚙ Đang tiến hành sửa chữa
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, color: "#10B981", fontWeight: 700 }}>
                        ✓ Đã hoàn thành sửa chữa
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="detail-label-bold">Vị trí phát sinh sự cố</div>
                  <p style={{ margin: "4px 0 10px 0", fontSize: 14 }}>
                    Phòng <strong>{activeTask.roomNumber || activeTask.room}</strong> - Khu
                    vực tòa KTX <strong>{activeTask.buildingName || activeTask.dom}</strong>
                  </p>

                  <div className="detail-label-bold">Nội dung lỗi kỹ thuật</div>
                  <p className="value-highlight-box" style={{ margin: "4px 0 16px 0" }}>
                    {activeTask.description}
                  </p>
                </div>

                {/* Resolution sections */}
                {activeTask.resolution && (
                  <div
                    style={{
                      marginTop: 16,
                      borderTop: "1px solid #E2E8F0",
                      paddingTop: 16,
                    }}
                  >
                    <div className="detail-label-bold">Kết quả giải quyết sự cố</div>
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: 13,
                        color: "#065F46",
                        background: "#ECFDF5",
                        padding: "12px 14px",
                        borderRadius: 8,
                        border: "1px dashed #A7F3D0",
                        fontWeight: 500,
                        lineHeight: 1.5,
                      }}
                    >
                      {activeTask.resolution}
                    </p>
                  </div>
                )}

                {activeTask.status?.toUpperCase() === "IN_PROGRESS" && (
                  <div
                    style={{
                      borderTop: "1px solid #E2E8F0",
                      paddingTop: 16,
                      marginTop: 16,
                    }}
                  >
                    <div className="detail-label-bold" style={{ marginBottom: 8 }}>
                      Cập nhật kết quả sửa chữa để hoàn thành
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!resolutionText.trim()) {
                          showToast("Vui lòng nhập kết quả xử lý sự cố!", "error");
                          return;
                        }
                        try {
                          const res = await updateTicketStatus(
                            activeTask._id || activeTask.id,
                            {
                              status: "completed",
                              resolution: resolutionText.trim(),
                            }
                          );
                          if (res.data?.success) {
                            showToast("Hoàn thành công việc thành công!", "success");
                            setResolutionText("");
                            await fetchTasks(activeTask._id || activeTask.id);
                          } else {
                            showToast("Không thể cập nhật kết quả.", "error");
                          }
                        } catch (err) {
                          console.error("Complete ticket error:", err);
                          showToast("Lỗi khi hoàn thành công việc.", "error");
                        }
                      }}
                      className="submit-resolution-form"
                    >
                      <textarea
                        placeholder="Nhập chi tiết biện pháp khắc phục sự cố (ví dụ: đã thay mới bóng đèn tuýp 1m2)..."
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        rows={3}
                        className="resolution-textarea"
                        required
                      />
                      <button
                        type="submit"
                        className="action-btn-primary"
                        style={{ background: "#10B981" }}
                      >
                        Xác Nhận Đã Hoàn Thành & Lưu Giải Pháp
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-detail-state">
                Chọn một phiếu gác việc bên trái để xem tiến độ kỹ thuật và cập cập nhật giải pháp.
              </div>
            )}
          </div>
        )}
      </main>

      {toast && (
        <div
          className="toast-notification"
          style={{
            background: toast.type === "success" ? "#10B981" : "#EF4444",
          }}
        >
          {toast.type === "success" ? "✓" : "✗"} {toast.message}
        </div>
      )}
    </div>
  );
}

export default MaintenanceDashboard;
