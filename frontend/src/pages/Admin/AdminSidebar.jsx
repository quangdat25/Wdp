import {
  FaChartPie,
  FaUserGraduate,
  FaBed,
  FaMoneyBillWave,
  FaTools,
  FaUsersCog,
  FaSignOutAlt,
  FaUsers,
  FaBell,
  FaBuilding,
} from "react-icons/fa";

import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../api/authService";

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuStyle = (path) => ({
    border: "none",
    height: 46,
    borderRadius: 12,
    background: isActive(path)
      ? "rgba(255,255,255,0.25)"
      : "rgba(255,255,255,0.08)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 16px",
    fontSize: 14,
    fontWeight: isActive(path) ? 700 : 500,
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    width: "100%",
  });

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 270,
        height: "100vh",
        background:
          "linear-gradient(180deg, #34d399 0%, #22c55e 50%, #16a34a 100%)",
        padding: "16px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowY: "auto", flex: 1, paddingRight: 2 }}>
        {/* Logo */}
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#fff",
              fontSize: 18,
            }}
          >
            FPT Dormitory
          </h2>

          <p
            style={{
              marginTop: 4,
              color: "#fff",
              fontSize: 12,
              margin: "4px 0 0",
            }}
          >
            Dormitory Management System
          </p>
        </div>

        {/* Nav menu */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button style={menuStyle("/admin/dashboard")} onClick={() => navigate("/admin/dashboard")}>
            <FaChartPie /> Bảng điều khiển
          </button>
          <button style={menuStyle("/admin/rooms")} onClick={() => navigate("/admin/rooms")}>
            <FaBed /> Quản lý phòng ở
          </button>
          <button style={menuStyle("/admin/buildings")} onClick={() => navigate("/admin/buildings")}>
            <FaBuilding /> Quản lý tòa nhà
          </button>
          <button style={menuStyle("/admin/students")} onClick={() => navigate("/admin/students")}>
            <FaUserGraduate /> Quản lý sinh viên
          </button>
          <button style={menuStyle("/admin/personnel")} onClick={() => navigate("/admin/personnel")}>
            <FaUsers /> Quản lý nhân sự
          </button>
          <button style={menuStyle("/admin/notifications")} onClick={() => navigate("/admin/notifications")}>
            <FaBell /> Quản lý thông báo
          </button>
          <button style={menuStyle("/admin/payments")} onClick={() => navigate("/admin/payments")}>
            <FaMoneyBillWave /> Thanh toán
          </button>
          <button style={menuStyle("/admin/requests")} onClick={() => navigate("/admin/requests")}>
            <FaTools /> Yêu cầu
          </button>
          <button style={menuStyle("/admin/accounts")} onClick={() => navigate("/admin/accounts")}>
            <FaUsersCog /> Tài khoản
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={async () => {
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
        }}
        style={{
          border: "none",
          height: 54,
          borderRadius: 14,
          background: "#fff",
          color: "#16a34a",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <FaSignOutAlt />
        Đăng xuất
      </button>
    </aside>
  );
}

export default AdminSidebar;
