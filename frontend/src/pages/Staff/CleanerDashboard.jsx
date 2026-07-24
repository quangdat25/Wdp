import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import authService from "../../api/authService";
import { FaBell, FaExclamationTriangle } from "react-icons/fa";
import Header from "../../components/Headers";
import { Pagination } from "antd";

import {
  getStaffTickets,
  updateTicketStatus,
  createStaffTicket,
} from "../../api/ticketService";
import "./CleanerDashboard.css";

const initialCleanTasks = [];

function CleanerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("Trang chủ");

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.endsWith("/tasks")) {
      setActiveTab("Dọn dẹp phòng");
    } else if (path.endsWith("/issues")) {
      setActiveTab("Sự cố kỹ thuật");
    } else {
      setActiveTab("Trang chủ");
    }
    setTasksPage(1);
    setIncidentsPage(1);
  }, [location.pathname]);

  // State management inside the file
  const [cleanTasks, setCleanTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  // Defect reporting modal overlay states
  const [reportingTask, setReportingTask] = useState(null);
  const [damageForm, setDamageForm] = useState({
    description: "",
    severity: "MEDIUM",
  });

  // Pagination states
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksPageSize, setTasksPageSize] = useState(6);
  const [incidentsPage, setIncidentsPage] = useState(1);
  const [incidentsPageSize, setIncidentsPageSize] = useState(10);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const menuItems = ["Trang chủ", "Dọn dẹp phòng"];

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getStaffTickets();
      if (res.data?.success) {
        setCleanTasks(res.data.data);
      }
    } catch (err) {
      console.error("Fetch staff tickets error:", err);
      setError("Không thể tải danh sách công việc từ cơ sở dữ liệu.");
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

  // Start working on the task
  const handleStartTask = async (taskId) => {
    try {
      const res = await updateTicketStatus(taskId, { status: "in_progress" });
      if (res.data?.success) {
        showToast("Bắt đầu thực hiện dọn dẹp phòng này!", "success");
        fetchTasks();
      }
    } catch (err) {
      console.error("Start task error:", err);
      showToast("Lỗi khi cập nhật trạng thái công việc.", "error");
    }
  };

  // Mark room clean ready status handler
  const handleMarkReady = async (taskId) => {
    try {
      const res = await updateTicketStatus(taskId, { status: "completed" });
      if (res.data?.success) {
        showToast(
          "Cập nhật thành công! Ghi nhận trạng thái hoàn thành.",
          "success",
        );
        fetchTasks();
      }
    } catch (err) {
      console.error("Complete task error:", err);
      showToast("Lỗi khi cập nhật trạng thái công việc.", "error");
    }
  };

  // Housekeeper defect reporting handler
  const handleReportDamageSubmit = async (e) => {
    e.preventDefault();
    if (!damageForm.description.trim() || !reportingTask) return;

    try {
      const res = await createStaffTicket({
        taskId: reportingTask._id,
        description: damageForm.description.trim(),
        severity: damageForm.severity || "MEDIUM",
      });

      if (res.data?.success) {
        showToast(
          "Báo cáo hỏng hóc thành công! Đã ghi nhận sự cố của phòng.",
          "success",
        );
        fetchTasks();
      }
    } catch (err) {
      console.error("Report damage error:", err);
      showToast("Có lỗi xảy ra khi tạo báo cáo hỏng hóc.", "error");
    } finally {
      // Clear and close modal
      setDamageForm({ description: "", severity: "MEDIUM" });
      setReportingTask(null);
    }
  };

  const filteredTasks = cleanTasks.filter((task) => {
    if (filterStatus === "ALL") return true;
    return task.status === filterStatus;
  });

  const paginatedTasks = filteredTasks.slice(
    (tasksPage - 1) * tasksPageSize,
    tasksPage * tasksPageSize,
  );

  const reportedIssues = cleanTasks.filter(
    (t) => t.damageReported && t.damageReported.description,
  );

  const paginatedIssues = reportedIssues.slice(
    (incidentsPage - 1) * incidentsPageSize,
    incidentsPage * incidentsPageSize,
  );

  const assignedTasksCount = cleanTasks.filter(
    (t) => t.status === "assigned",
  ).length;
  const inProgressTasksCount = cleanTasks.filter(
    (t) => t.status === "in_progress",
  ).length;

  const today = new Date();
  const completedTodayCount = cleanTasks.filter((t) => {
    if (t.status !== "completed" || !t.completedAt) return false;
    const compDate = new Date(t.completedAt);
    return (
      compDate.getDate() === today.getDate() &&
      compDate.getMonth() === today.getMonth() &&
      compDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const completedThisMonthCount = cleanTasks.filter((t) => {
    if (t.status !== "completed" || !t.completedAt) return false;
    const compDate = new Date(t.completedAt);
    return (
      compDate.getMonth() === today.getMonth() &&
      compDate.getFullYear() === today.getFullYear()
    );
  }).length;

  return (
    <div
      className="cleaner-dashboard-container"
      id="cleaner-dashboard-container"
    >
      <Sidebar />

      {/* Main dashboard contents */}
      <main className="cleaner-main">
        <Header avatarText="LC" />

        {/* Dashboard index content */}
        {activeTab === "Trang chủ" && (
          <div className="cleaner-tab-content-wrapper">
            {/* Quick alert bar */}
            <div className="cleaner-quick-alert-bar">
              <span className="cleaner-alert-text">
                Kế hoạch hôm nay: Bạn có{" "}
                {cleanTasks.filter((t) => t.status !== "completed").length}{" "}
                phòng đang ở diện vệ sinh dọn dẹp bàn giao.
              </span>
              <button
                onClick={() => {
                  navigate("/staff/dashboard/cleaner/tasks");
                }}
                className="cleaner-alert-btn"
              >
                Nhận lịch
              </button>
            </div>

            {/* Operational grid */}
            <div className="cleaner-operational-grid">
              <div className="cleaner-stat-card">
                <span className="cleaner-stat-card-title">
                  CÔNG VIỆC ĐƯỢC GIAO
                </span>
                <h3
                  className="cleaner-stat-card-value"
                  style={{ color: "#FF9100" }}
                >
                  {assignedTasksCount}
                </h3>
              </div>
              <div className="cleaner-stat-card">
                <span className="cleaner-stat-card-title">ĐANG THỰC HIỆN</span>
                <h3
                  className="cleaner-stat-card-value"
                  style={{ color: "#0A4E9B" }}
                >
                  {inProgressTasksCount}
                </h3>
              </div>
              <div className="cleaner-stat-card">
                <span className="cleaner-stat-card-title">
                  HOÀN THÀNH HÔM NAY
                </span>
                <h3
                  className="cleaner-stat-card-value"
                  style={{ color: "#10B981" }}
                >
                  {completedTodayCount}
                </h3>
              </div>
              <div className="cleaner-stat-card">
                <span className="cleaner-stat-card-title">
                  HOÀN THÀNH THÁNG NÀY
                </span>
                <h3
                  className="cleaner-stat-card-value"
                  style={{ color: "#6366F1" }}
                >
                  {completedThisMonthCount}
                </h3>
              </div>
            </div>

            {/* List of critical cleaning issues */}
            <div className="cleaner-high-priority-card">
              <div className="cleaner-high-priority-header">
                <span>Tiến độ phân bổ dọn dẹp các tòa nhà</span>
                <span style={{ fontSize: 12, opacity: 0.9 }}>
                  Cập nhật tự động
                </span>
              </div>
              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {Array.from(
                  new Set(
                    cleanTasks.map((t) => t.buildingName).filter(Boolean),
                  ),
                )
                  .sort()
                  .map((building) => {
                    const totalInBuilding = cleanTasks.filter(
                      (t) => t.buildingName === building,
                    ).length;
                    const completedInBuilding = cleanTasks.filter(
                      (t) =>
                        t.buildingName === building && t.status === "completed",
                    ).length;
                    return (
                      <div
                        key={building}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 14,
                        }}
                      >
                        <span>Tòa KTX {building}</span>
                        <strong>
                          {completedInBuilding} / {totalInBuilding} phòng đã
                          xong
                        </strong>
                      </div>
                    );
                  })}
                {cleanTasks.length === 0 && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#64748B",
                      textAlign: "center",
                      padding: "10px 0",
                    }}
                  >
                    Chưa có phòng nào được phân bổ vệ sinh
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cleaning tasks check lists list */}
        {activeTab === "Dọn dẹp phòng" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Status filters */}
            {/* Status filters */}
            <div style={{ display: "flex", gap: 8 }}>
              {["ALL", "assigned", "in_progress", "completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status);
                    setTasksPage(1);
                  }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 14,
                    border:
                      filterStatus === status ? "none" : "1px solid #CBD5E1",
                    background: filterStatus === status ? "#0D47A1" : "white",
                    color: filterStatus === status ? "white" : "#475569",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {status === "ALL"
                    ? "Tất cả"
                    : status === "assigned"
                      ? "Chờ dọn"
                      : status === "in_progress"
                        ? "Đang dọn"
                        : "Sẵn sàng"}
                </button>
              ))}
            </div>

            {/* Loading / Empty States */}
            {loading && (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  fontSize: 15,
                  color: "#64748B",
                }}
              >
                Đang tải danh sách công việc từ cơ sở dữ liệu...
              </div>
            )}

            {!loading && filteredTasks.length === 0 && (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  fontSize: 15,
                  color: "#64748B",
                  background: "white",
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                }}
              >
                Không có công việc dọn dẹp nào trong trạng thái này.
              </div>
            )}

            {/* List grid */}
            {!loading && filteredTasks.length > 0 && (
              <>
                <div className="cleaner-tasks-grid">
                  {paginatedTasks.map((task) => {
                    const dbDamage =
                      task.damageReported && task.damageReported.description
                        ? task.damageReported
                        : null;
                    return (
                      <div
                        key={task._id}
                        style={{
                          background: "white",
                          borderRadius: 12,
                          border: "1px solid #E2E8F0",
                          padding: 20,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <h4
                              style={{
                                margin: 0,
                                color: "#0F172A",
                                fontSize: 16,
                              }}
                            >
                              Phòng {task.roomNumber} - Tòa KTX{" "}
                              {task.buildingName}
                            </h4>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: 10,
                                fontSize: 10,
                                fontWeight: 700,
                                background:
                                  task.status === "assigned"
                                    ? "#FEE2E2"
                                    : task.status === "in_progress"
                                      ? "#DBEAFE"
                                      : "#D1FAE5",
                                color:
                                  task.status === "assigned"
                                    ? "#991B1B"
                                    : task.status === "in_progress"
                                      ? "#1E40AF"
                                      : "#065F46",
                              }}
                            >
                              {task.status === "assigned"
                                ? "Chờ dọn"
                                : task.status === "in_progress"
                                  ? "Đang dọn"
                                  : "Sẵn sàng"}
                            </span>
                          </div>

                          <p
                            style={{
                              fontSize: 11,
                              color: "#64748B",
                              margin: "4px 0",
                            }}
                          >
                            Phân loại:{" "}
                            <strong>{task.title || task.type}</strong> | Nhận
                            lúc:{" "}
                            {task.assignedAt
                              ? new Date(task.assignedAt).toLocaleString(
                                  "vi-VN",
                                )
                              : new Date(task.createdAt).toLocaleString(
                                  "vi-VN",
                                )}
                          </p>
                          <p
                            style={{
                              fontSize: 13,
                              color: "#475569",
                              margin: "10px 0",
                            }}
                          >
                            {task.description}
                          </p>

                          {/* Defect banner */}
                          {dbDamage && (
                            <div
                              style={{
                                background: "#FEF2F2",
                                border: "1px solid #FEE2E2",
                                borderRadius: 8,
                                padding: 10,
                                fontSize: 12,
                                color: "#991B1B",
                                margin: "8px 0",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontWeight: 700,
                                }}
                              >
                                <FaExclamationTriangle /> Đã có báo cáo sự cố hư
                                hại:
                              </div>
                              <p style={{ margin: "2px 0 0 0" }}>
                                {dbDamage.description}
                              </p>
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            borderTop: "1px solid #F1F5F9",
                            paddingTop: 12,
                            marginTop: 12,
                          }}
                        >
                          {task.status === "assigned" && (
                            <button
                              onClick={() => handleStartTask(task._id)}
                              style={{
                                flex: 1,
                                background: "#0D47A1",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Bắt đầu dọn dẹp
                            </button>
                          )}

                          {task.status === "in_progress" && (
                            <button
                              onClick={() => handleMarkReady(task._id)}
                              style={{
                                flex: 1,
                                background: "#10B981",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Dọn phòng xong
                            </button>
                          )}

                          {!dbDamage && task.status !== "completed" && (
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
                                cursor: "pointer",
                              }}
                            >
                              Báo cáo hỏng hóc
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 20,
                  }}
                >
                  <Pagination
                    current={tasksPage}
                    total={filteredTasks.length}
                    pageSize={tasksPageSize}
                    pageSizeOptions={["6", "10", "15"]}
                    showSizeChanger
                    onChange={(page, size) => {
                      setTasksPage(page);
                      setTasksPageSize(size);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Reported damages logs */}
        {activeTab === "Sự cố kỹ thuật" && (
          <div className="cleaner-ticket-list-card">
            <h3 style={{ margin: "0 0 16px 0", color: "#0A4E9B" }}>
              Danh Sách Tiện Nghi Sự Cố Đã Báo Cáo
            </h3>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  minWidth: "600px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid #E2E8F0",
                      background: "#F8FAFC",
                    }}
                  >
                    <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>
                      Mã Phiếu kỹ thuật
                    </th>
                    <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>
                      Khu vực Phòng
                    </th>
                    <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>
                      Mô tả Hỏng Hóc
                    </th>
                    <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>
                      Người báo
                    </th>
                    <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>
                      Ngày báo
                    </th>
                    <th style={{ padding: 12, fontSize: 13, color: "#64748B" }}>
                      Mức độ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedIssues.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          padding: 24,
                          textAlign: "center",
                          color: "#64748B",
                        }}
                      >
                        Chưa có sự cố kỹ thuật nào được báo cáo.
                      </td>
                    </tr>
                  ) : (
                    paginatedIssues.map((t) => {
                      const damage = t.damageReported;
                      return (
                        <tr
                          key={t._id}
                          style={{ borderBottom: "1px solid #E2E8F0" }}
                        >
                          <td
                            style={{
                              padding: 12,
                              fontFamily: "monospace",
                              fontWeight: 700,
                            }}
                          >
                            {t._id.slice(-6).toUpperCase()}
                          </td>
                          <td style={{ padding: 12 }}>
                            Phòng {t.roomNumber} - Tòa KTX {t.buildingName}
                          </td>
                          <td style={{ padding: 12 }}>{damage.description}</td>
                          <td style={{ padding: 12 }}>
                            {damage.reportedBy?.fullName ||
                              damage.reportedBy?.username ||
                              "Không rõ"}
                          </td>
                          <td style={{ padding: 12, fontSize: 13 }}>
                            {damage.date}
                          </td>
                          <td style={{ padding: 12 }}>
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: 12,
                                fontSize: 10,
                                background:
                                  damage.severity === "HIGH"
                                    ? "#FEE2E2"
                                    : "#FEF3C7",
                                color:
                                  damage.severity === "HIGH"
                                    ? "#991B1B"
                                    : "#92400E",
                                fontWeight: 700,
                              }}
                            >
                              {damage.severity === "HIGH"
                                ? "Nghiêm trọng"
                                : "Trung bình"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {reportedIssues.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 20,
                }}
              >
                <Pagination
                  current={incidentsPage}
                  total={reportedIssues.length}
                  pageSize={incidentsPageSize}
                  pageSizeOptions={["10", "15", "20"]}
                  showSizeChanger
                  onChange={(page, size) => {
                    setIncidentsPage(page);
                    setIncidentsPageSize(size);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Report Damage Modal Dialog */}
      {reportingTask && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            alignContent: "center",
            padding: 20,
          }}
        >
          {/* Backdrop blur */}
          <div
            onClick={() => setReportingTask(null)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(2px)",
            }}
          />

          <form
            onSubmit={handleReportDamageSubmit}
            style={{
              position: "relative",
              zIndex: 110,
              background: "white",
              padding: 24,
              borderRadius: 16,
              width: "100%",
              maxWidth: 450,
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", color: "#EF4444" }}>
              Báo cáo hư hại vật tư phòng
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>
              Khởi tạo yêu cầu kỹ thuật cho{" "}
              <strong>
                Phòng {reportingTask.roomNumber} (Tòa KTX{" "}
                {reportingTask.buildingName})
              </strong>
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}
                >
                  Mức độ hư hại
                </label>
                <select
                  value={damageForm.severity}
                  onChange={(e) =>
                    setDamageForm({ ...damageForm, severity: e.target.value })
                  }
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                    background: "white",
                  }}
                >
                  <option value="LOW">Thấp (Chờ khắc phục)</option>
                  <option value="MEDIUM">Vừa phải</option>
                  <option value="HIGH">Nghiêm trọng (Cản trở sinh hoạt)</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}
                >
                  Mô tả chi tiết
                </label>
                <textarea
                  rows="3"
                  placeholder="Gương vỡ, vòi nước rò rỉ, bóng đèn chớp tắt..."
                  value={damageForm.description}
                  onChange={(e) =>
                    setDamageForm({
                      ...damageForm,
                      description: e.target.value,
                    })
                  }
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                  }}
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
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
                  cursor: "pointer",
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
                  cursor: "pointer",
                }}
              >
                Tạo báo cáo
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: toast.type === "success" ? "#10B981" : "#EF4444",
            color: "white",
            padding: "16px 24px",
            borderRadius: 12,
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 700,
          }}
        >
          {toast.type === "success" ? "✓" : "✗"} {toast.message}
        </div>
      )}
    </div>
  );
}

export default CleanerDashboard;
