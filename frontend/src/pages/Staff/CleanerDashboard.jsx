import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import authService from "../../api/authService";
import { FaExclamationTriangle } from "react-icons/fa";
import Header from "../../components/Headers";

import {
  getStaffTickets,
  updateTicketStatus,
  createStaffTicket,
} from "../../api/ticketService";
// import "./CleanerDashboard.css"; // DELETED

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
  }, [location.pathname]);

  const [cleanTasks, setCleanTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [reportedDamages, setReportedDamages] = useState(() => {
    try {
      const saved = localStorage.getItem("cleaner_reported_damages");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("cleaner_reported_damages", JSON.stringify(reportedDamages));
  }, [reportedDamages]);

  const [reportingTask, setReportingTask] = useState(null);
  const [damageForm, setDamageForm] = useState({
    description: "",
    severity: "MEDIUM",
  });

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const handleMarkReady = async (taskId) => {
    try {
      const res = await updateTicketStatus(taskId, { status: "completed" });
      if (res.data?.success) {
        showToast("Cập nhật thành công! Ghi nhận trạng thái hoàn thành.", "success");
        fetchTasks();
      }
    } catch (err) {
      console.error("Complete task error:", err);
      showToast("Lỗi khi cập nhật trạng thái công việc.", "error");
    }
  };

  const handleReportDamageSubmit = async (e) => {
    e.preventDefault();
    if (!damageForm.description.trim() || !reportingTask) return;

    try {
      const studentId = reportingTask.studentId?._id || reportingTask.studentId || null;

      const res = await createStaffTicket({
        taskId: reportingTask._id,
        studentId,
        buildingName: reportingTask.buildingName,
        roomNumber: reportingTask.roomNumber,
        title: `Phòng ${reportingTask.roomNumber} - Hư hỏng báo bởi Cleaner`,
        type: "Khác",
        description: damageForm.description.trim(),
        severity: damageForm.severity || "MEDIUM",
      });

      if (res.data?.success) {
        setReportedDamages((prev) => ({
          ...prev,
          [reportingTask._id]: {
            description: damageForm.description.trim(),
            severity: damageForm.severity,
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            ticketId: null,
          },
        }));

        showToast("Báo cáo hỏng hóc thành công! Đã ghi nhận sự cố của phòng.", "success");
        fetchTasks();
      }
    } catch (err) {
      console.error("Report damage error:", err);
      showToast("Có lỗi xảy ra khi tạo báo cáo hỏng hóc.", "error");
    } finally {
      setDamageForm({ description: "", severity: "MEDIUM" });
      setReportingTask(null);
    }
  };

  const filteredTasks = cleanTasks.filter((task) => {
    if (filterStatus === "ALL") return true;
    return task.status === filterStatus;
  });

  const assignedTasksCount = cleanTasks.filter((t) => t.status === "assigned").length;
  const inProgressTasksCount = cleanTasks.filter((t) => t.status === "in_progress").length;

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
    <div className="flex bg-white min-h-screen font-sans text-[#0b1c30]">
      <Sidebar />
      <main className="ml-[270px] flex-1">
        <Header avatarText="LC" />

        <div className="p-8 max-w-[1400px] mx-auto">
          {/* Header Title */}
          <h1 className="text-3xl font-bold text-[#0b1c30] mb-8">
            {activeTab === "Trang chủ" ? "Cleaner Board" : activeTab}
          </h1>

          {/* Dashboard index content */}
          {activeTab === "Trang chủ" && (
            <div className="flex flex-col gap-6">
              {/* Quick alert bar */}
              <div className="bg-[#e6f4ea] rounded-xl p-6 flex justify-between items-center border border-[#bccac0]">
                <span className="text-[#006948] font-bold text-lg">
                  Kế hoạch hôm nay: Bạn có {cleanTasks.filter((t) => t.status !== "completed").length} phòng đang ở diện vệ sinh dọn dẹp bàn giao.
                </span>
                <button
                  onClick={() => navigate("/staff/dashboard/cleaner/tasks")}
                  className="bg-[#006948] hover:bg-opacity-90 text-white border-none rounded-lg px-6 py-2.5 text-sm font-bold cursor-pointer transition-colors"
                >
                  Nhận lịch
                </button>
              </div>

              {/* Operational grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="CÔNG VIỆC ĐƯỢC GIAO" value={assignedTasksCount} valueColor="text-amber-500" />
                <MetricCard title="ĐANG THỰC HIỆN" value={inProgressTasksCount} valueColor="text-blue-600" />
                <MetricCard title="HOÀN THÀNH HÔM NAY" value={completedTodayCount} valueColor="text-emerald-500" />
                <MetricCard title="HOÀN THÀNH THÁNG NÀY" value={completedThisMonthCount} valueColor="text-indigo-500" />
              </div>

              {/* List of critical cleaning issues */}
              <div className="bg-[#F6FAF5] border border-[#bccac0] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#006948] px-6 py-4 flex justify-between items-center text-white">
                  <span className="font-bold text-lg">Tiến độ phân bổ dọn dẹp các tòa nhà</span>
                  <span className="text-xs opacity-90">Cập nhật tự động</span>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  {Array.from(new Set(cleanTasks.map((t) => t.buildingName).filter(Boolean)))
                    .sort()
                    .map((building) => {
                      const totalInBuilding = cleanTasks.filter((t) => t.buildingName === building).length;
                      const completedInBuilding = cleanTasks.filter(
                        (t) => t.buildingName === building && t.status === "completed"
                      ).length;
                      return (
                        <div key={building} className="flex justify-between text-sm py-2 border-b border-gray-200 last:border-0">
                          <span>Tòa KTX {building}</span>
                          <strong className="text-emerald-600">{completedInBuilding} / {totalInBuilding} phòng đã xong</strong>
                        </div>
                      );
                    })}
                  {cleanTasks.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">Chưa có phòng nào được phân bổ vệ sinh</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cleaning tasks lists */}
          {activeTab === "Dọn dẹp phòng" && (
            <div className="flex flex-col gap-6">
              {/* Status filters */}
              <div className="flex gap-3">
                {["ALL", "assigned", "in_progress", "completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer border ${
                      filterStatus === status 
                        ? "bg-[#006948] text-white border-transparent" 
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {status === "ALL" ? "Tất cả" : status === "assigned" ? "Chờ dọn" : status === "in_progress" ? "Đang dọn" : "Sẵn sàng"}
                  </button>
                ))}
              </div>

              {loading && <div className="py-10 text-center text-gray-500 text-sm">Đang tải danh sách công việc từ cơ sở dữ liệu...</div>}
              {!loading && filteredTasks.length === 0 && (
                <div className="py-10 text-center text-gray-500 text-sm bg-[#F6FAF5] rounded-xl border border-gray-200">
                  Không có công việc dọn dẹp nào trong trạng thái này.
                </div>
              )}

              {/* List grid */}
              {!loading && filteredTasks.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredTasks.map((task) => {
                    const damageData = task.damageReported || reportedDamages[task._id];
                    const dbDamage = (damageData && damageData.description) ? damageData : null;
                    
                    const statusClass = task.status === "assigned" ? "bg-red-100 text-red-800" : task.status === "in_progress" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800";
                    const statusText = task.status === "assigned" ? "Chờ dọn" : task.status === "in_progress" ? "Đang dọn" : "Sẵn sàng";

                    return (
                      <div key={task._id} className="bg-[#F6FAF5] rounded-xl border border-[#bccac0] p-6 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="m-0 text-base font-bold text-gray-900">
                              Phòng {task.roomNumber} - Tòa KTX {task.buildingName}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusClass}`}>
                              {statusText}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 my-1">
                            Phân loại: <strong>{task.title || task.type}</strong> | Nhận lúc: {task.assignedAt ? new Date(task.assignedAt).toLocaleString("vi-VN") : new Date(task.createdAt).toLocaleString("vi-VN")}
                          </p>
                          <p className="text-sm text-gray-700 my-3 leading-relaxed">
                            {task.description}
                          </p>

                          {/* Defect banner */}
                          {dbDamage && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 my-2">
                              <div className="flex items-center gap-2 font-bold mb-1">
                                <FaExclamationTriangle /> Đã có báo cáo sự cố hư hại:
                              </div>
                              <p className="m-0 mt-1">{dbDamage.description}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 border-t border-gray-200 pt-4 mt-4">
                          {task.status === "assigned" && (
                            <button
                              onClick={() => handleStartTask(task._id)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg py-2 text-xs font-bold cursor-pointer transition-colors"
                            >
                              Bắt đầu dọn dẹp
                            </button>
                          )}
                          {task.status === "in_progress" && (
                            <button
                              onClick={() => handleMarkReady(task._id)}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-lg py-2 text-xs font-bold cursor-pointer transition-colors"
                            >
                              Dọn phòng xong
                            </button>
                          )}
                          {!dbDamage && task.status !== "completed" && (
                            <button
                              onClick={() => setReportingTask(task)}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none rounded-lg py-2 text-xs font-bold cursor-pointer transition-colors"
                            >
                              Báo cáo hỏng hóc
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Reported damages logs */}
          {activeTab === "Sự cố kỹ thuật" && (
            <div className="bg-[#F6FAF5] rounded-xl border border-[#bccac0] p-6 shadow-sm overflow-hidden">
              <h3 className="m-0 mb-6 text-lg font-bold text-[#0b1c30]">
                Danh Sách Tiện Nghi Sự Cố Đã Báo Cáo
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-white border-b border-gray-200">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Mã Phiếu</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Khu vực Phòng</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Mô tả Hỏng Hóc</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Ngày báo</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Mức độ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cleanTasks
                      .filter((t) => (t.damageReported && t.damageReported.description) || (reportedDamages[t._id] && reportedDamages[t._id].description))
                      .map((t) => {
                        const damage = (t.damageReported && t.damageReported.description) ? t.damageReported : reportedDamages[t._id];
                        return (
                          <tr key={t._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors bg-[#F6FAF5]">
                            <td className="p-4 font-mono font-bold text-sm text-gray-700">{t._id.slice(-6).toUpperCase()}</td>
                            <td className="p-4 text-sm text-gray-800">Phòng {t.roomNumber} - Tòa KTX {t.buildingName}</td>
                            <td className="p-4 text-sm text-gray-600">{damage.description}</td>
                            <td className="p-4 text-sm text-gray-500">{damage.date}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${damage.severity === "HIGH" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                                {damage.severity === "HIGH" ? "Nghiêm trọng" : "Trung bình"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Report Damage Modal Dialog */}
      {reportingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReportingTask(null)} />
          <form
            onSubmit={handleReportDamageSubmit}
            className="relative z-10 bg-[#F6FAF5] p-8 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <h3 className="m-0 mb-4 text-xl font-bold text-red-600">Báo cáo hư hại vật tư phòng</h3>
            <p className="text-sm text-gray-600 mb-6">
              Khởi tạo yêu cầu kỹ thuật cho <strong>Phòng {reportingTask.roomNumber} (Tòa KTX {reportingTask.buildingName})</strong>
            </p>

            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Mức độ hư hại</label>
                <select
                  value={damageForm.severity}
                  onChange={(e) => setDamageForm({ ...damageForm, severity: e.target.value })}
                  className="p-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]"
                >
                  <option value="LOW">Thấp (Chờ khắc phục)</option>
                  <option value="MEDIUM">Vừa phải</option>
                  <option value="HIGH">Nghiêm trọng (Cản trở sinh hoạt)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Mô tả chi tiết</label>
                <textarea
                  rows="3"
                  placeholder="Gương vỡ, vòi nước rò rỉ, bóng đèn chớp tắt..."
                  value={damageForm.description}
                  onChange={(e) => setDamageForm({ ...damageForm, description: e.target.value })}
                  className="p-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReportingTask(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg border-none bg-red-500 hover:bg-red-600 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Tạo báo cáo
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 text-white px-6 py-4 rounded-xl shadow-lg z-50 font-bold flex items-center gap-2 ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          <span className="material-symbols-outlined">{toast.type === "success" ? "check_circle" : "error"}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, valueColor }) {
  return (
    <div className="bg-[#F6FAF5] p-6 rounded-xl border border-[#bccac0] shadow-sm flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
      <span className="text-xs font-bold text-gray-500 mb-2 tracking-wider">{title}</span>
      <h3 className={`text-4xl font-extrabold m-0 ${valueColor}`}>{value}</h3>
    </div>
  );
}

export default CleanerDashboard;
