import { useState, useEffect } from "react";
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
  FaWrench,
  FaShieldAlt,
  FaPlusCircle,
  FaSearch,
  FaBuilding,
  FaDoorOpen,
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaTimes,
  FaBook,
  FaCogs,
} from "react-icons/fa";

import { useNavigate, useLocation } from "react-router-dom";
import authService from "../api/authService";
import { showSuccess } from "../components/Alert";
function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isOpen, setIsOpen] = useState(false);
  const [hasBuilding, setHasBuilding] = useState(true);
  const [hoveredPath, setHoveredPath] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  useEffect(() => {
    if (role === "staff" && user?.staffType === "security") {
      authService
        .getMe()
        .then((res) => {
          if (res.success && res.data && !res.data.buildingId) {
            setHasBuilding(false);
          }
        })
        .catch((err) => {
          console.error("Error checking building assignment:", err);
        });
    }
  }, [role, user?.staffType]);

  const isActive = (path) => {
    const currentFull = location.pathname + location.search;
    return (
      currentFull === path ||
      (path === location.pathname && location.search === "")
    );
  };

  const menuStyle = (path) => {
    const active = isActive(path);
    const hovered = hoveredPath === path;
    return {
      border: "none",
      height: 48,
      borderRadius: 12,
      background: active
        ? "#ffffff"
        : hovered
          ? "rgba(255,255,255,0.15)"
          : "transparent",
      color: active ? "#16A34A" : "rgba(255,255,255,0.9)",
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "0 16px",
      fontSize: 15,
      fontWeight: active ? 600 : 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
      width: "100%",
    };
  };

  const menusByRole = {
    admin: [
      {
        path: "/admin/dashboard",
        label: "Bảng điều khiển",
        icon: <FaChartPie />,
      },
      {
        path: "/admin/semesters",
        label: "Quản lý kỳ học",
        icon: <FaCalendarAlt />,
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
        path: "/admin/system-configs",
        label: "Cấu hình hệ thống",
        icon: <FaCogs />,
      },
    ],

    manager: [
      {
        path: "/manager/dashboard",
        label: "Bảng điều khiển",
        icon: <FaChartPie />,
      },
      {
        path: "/manager/buildings",
        label: "Quản lý tòa nhà",
        icon: <FaBuilding />,
      },
      {
        path: "/manager/students",
        label: "Quản lý sinh viên",
        icon: <FaUserGraduate />,
      },
      {
        path: "/manager/bookings",
        label: "Quản lý đặt phòng",
        icon: <FaClipboardList />,
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
        path: "/manager/utility-invoices",
        label: "Hóa đơn điện nước",
        icon: <FaFileInvoiceDollar />,
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

    cleaner: [
      {
        path: "/staff/dashboard/cleaner",
        label: "Trang chủ",
        icon: <FaChartPie />,
      },
      {
        path: "/staff/dashboard/cleaner/tasks",
        label: "Dọn dẹp phòng",
        icon: <FaClipboardList />,
      },
      {
        path: "/staff/dashboard/cleaner/issues",
        label: "Sự cố kỹ thuật",
        icon: <FaTools />,
      },
    ],

    maintenance: [
      {
        path: "/staff/dashboard/maintenance",
        label: "Trang chủ",
        icon: <FaChartPie />,
      },
      {
        path: "/staff/dashboard/maintenance/tasks",
        label: "Danh sách sự cố",
        icon: <FaWrench />,
      },
      {
        path: "/staff/utility-usages",
        label: "Import điện nước",
        icon: <FaFileInvoiceDollar />,
      },
    ],

    security: [
      {
        path: "/staff/dashboard/security",
        label: "Trang chủ",
        icon: <FaChartPie />,
      },
      {
        path: "/staff/dashboard/security/create-report",
        label: "Lập biên bản",
        icon: <FaPlusCircle />,
      },
      {
        path: "/staff/dashboard/security/search",
        label: "Tìm kiếm sinh viên",
        icon: <FaSearch />,
      },
    ],

    student: [
      {
        path: "/student/dashboard",
        label: "Trang chủ",
        icon: <FaChartPie />,
      },
      {
        path: "/student/booking",
        label: "Đặt phòng",
        icon: <FaDoorOpen />,
      },
      {
        path: "/student/room",
        label: "Phòng của tôi",
        icon: <FaBed />,
      },
      {
        path: "/student/invoices",
        label: "Hóa đơn",
        icon: <FaMoneyBillWave />,
      },
      {
        path: "/student/my-utilities",
        label: "Dịch vụ",
        icon: <FaMoneyBillWave />,
      },
      {
        path: "/student/tickets",
        label: "Yêu cầu hỗ trợ",
        icon: <FaClipboardList />,
      },
      {
        path: "/img/KTX.pdf",
        label: "Nội quy ký túc xá",
        icon: <FaBook />,
        isExternal: true,
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

  const menus =
    menusByRole[role === "staff" && user?.staffType ? user.staffType : role] ||
    menusByRole[role] ||
    [];
  // let menus =
  //   menusByRole[role === "staff" && user?.staffType ? user.staffType : role] ||
  //   menusByRole[role] ||
  //   [];

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
      showSuccess("Đăng xuất thành công");
    }
  };

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            position: "fixed",
            top: 13,
            left: 13,
            zIndex: 1050,
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "#16a34a",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            cursor: "pointer",
            border: "none",
          }}
        >
          {isOpen ? (
            <FaTimes />
          ) : (
            <span style={{ fontSize: 24, lineHeight: 1 }}>☰</span>
          )}
        </button>
      )}

      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(2px)",
            zIndex: 1010,
          }}
        />
      )}

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: isMobile ? (isOpen ? 0 : -240) : 0,
          width: 240,
          height: "100vh",
          background:
            "linear-gradient(180deg, #34d399 0%, #22c55e 50%, #16a34a 100%)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          zIndex: 1020,
          transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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

          {menus.map((item, index) => {
            const isDisabled =
              role === "staff" &&
              user?.staffType === "security" &&
              !hasBuilding &&
              item.path !== "/staff/dashboard/security";
            return (
              <button
                key={item.path}
                disabled={isDisabled}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
                style={{
                  ...menuStyle(item.path),
                  marginTop: index === 0 ? 0 : 8,
                  ...(isDisabled && {
                    opacity: 0.5,
                    cursor: "not-allowed",
                  }),
                }}
                onClick={() => {
                  if (isDisabled) return;
                  if (item.isExternal) {
                    window.open(item.path, "_blank");
                  } else {
                    navigate(item.path);
                  }
                }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
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
    </>
  );
}

export default Sidebar;
