import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import authService from "../../api/authService";
import { FaBell } from "react-icons/fa";
import Header from "../../components/Headers";
import OverviewTab from "./SecurityTabs/OverviewTab";
import GateHistoryTab from "./SecurityTabs/GateHistoryTab";
import CreateReportTab from "./SecurityTabs/CreateReportTab";
import SearchStudentTab from "./SecurityTabs/SearchStudentTab";

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
  const path = location.pathname;
  let pageTitle = "Security Board";
  if (path.includes("history")) pageTitle = "Lịch sử ra vào";
  else if (path.includes("create-report")) pageTitle = "Lập biên bản";
  else if (path.includes("search")) pageTitle = "Tìm kiếm sinh viên";

  // Shared State Management
  const [students, setStudents] = useState(initialStudents);
  const [gateLogs, setGateLogs] = useState(initialGateLogs);
  const [selectedStudent, setSelectedStudent] = useState(null);

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
        <Header/>

        {/* Tab content rendering via Routes */}
        <Routes>
          <Route path="/" element={<OverviewTab />} />
          <Route path="history" element={<GateHistoryTab gateLogs={gateLogs} setGateLogs={setGateLogs} students={students} setSelectedStudent={setSelectedStudent} navigate={navigate} />} />
          <Route path="create-report" element={<CreateReportTab students={students} setStudents={setStudents} />} />
          <Route path="search" element={<SearchStudentTab />} />
        </Routes>

      </main>
    </div>
  );
}

export default SecurityDashboard;
