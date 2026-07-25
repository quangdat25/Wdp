import { useEffect, useState } from "react";
import {
  FaBell,
  FaBed,
  FaBook,
  FaBuilding,
  FaCalendarAlt,
  FaChartPie,
  FaClipboardCheck,
  FaClipboardList,
  FaCogs,
  FaDoorOpen,
  FaFileInvoiceDollar,
  FaHardHat,
  FaHistory,
  FaIdCard,
  FaMoneyBillWave,
  FaPlusCircle,
  FaReceipt,
  FaSearch,
  FaShieldAlt,
  FaSignInAlt,
  FaSignOutAlt,
  FaTimes,
  FaTools,
  FaUserCheck,
  FaUserGraduate,
  FaUserShield,
  FaUsers,
  FaUsersCog,
  FaWrench,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

import authService from "../api/authService";
import { showSuccess } from "../components/Alert";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isOpen, setIsOpen] = useState(false);
  const [hasBuilding, setHasBuilding] = useState(true);
  const [hoveredPath, setHoveredPath] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;
  const staffType = user?.staffType;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;

      setIsMobile(mobile);

      if (!mobile) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, location.search, isMobile]);

  useEffect(() => {
    if (role !== "staff" || staffType !== "security") {
      setHasBuilding(true);
      return;
    }

    const checkBuildingAssignment = async () => {
      try {
        const response = await authService.getMe();

        if (response?.success && response?.data) {
          setHasBuilding(Boolean(response.data.buildingId));
        }
      } catch (error) {
        console.error(
          "Lỗi khi kiểm tra tòa nhà được phân công:",
          error,
        );
      }
    };

    checkBuildingAssignment();
  }, [role, staffType]);

  const isActive = (path) => {
    if (!path || path.startsWith("/img/")) {
      return false;
    }

    const [pathname, search = ""] = path.split("?");

    return (
      location.pathname === pathname &&
      location.search === (search ? `?${search}` : "")
    );
  };

  const getMenuStyle = (path) => {
    const active = isActive(path);
    const hovered = hoveredPath === path;

    return {
      width: "100%",
      height: 48,
      padding: "0 16px",
      border: "none",
      borderRadius: 12,
      background: active
        ? "#ffffff"
        : hovered
          ? "rgba(255, 255, 255, 0.15)"
          : "transparent",
      color: active ? "#16a34a" : "rgba(255, 255, 255, 0.9)",
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontSize: 15,
      fontWeight: active ? 600 : 500,
      textAlign: "left",
      cursor: "pointer",
      transition: "all 0.2s ease",
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
        icon: <FaUsersCog />,
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
        path: "/manager/bookings",
        label: "Quản lý đặt phòng",
        icon: <FaDoorOpen />,
      },
      {
        path: "/manager/tickets",
        label: "Quản lý yêu cầu",
        icon: <FaClipboardList />,
      },
      {
        path: "/manager/violations",
        label: "Quản lý kỷ luật",
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
        icon: <FaClipboardCheck />,
      },
      {
        path: "/staff/students",
        label: "Danh sách sinh viên",
        icon: <FaUsers />,
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
        icon: <FaClipboardCheck />,
      },
      {
        path: "/staff/dashboard/cleaner/issues",
        label: "Báo cáo sự cố",
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
      {
        path: "/staff/security/check-in-out",
        label: "Check-in/Check-out",
        icon: <FaSignInAlt />,
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
        icon: <FaReceipt />,
      },
      {
        path: "/student/my-utilities",
        label: "Dịch vụ điện nước",
        icon: <FaMoneyBillWave />,
      },
      {
        path: "/student/tickets",
        label: "Yêu cầu hỗ trợ",
        icon: <FaClipboardList />,
      },
      {
        path: "/student/violations",
        label: "Lịch sử trừ điểm",
        icon: <FaHistory />,
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
        icon: <FaIdCard />,
      },
      {
        path: "/parent/payments",
        label: "Thanh toán",
        icon: <FaMoneyBillWave />,
      },
      {
        path: "/parent/violations",
        label: "Lịch sử trừ điểm",
        icon: <FaHistory />,
      },
    ],
  };

  const getMenuKey = () => {
    if (role === "staff" && staffType) {
      return staffType;
    }

    return role;
  };

  const menus = menusByRole[getMenuKey()] || menusByRole[role] || [];

  const handleMenuClick = (item, isDisabled) => {
    if (isDisabled) {
      return;
    }

    if (item.isExternal) {
      window.open(item.path, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(item.path);

    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
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
          type="button"
          aria-label={isOpen ? "Đóng menu" : "Mở menu"}
          onClick={() => setIsOpen((previousState) => !previousState)}
          style={{
            position: "fixed",
            top: 13,
            left: 13,
            zIndex: 1050,
            width: 46,
            height: 46,
            border: "none",
            borderRadius: "50%",
            background: "#16a34a",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            cursor: "pointer",
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
          role="button"
          tabIndex={0}
          aria-label="Đóng menu"
          onClick={() => setIsOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              setIsOpen(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1010,
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: isMobile ? (isOpen ? 0 : -240) : 0,
          zIndex: 1020,
          width: 240,
          height: "100vh",
          padding: "24px 16px",
          boxSizing: "border-box",
          background:
            "linear-gradient(180deg, #34d399 0%, #22c55e 50%, #16a34a 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
        }}
      >
        <div>
          <div
            style={{
              padding: 18,
              marginBottom: 28,
              borderRadius: 20,
              background: "rgba(255, 255, 255, 0.15)",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: 22,
              }}
            >
              FPT Dormitory
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: "#ffffff",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Dormitory Management System
            </p>
          </div>

          <nav>
            {menus.map((item, index) => {
              const isSecurityWithoutBuilding =
                role === "staff" &&
                staffType === "security" &&
                !hasBuilding;

              const isSecurityDashboard =
                item.path === "/staff/dashboard/security";

              const isDisabled =
                isSecurityWithoutBuilding && !isSecurityDashboard;

              return (
                <button
                  type="button"
                  key={item.path}
                  disabled={isDisabled}
                  title={
                    isDisabled
                      ? "Bạn chưa được phân công tòa nhà"
                      : item.label
                  }
                  onMouseEnter={() => setHoveredPath(item.path)}
                  onMouseLeave={() => setHoveredPath(null)}
                  onClick={() => handleMenuClick(item, isDisabled)}
                  style={{
                    ...getMenuStyle(item.path),
                    marginTop: index === 0 ? 0 : 8,
                    ...(isDisabled && {
                      opacity: 0.5,
                      cursor: "not-allowed",
                    }),
                  }}
                >
                  <span
                    style={{
                      minWidth: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 17,
                    }}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            flexShrink: 0,
            height: 54,
            marginTop: 24,
            border: "none",
            borderRadius: 14,
            background: "#ffffff",
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