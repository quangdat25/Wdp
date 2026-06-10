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
} from "react-icons/fa";

import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../api/authService";

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuStyle = (path) => ({
    border: "none",
    height: 54,
    borderRadius: 14,
    background: isActive(path)
      ? "rgba(255,255,255,0.25)"
      : "rgba(255,255,255,0.08)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "0 18px",
    fontSize: 15,
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
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      <div>
        {/* Logo */}
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: 18,
            marginBottom: 28,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#fff",
            }}
          >
            FPT Dormitory
          </h2>

          <p
            style={{
              marginTop: 8,
              color: "#fff",
              fontSize: 13,
            }}
          >
            Dormitory Management System
          </p>
        </div>

        {/* Dashboard */}
        <button
          style={menuStyle("/admin/dashboard")}
          onClick={() => navigate("/admin/dashboard")}
        >
          <FaChartPie />
          Bảng điều khiển
        </button>

        {/* Student */}
        <button
          style={{
            ...menuStyle("/admin/students"),
            marginTop: 10,
          }}
          onClick={() => navigate("/admin/students")}
        >
          <FaUserGraduate />
          Quản lý sinh viên
        </button>

        <button
          style={{
            ...menuStyle("/admin/personnel"),
            marginTop: 10,
          }}
          onClick={() => navigate("/admin/personnel")}
        >
          <FaUsers />
          Quản lý nhân sự
        </button>

        {/* Room */}
        <button
          style={{
            ...menuStyle("/admin/notifications"),
            marginTop: 10,
          }}
          onClick={() => navigate("/admin/notifications")}
        >
          <FaBell />
          Quản lý thông báo
        </button>

        {/* Payment */}
        <button
          style={{
            ...menuStyle("/admin/payments"),
            marginTop: 10,
          }}
          onClick={() => navigate("/admin/payments")}
        >
          <FaMoneyBillWave />
          Thanh toán
        </button>

        {/* Request */}
        <button
          style={{
            ...menuStyle("/admin/requests"),
            marginTop: 10,
          }}
          onClick={() => navigate("/admin/requests")}
        >
          <FaTools />
          Yêu cầu
        </button>

        {/* Account */}
        <button
          style={{
            ...menuStyle("/admin/accounts"),
            marginTop: 10,
          }}
          onClick={() => navigate("/admin/accounts")}
        >
          <FaUsersCog />
          Tài khoản
        </button>
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
