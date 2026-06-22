import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import authService from "../../api/authService";
import { FaBell, FaShieldAlt, FaPlusCircle, FaSearch } from "react-icons/fa";

// Initial fake data right inside the file
const initialStudents = [
  {
    id: "SV001",
    name: "Nguyễn Hoàng Nam",
    room: "302",
    dom: "A",
    phone: "0912345678",
    email: "namnhsv001@fpt.edu.vn",
    parentName: "Nguyễn Văn Hùng",
    parentPhone: "0987654321",
    cfdScore: 95,
    violations: [
      { id: "V001", date: "2026-06-01", type: "Vào muộn", description: "Bị ghi nhận vào muộn sau 23h00 (23:15)", pointsDeducted: 5 }
    ]
  },
  {
    id: "SV002",
    name: "Trần Minh Quang",
    room: "105",
    dom: "B",
    phone: "0909998887",
    email: "quangtm105@fpt.edu.vn",
    parentName: "Trần Thế Anh",
    parentPhone: "0907112233",
    cfdScore: 75,
    violations: [
      { id: "V002", date: "2026-05-15", type: "Nấu ăn phi pháp", description: "Sử dụng bếp ga du lịch trong phòng ngủ", pointsDeducted: 15 },
      { id: "V003", date: "2026-05-20", type: "Vào muộn", description: "Về muộn không lý do 23h40", pointsDeducted: 10 }
    ]
  },
  {
    id: "SV003",
    name: "Lê Thị Lan Anh",
    room: "220",
    dom: "C",
    phone: "0977888999",
    email: "lananhlt220@fpt.edu.vn",
    parentName: "Lê Văn Tám",
    parentPhone: "0966555444",
    cfdScore: 100,
    violations: []
  }
];

const initialGateLogs = [
  { id: "G001", studentId: "SV001", studentName: "Nguyễn Hoàng Nam", room: "302", dom: "A", time: "2026-06-08 23:15:30", direction: "IN", status: "LATE" },
  { id: "G002", studentId: "SV003", studentName: "Lê Thị Lan Anh", room: "220", dom: "C", time: "2026-06-08 19:30:10", direction: "IN", status: "NORMAL" },
  { id: "G003", studentId: "SV002", studentName: "Trần Minh Quang", room: "105", dom: "B", time: "2026-06-08 17:15:00", direction: "OUT", status: "NORMAL" }
];

function SecurityDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Trang chủ");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
    else setActiveTab("Trang chủ");
  }, [location.search]);

  // State Management inside the file
  const [students, setStudents] = useState(initialStudents);
  const [gateLogs, setGateLogs] = useState(initialGateLogs);
  
  // Search & Form States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Modal states for adding violation
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationForm, setViolationForm] = useState({
    studentId: "",
    type: "Vào muộn",
    description: "",
    pointsDeducted: 5
  });

  const menuItems = [
    "Trang chủ",
    "Lịch sử ra vào",
    "Lập biên bản",
    "Tìm kiếm sinh viên"
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

  const handleCreateViolation = (e) => {
    e.preventDefault();
    if (!violationForm.studentId) {
      alert("Vui lòng chọn hoặc nhập mã số sinh viên!");
      return;
    }

    const studentExists = students.find(s => s.id.toLowerCase() === violationForm.studentId.toLowerCase());
    if (!studentExists) {
      alert("Mã sinh viên không khớp trong hệ thống!");
      return;
    }

    // Update students details
    const updatedStudents = students.map(s => {
      if (s.id.toLowerCase() === violationForm.studentId.toLowerCase()) {
        const newScore = Math.max(0, s.cfdScore - Number(violationForm.pointsDeducted));
        return {
          ...s,
          cfdScore: newScore,
          violations: [
            ...s.violations,
            {
              id: "V" + (s.violations.length + 101),
              date: new Date().toISOString().split('T')[0],
              type: violationForm.type,
              description: violationForm.description,
              pointsDeducted: Number(violationForm.pointsDeducted)
            }
          ]
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    alert(`Lập văn bản thành công! Đã cập nhật điểm CFD của sinh viên ${studentExists.name}.`);
    
    // Clear and close
    setViolationForm({
      studentId: "",
      type: "Vào muộn",
      description: "",
      pointsDeducted: 5
    });
    setShowViolationModal(false);
  };

  // Filter logs based on search query
  const filteredLogs = gateLogs.filter(log => 
    log.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.studentId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.room.includes(searchQuery)
  );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F5F6F8",
        fontFamily: "'Inter', sans-serif",
      }}
      id="security-dashboard-container"
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
            {activeTab === "Trang chủ" ? "Security Board" : activeTab}
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
              BV
            </div>
          </div>
        </header>

        {/* Home dashboard stats & quick cards */}
        {activeTab === "Trang chủ" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Quick alert */}
            <div
              style={{
                background: "#FFEEC2",
                borderRadius: 12,
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #FFD085"
              }}
            >
              <span style={{ fontSize: 16, color: "#9E5700", fontWeight: 700 }}>
                Cảnh báo an ninh: Phát hiện {gateLogs.filter(l => l.status === 'LATE').length} trường hợp ký túc vào muộn quá 23h hôm nay.
              </span>
              <button
                onClick={() => navigate("/staff/dashboard/security?tab=Lịch sử ra vào")}
                style={{
                  background: "#D84315",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                Xem ngay
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>TỔNG SỐ XE RA VÀO / NGÀY</span>
                <h3 style={{ fontSize: 28, margin: "8px 0 0", color: "#0A4E9B", fontWeight: 800 }}>8,421</h3>
              </div>
              <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>SINH VIÊN ĐÃ ĐIỂM DANH</span>
                <h3 style={{ fontSize: 28, margin: "8px 0 0", color: "#10B981", fontWeight: 800 }}>98.2%</h3>
              </div>
              <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>VI PHẠM GHI NHẬN HÔM NAY</span>
                <h3 style={{ fontSize: 28, margin: "8px 0 0", color: "#EF4444", fontWeight: 800 }}>{students.reduce((acc, curr) => acc + curr.violations.length, 0)}</h3>
              </div>
            </div>

            {/* Recent violations card logs */}
            <div style={{ background: "#FFFFFF", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ background: "#0A4E9B", padding: "14px 20px", color: "#FFFFFF", fontSize: 18, fontWeight: 700 }}>
                Nhật Ký Vi Phạm An Ninh Mới Nhất
              </div>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {students.flatMap(s => s.violations.map(v => ({ ...v, studentName: s.name, studentId: s.id, room: s.room, dom: s.dom }))).map((violation, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "16px 20px",
                      background: index % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
                      borderBottom: "1px solid #E2E8F0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <strong style={{ color: "#EF4444" }}>[{violation.type}]</strong> - {violation.studentName} ({violation.studentId})
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748B" }}>
                        Phòng {violation.room} - Tòa {violation.dom} • Lý do: {violation.description}
                      </p>
                    </div>
                    <div style={{ fontWeight: 700, color: "#DC2626", fontSize: 13 }}>
                      -{violation.pointsDeducted} điểm CFD
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Gate logs management */}
        {activeTab === "Lịch sử ra vào" && (
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
                          navigate("/staff/dashboard/security?tab=Tìm kiếm sinh viên");
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
        )}

        {/* Disciplinary violation forms */}
        {activeTab === "Lập biên bản" && (
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#0A4E9B" }}>Khai báo biên bản sự vụ quy chế</h3>
            <form onSubmit={handleCreateViolation} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>MSSV / Mã sinh viên vi phạm</label>
                <select
                  value={violationForm.studentId}
                  onChange={(e) => setViolationForm({ ...violationForm, studentId: e.target.value })}
                  style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, background: "white" }}
                  required
                >
                  <option value="">-- Chọn sinh viên vi phạm --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id}) - Phòng {s.room} ({s.dom})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Phân loại vi phạm</label>
                <select
                  value={violationForm.type}
                  onChange={(e) => setViolationForm({ ...violationForm, type: e.target.value })}
                  style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, background: "white" }}
                >
                  <option value="Vào muộn">Vào muộn sau giờ giới nghiêm (23:00)</option>
                  <option value="Nấu ăn phi pháp">Nấu ăn cấm trong phòng ngủ</option>
                  <option value="Làm ồn mất trật tự">Làm ồn quá 22:00 ảnh hưởng xung quanh</option>
                  <option value="Mất vệ sinh chung">Phòng bẩn / xả rác không dọn dẹp</option>
                  <option value="Khác">Hành vi kỷ luật khác</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Điểm CFD trừ dự kiến</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={violationForm.pointsDeducted}
                  onChange={(e) => setViolationForm({ ...violationForm, pointsDeducted: e.target.value })}
                  style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14 }}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Ghi chú sự vụ cụ thể</label>
                <textarea
                  rows="4"
                  placeholder="Nhập tình huống cụ thể (Địa điểm, giờ, nhân chứng/vật chứng)..."
                  value={violationForm.description}
                  onChange={(e) => setViolationForm({ ...violationForm, description: e.target.value })}
                  style={{ padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14 }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  background: "#DC2626",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: 10
                }}
              >
                Trừ điểm & Ghi nhận vi phạm
              </button>
            </form>
          </div>
        )}

        {/* Searching profile pages */}
        {activeTab === "Tìm kiếm sinh viên" && (
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
        )}
      </main>
    </div>
  );
}

export default SecurityDashboard;
