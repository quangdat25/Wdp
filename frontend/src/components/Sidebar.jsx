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
  FaLifeRing,
  FaClipboardList,
} from "react-icons/fa";

import { useNavigate, useLocation } from "react-router-dom";
import authService from "../api/authService";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

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

  const menusByRole = {
    admin: [
      {
        path: "/admin/dashboard",
        label: "Bảng điều khiển",
        icon: <FaChartPie />,
      },
      {
        path: "/admin/rooms",
        label: "Quản lý phòng ở",
        icon: <FaBed />,
      },
      {
        path: "/admin/students",
        label: "Quản lý sinh viên",
        icon: <FaUserGraduate />,
      },
      {
        path: "/admin/personnel",
        label: "Quản lý nhân sự",
        icon: <FaUsers />,
      },
      {
        path: "/admin/notifications",
        label: "Quản lý thông báo",
        icon: <FaBell />,
      },
      {
        path: "/admin/payments",
        label: "Thanh toán",
        icon: <FaMoneyBillWave />,
      },
      {
        path: "/admin/requests",
        label: "Yêu cầu",
        icon: <FaTools />,
      },
      {
        path: "/admin/accounts",
        label: "Tài khoản",
        icon: <FaUsersCog />,
      },
    ],

    manager: [
      {
        path: "/manager/dashboard",
        label: "Bảng điều khiển",
        icon: <FaChartPie />,
      },
      {
        path: "/manager/students",
        label: "Quản lý sinh viên",
        icon: <FaUserGraduate />,
      },
      {
        path: "/manager/rooms",
        label: "Quản lý phòng",
        icon: <FaBed />,
      },
      {
        path: "/manager/tickets",
        label: "Quản lý yêu cầu",
        icon: <FaClipboardList />,
      },
      {
        path: "/manager/notifications",
        label: "Thông báo",
        icon: <FaBell />,
      },
    ],

    staff: [
      {
        path: "/staff/dashboard",
        label: "Bảng điều khiển",
        icon: <FaChartPie />,
      },
      {
        path: "/staff/requests",
        label: "Xử lý yêu cầu",
        icon: <FaTools />,
      },
      {
        path: "/staff/students",
        label: "Sinh viên",
        icon: <FaUserGraduate />,
      },
    ],

    student: [
      {
        path: "/student/dashboard",
        label: "Bảng điều khiển",
        icon: <FaChartPie />,
      },
      {
        path: "/student/room",
        label: "Phòng của tôi",
        icon: <FaBed />,
      },
      {
        path: "/student/payments",
        label: "Thanh toán",
        icon: <FaMoneyBillWave />,
      },
      {
        path: "/student/requests",
        label: "Yêu cầu",
        icon: <FaTools />,
      },
      {
        path: "/student/support/request",
        label: "Gửi yêu cầu hỗ trợ",
        icon: <FaLifeRing />,
      },
      {
        path: "/student/my/tickets",
        label: "Yêu cầu hỗ trợ",
        icon: <FaClipboardList />,
      },
      {
        path: "/student/notifications",
        label: "Thông báo",
        icon: <FaBell />,
      },
    ],

    parent: [
      {
        path: "/parent/dashboard",
        label: "Bảng điều khiển",
        icon: <FaChartPie />,
      },
      {
        path: "/parent/student",
        label: "Thông tin sinh viên",
        icon: <FaUserGraduate />,
      },
      {
        path: "/parent/payments",
        label: "Thanh toán",
        icon: <FaMoneyBillWave />,
      },
      {
        path: "/parent/requests",
        label: "Yêu cầu",
        icon: <FaTools />,
      },
      {
        path: "/parent/notifications",
        label: "Thông báo",
        icon: <FaBell />,
      },
    ],
  };

  const menus = menusByRole[role] || [];

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
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: 18,
            marginBottom: 28,
          }}
        >
          <h2 style={{ margin: 0, color: "#fff" }}>FPT Dormitory</h2>

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

        {menus.map((item, index) => (
          <button
            key={item.path}
            style={{
              ...menuStyle(item.path),
              marginTop: index === 0 ? 0 : 10,
            }}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
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

export default Sidebar;
