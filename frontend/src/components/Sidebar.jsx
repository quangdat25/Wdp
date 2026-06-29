import { useState } from "react";
import {
  FaBars,
  FaTimes,
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
  FaWrench,
  FaShieldAlt,
  FaPlusCircle,
  FaSearch,
  FaBuilding,
} from "react-icons/fa";

import { useNavigate, useLocation } from "react-router-dom";
import authService from "../api/authService";
import logoImg from "../assets/logo-removebg-preview.png";
import "./Sidebar.css";

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const isActive = (path) => {
    const currentFull = location.pathname + location.search;
    return currentFull === path || (path === location.pathname && location.search === "");
  };

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
        path: "/admin/buildings",
        label: "Quản lý tòa nhà",
        icon: <FaBuilding />,
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
        path: "/manager/violations",
        label: "Quản lý Kỷ luật",
        icon: <FaShieldAlt />,
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

    cleaning: [
      { path: "/staff/dashboard/cleaning", label: "Trang chủ", icon: <FaChartPie /> },
      { path: "/staff/dashboard/cleaning?tab=Dọn dẹp phòng", label: "Dọn dẹp phòng", icon: <FaClipboardList /> },
      { path: "/staff/dashboard/cleaning?tab=Sự cố kỹ thuật", label: "Sự cố kỹ thuật", icon: <FaTools /> },
    ],

    maintenance: [
      { path: "/staff/dashboard/maintenance", label: "Trang chủ", icon: <FaChartPie /> },
      { path: "/staff/dashboard/maintenance?tab=Danh sách sự cố", label: "Danh sách sự cố", icon: <FaWrench /> },
      { path: "/staff/dashboard/maintenance?tab=Lập phiếu sự cố", label: "Lập phiếu sự cố", icon: <FaPlusCircle /> },
    ],

    security: [
      { path: "/staff/dashboard/security", label: "Trang chủ", icon: <FaChartPie /> },
      { path: "/staff/dashboard/security/history", label: "Lịch sử ra vào", icon: <FaShieldAlt /> },
      { path: "/staff/dashboard/security/create-report", label: "Lập biên bản", icon: <FaPlusCircle /> },
      { path: "/staff/dashboard/security/search", label: "Tìm kiếm sinh viên", icon: <FaSearch /> },
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

  const menus = menusByRole[role === "staff" && user?.staffType ? user.staffType : role] || menusByRole[role] || [];

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
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div
        className={`mobile-overlay ${mobileOpen ? "mobile-open" : ""}`}
        onClick={() => setMobileOpen(false)}
      ></div>

      <aside className={`sidebar-aside ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Brand */}
        <div>
          <div className="sidebar-brand">
            <img
              src={logoImg}
              alt="FPT Dormitory"
              className="sidebar-logo"
            />
            <div>
              <h2 className="sidebar-brand-name">FPT Dormitory</h2>
              <p className="sidebar-brand-sub">Dormitory Management System</p>
            </div>
          </div>

          {/* Menu items */}
          {menus.map((item) => (
            <button
              key={item.path}
              className={`sidebar-menu-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Logout */}
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          Đăng xuất
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
