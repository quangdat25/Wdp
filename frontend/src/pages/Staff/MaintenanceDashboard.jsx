import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../api/authService";
import { FaBell, FaWrench, FaTools, FaPlusCircle } from "react-icons/fa";

// Initial fake data right inside the file
const initialTasks = [
  {
    id: "T001",
    room: "302",
    dom: "A",
    type: "Điều hòa",
    description: "Điều hòa không mát, kêu to khi hoạt động",
    severity: "HIGH",
    status: "PENDING",
    assignedTo: "Lưu Huy Hoàng",
    date: "2026-06-07",
    notes: [
      { date: "2026-06-07 14:00", author: "Hệ thống", content: "Yêu cầu bảo trì được khởi tạo từ biểu mẫu báo cáo phòng." }
    ]
  },
  {
    id: "T002",
    room: "105",
    dom: "B",
    type: "Điện & Ánh sáng",
    description: "Hỏng bóng đèn tuýp nhà vệ sinh",
    severity: "LOW",
    status: "IN_PROGRESS",
    assignedTo: "Lưu Huy Hoàng",
    date: "2026-06-08",
    notes: [
      { date: "2026-06-08 09:30", author: "Lưu Huy Hoàng", content: "Đã kiểm tra chấn lưu, cần thay thế bóng đèn LED mới." }
    ]
  },
  {
    id: "T003",
    room: "220",
    dom: "C",
    type: "Nước & Vệ sinh",
    description: "Vòi sen rỉ nước chảy liên tục gây lãng phí",
    severity: "MEDIUM",
    status: "COMPLETED",
    assignedTo: "Nguyễn Văn Hùng",
    date: "2026-06-06",
    notes: [
      { date: "2026-06-06 10:00", author: "Nguyễn Văn Hùng", content: "Đã thay gioăng cao su vòi sen." },
      { date: "2026-06-06 11:30", author: "Nguyễn Văn Hùng", content: "Đã hoàn thành bàn giao và nghiệm thu." }
    ]
  }
];

function MaintenanceDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Trang chủ");
  
  // State management inside the file
  const [tasks, setTasks] = useState(initialTasks);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [activeTask, setActiveTask] = useState(null);
  
  // Diagnostic note input
  const [noteText, setNoteText] = useState("");
  
  // Create manual task form state
  const [createForm, setCreateForm] = useState({
    room: "",
    dom: "A",
    type: "Điều hòa",
    severity: "MEDIUM",
    description: ""
  });

  const menuItems = [
    "Trang chủ",
    "Danh sách sự cố",
    "Lập phiếu sự cố"
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

  // Status transition handler
  const handleUpdateStatus = (taskId, nextStatus) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: nextStatus,
          notes: [
            ...t.notes,
            {
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              author: "Lưu Huy Hoàng",
              content: `Chuyển trạng thái xử lý nhiệm vụ sang: ${nextStatus}.`
            }
          ]
        };
      }
      return t;
    });
    setTasks(updated);
    // Sync state for detailed view if focused
    if (activeTask && activeTask.id === taskId) {
      setActiveTask(updated.find(t => t.id === taskId));
    }
  };

  // Diagnostics Notes creator handler
  const handleAddNoteText = (e) => {
    e.preventDefault();
    if (!noteText.trim() || !activeTask) return;

    const updated = tasks.map(t => {
      if (t.id === activeTask.id) {
        return {
          ...t,
          notes: [
            ...t.notes,
            {
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              author: "KTV Lưu Huy Hoàng",
              content: noteText.trim()
            }
          ]
        };
      }
      return t;
    });

    setTasks(updated);
    setActiveTask(updated.find(t => t.id === activeTask.id));
    setNoteText("");
  };

  // Manual ticket trigger
  const handleSubmitManualTicket = (e) => {
    e.preventDefault();
    if (!createForm.room || !createForm.description) {
      alert("Vui lòng điền đầy đủ số phòng và nội dung mô tả!");
      return;
    }

    const newTicket = {
      id: "T" + (tasks.length + 101),
      room: createForm.room,
      dom: createForm.dom,
      type: createForm.type,
      description: createForm.description,
      severity: createForm.severity,
      status: "PENDING",
      assignedTo: "Lưu Huy Hoàng",
      date: new Date().toISOString().split('T')[0],
      notes: [
        {
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          author: "KTV Lưu Huy Hoàng",
          content: "Khai báo thủ công sự cố tại hiện trường."
        }
      ]
    };

    setTasks([...tasks, newTicket]);
    alert(`Đã khởi tạo phiếu sửa chữa ${newTicket.id} cho phòng ${newTicket.room}!`);
    setCreateForm({
      room: "",
      dom: "A",
      type: "Điều hòa",
      severity: "MEDIUM",
      description: ""
    });
    setActiveTab("Danh sách sự cố");
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === "ALL") return true;
    return t.status === filterStatus;
  });

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
      {/* Sidebar navigation */}
      <aside
        style={{
          width: 250,
          background: "#00E676", // Matches student dashboard sidebar color
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ padding: "0 8px", marginBottom: 24 }}>
            <h2
              style={{
                margin: 0,
                color: "#000000",
                fontWeight: 800,
                fontSize: 22,
                lineHeight: "1.2",
              }}
            >
              FPT Dorm Tech
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                color: "#000000",
                fontSize: 12,
                fontWeight: 600,
                opacity: 0.8,
              }}
            >
              Đội Ngũ Kỹ Thuật & Khắc Phục
            </p>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {menuItems.map((item) => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => {
                    setActiveTab(item);
                    setActiveTask(null);
                  }}
                  style={{
                    width: "100%",
                    height: 42,
                    borderRadius: 21,
                    border: isActive ? "none" : "1px solid #000000",
                    background: isActive ? "rgba(255, 255, 255, 0.45)" : "#FFFFFF",
                    color: "#000000",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.85)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#FFFFFF";
                    }
                  }}
                >
                  {item}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            height: 54,
            background: "#FFFFFF",
            border: "1px solid #000000",
            borderRadius: 8,
            color: "#000000",
            fontWeight: 700,
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F5F5F5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#FFFFFF";
          }}
        >
          Đăng xuất
        </button>
      </aside>

      {/* Main dashboard contents */}
      <main
        style={{
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
            {activeTab === "Trang chủ" ? "Maintenance Board" : activeTab}
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
              KT
            </div>
          </div>
        </header>

        {/* Dashboard index content */}
        {activeTab === "Trang chủ" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Quick alert bar */}
            <div
              style={{
                background: "#E2F0D9",
                borderRadius: 12,
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #A9D18E"
              }}
            >
              <span style={{ fontSize: 16, color: "#375623", fontWeight: 700 }}>
                Bạn có {tasks.filter(t => t.status === "PENDING").length} sự cố sửa chữa CHƯA TIẾP NHẬN được phân công hôm nay.
              </span>
              <button
                onClick={() => {
                  setFilterStatus("PENDING");
                  setActiveTab("Danh sách sự cố");
                }}
                style={{
                  background: "#2E7D32",
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
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>SỰ CỐ TOÀN CỤC CHƯA XỬ LÝ</span>
                <h3 style={{ fontSize: 28, margin: "8px 0 0", color: "#FF9100", fontWeight: 800 }}>
                  {tasks.filter(t => t.status === 'PENDING').length}
                </h3>
              </div>
              <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>ĐANG TRONG TIẾN TRÌNH</span>
                <h3 style={{ fontSize: 28, margin: "8px 0 0", color: "#0A4E9B", fontWeight: 800 }}>
                  {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                </h3>
              </div>
              <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>ĐÃ KHẮC PHỤC XONG</span>
                <h3 style={{ fontSize: 28, margin: "8px 0 0", color: "#10B981", fontWeight: 800 }}>
                  {tasks.filter(t => t.status === 'COMPLETED').length}
                </h3>
              </div>
            </div>

            {/* List of critical issues */}
            <div style={{ background: "#FFFFFF", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ background: "#0A4E9B", padding: "14px 20px", color: "#FFFFFF", fontSize: 18, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Bàn Giao Trọng Điểm Cần Xử Lý Gấp</span>
                <FaTools />
              </div>
              <div style={{ padding: 0 }}>
                {tasks.filter(t => t.severity === "HIGH" && t.status !== "COMPLETED").map((task, idx) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setActiveTask(task);
                      setActiveTab("Danh sách sự cố");
                    }}
                    style={{
                      padding: "16px 20px",
                      background: idx % 2 === 0 ? "#FFF5F5" : "#FFFFFF",
                      borderBottom: "1px solid #E0E0E0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer"
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 800, color: "#DC2626", marginRight: 8 }}>[KHẨN CẤP]</span>
                      <strong>Phòng {task.room} - Tòa {task.dom}</strong>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#475569" }}>
                        Mô tả: {task.description}
                      </p>
                    </div>
                    <div>
                      <span style={{
                        padding: "4px 10px",
                        background: "#FEE2E2",
                        color: "#B91C1C",
                        fontSize: 12,
                        borderRadius: 6,
                        fontWeight: 700
                      }}>
                        HIGH
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Task lists and status updating */}
        {activeTab === "Danh sách sự cố" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "start" }}>
            {/* Left side list */}
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, color: "#0A4E9B" }}>Danh Sách Phiếu Việc</h3>
                
                {/* Status selector tab */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                    background: "white"
                  }}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="IN_PROGRESS">Đang sửa chữa</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredTasks.map(task => {
                  const isSelected = activeTask && activeTask.id === task.id;
                  return (
                    <div
                      key={task.id}
                      onClick={() => setActiveTask(task)}
                      style={{
                        padding: "16px",
                        borderRadius: 12,
                        border: isSelected ? "2px solid #2E7D32" : "1px solid #E2E8F0",
                        background: isSelected ? "#F1F8F5" : "white",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div>
                          <span style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>PHIẾU: {task.id}</span>
                          <h4 style={{ margin: "2px 0 6px 0", color: "#0F172A", fontSize: 16 }}>Phòng {task.room} - Tòa {task.dom}</h4>
                        </div>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 10,
                          fontSize: 10,
                          fontWeight: 700,
                          background: task.severity === "HIGH" ? "#FEE2E2" : task.severity === "MEDIUM" ? "#FEF3C7" : "#ECFDF5",
                          color: task.severity === "HIGH" ? "#991B1B" : task.severity === "MEDIUM" ? "#92400E" : "#065F46"
                        }}>
                          {task.severity}
                        </span>
                      </div>
                      
                      <p style={{ margin: "0 0 10px 0", fontSize: 13, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {task.description}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#64748B" }}>
                        <span>Linh kiện: <strong>{task.type}</strong></span>
                        <span style={{
                          fontWeight: 700,
                          color: task.status === "PENDING" ? "#F59E0B" : task.status === "IN_PROGRESS" ? "#2563EB" : "#10B981"
                        }}>
                          {task.status === "PENDING" ? "Chờ xử lý" : task.status === "IN_PROGRESS" ? "Đang tiến hành" : "Đã xong"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side detailed editor panel */}
            {activeTask ? (
              <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #E2E8F0" }}>
                <h3 style={{ margin: "0 0 4px 0", color: "#0A4E9B" }}>Phác Thảo Chi Tiết Yêu Cầu</h3>
                <span style={{ fontSize: 11, color: "#64748B" }} >Hồ sơ phiếu: <strong>{activeTask.id}</strong> | Khởi tạo: {activeTask.date}</span>
                
                {/* Visual state selector */}
                <div style={{ marginTop: 16, padding: "14px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>TIẾN TRÌNH THỰC HIỆN</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleUpdateStatus(activeTask.id, "PENDING")}
                      disabled={activeTask.status === "PENDING"}
                      style={{
                        flex: 1,
                        padding: "6px",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 6,
                        border: "none",
                        cursor: activeTask.status === "PENDING" ? "not-allowed" : "pointer",
                        background: activeTask.status === "PENDING" ? "#F59E0B" : "#E2E8F0",
                        color: activeTask.status === "PENDING" ? "white" : "#475569"
                      }}
                    >
                      Bàn Giao
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(activeTask.id, "IN_PROGRESS")}
                      disabled={activeTask.status === "IN_PROGRESS"}
                      style={{
                        flex: 1,
                        padding: "6px",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 6,
                        border: "none",
                        cursor: activeTask.status === "IN_PROGRESS" ? "not-allowed" : "pointer",
                        background: activeTask.status === "IN_PROGRESS" ? "#2563EB" : "#E2E8F0",
                        color: activeTask.status === "IN_PROGRESS" ? "white" : "#475569"
                      }}
                    >
                      Tiến Hành
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(activeTask.id, "COMPLETED")}
                      disabled={activeTask.status === "COMPLETED"}
                      style={{
                        flex: 1,
                        padding: "6px",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 6,
                        border: "none",
                        cursor: activeTask.status === "COMPLETED" ? "not-allowed" : "pointer",
                        background: activeTask.status === "COMPLETED" ? "#10B981" : "#E2E8F0",
                        color: activeTask.status === "COMPLETED" ? "white" : "#475569"
                      }}
                    >
                      Xác Nhận Xong
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Vị trí phát sinh sự cố</div>
                  <p style={{ margin: "4px 0 10px 0", fontSize: 14 }}>Phòng <strong>{activeTask.room}</strong> - Khu vực tòa KTX <strong>{activeTask.dom}</strong></p>

                  <div style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Nội dung lỗi kỹ thuật</div>
                  <p style={{ margin: "4px 0 16px 0", fontSize: 13, color: "#334155", background: "#FFFBF2", padding: "10px", borderRadius: 8, border: "1px dashed #FFE2B7" }}>
                    {activeTask.description}
                  </p>
                </div>

                {/* technical logs */}
                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 16, marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8 }}>Nhật ký chẩn đoán kỹ thuật ({activeTask.notes.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 150, overflowY: "auto", marginBottom: 12 }}>
                    {activeTask.notes.map((note, index) => (
                      <div key={index} style={{ background: "#F8FAFC", padding: "8px 10px", borderRadius: 8, fontSize: 11, border: "1px solid #F1F5F9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", marginBottom: 4 }}>
                          <strong>{note.author}</strong>
                          <span>{note.date}</span>
                        </div>
                        <span style={{ color: "#334155" }}>{note.content}</span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddNoteText} style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Ghi nhận phụ kiện / chi tiết sửa chữa..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "1px solid #CBD5E1",
                        borderRadius: 8,
                        fontSize: 13
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: "#2E7D32",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        padding: "0 16px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      Lưu
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div style={{ border: "2px dashed #CBD5E1", borderRadius: 16, padding: 48, textAlign: "center", color: "#64748B" }}>
                Chọn một phiếu gác việc bên trái để xem tiến độ kỹ thuật và thêm ghi chú phụ tùng vật tư.
              </div>
            )}
          </div>
        )}

        {/* Create manual repair ticket */}
        {activeTab === "Lập phiếu sự cố" && (
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#0A4E9B" }}>Phát hiện đột xuất hoặc yêu cầu khẩn cấp tại chỗ</h3>
            <form onSubmit={handleSubmitManualTicket} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Khu vực Tòa KTX</label>
                  <select
                    value={createForm.dom}
                    onChange={(e) => setCreateForm({ ...createForm, dom: e.target.value })}
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, background: "white" }}
                  >
                    <option value="A">Tòa nhà KTX A</option>
                    <option value="B">Tòa nhà KTX B</option>
                    <option value="C">Tòa nhà KTX C</option>
                    <option value="D">Tòa nhà KTX D</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Số phòng học viên</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 302, 105..."
                    value={createForm.room}
                    onChange={(e) => setCreateForm({ ...createForm, room: e.target.value })}
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Phân nhóm thiết bị</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, background: "white" }}
                  >
                    <option value="Điều hòa">Thiết bị Điều hòa / Nhiệt độ</option>
                    <option value="Điện & Ánh sáng">Hệ thống Điện / Bóng chiếu sáng</option>
                    <option value="Nước & Vệ sinh">Hệ thống Cấp nước / Nhà vệ sinh</option>
                    <option value="Khóa & Cửa">Khóa cửa / Bản lề kính</option>
                    <option value="Vật dụng gỗ">Bàn học / Giường / Tủ gỗ</option>
                    <option value="Hành lang chung">Tiện ích khuôn viên công cộng</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Mức độ khẩn cấp đề xuất</label>
                  <select
                    value={createForm.severity}
                    onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value })}
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, background: "white" }}
                  >
                    <option value="LOW">Thấp (Chờ xử lý tuần tự - LOW)</option>
                    <option value="MEDIUM">Vừa (Hỏng hóc cản trở sinh hoạt phụ - MEDIUM)</option>
                    <option value="HIGH">Gấp (Hư hỏng nguy cơ/mất nước cản trở trực tiếp - HIGH)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Mô tả trạng thái lỗi chi tiết</label>
                <textarea
                  rows="4"
                  placeholder="Mô tả lỗi phát hiện (Ví dụ: vỡ van khóa vòi hoa sen làm nước bắn tung tóe)..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  background: "#2E7D32",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: 10
                }}
              >
                Gửi Phiếu Yêu Cầu Kỹ Thuật
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default MaintenanceDashboard;
