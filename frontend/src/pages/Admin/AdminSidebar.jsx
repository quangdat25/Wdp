import {
  FaChartPie,
  FaUserGraduate,
  FaBed,
  FaMoneyBillWave,
  FaTools,
  FaUsersCog,
  FaSignOutAlt,
} from "react-icons/fa";

const menuItems = [
  {
    label: "Bảng điều khiển",
    icon: <FaChartPie />,
  },
  {
    label: "Quản lý sinh viên",
    icon: <FaUserGraduate />,
    active: true,
  },
  {
    label: "Quản lý phòng",
    icon: <FaBed />,
  },
  {
    label: "Thanh toán",
    icon: <FaMoneyBillWave />,
  },
  {
    label: "Yêu cầu",
    icon: <FaTools />,
  },
  {
    label: "Tài khoản",
    icon: <FaUsersCog />,
  },
];

function AdminSidebar() {
  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,

        width: 270,
        height: "100dvh",

        background:
          "linear-gradient(180deg, #34d399 0%, #22c55e 50%, #16a34a 100%)",

        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",

        boxSizing: "border-box",
        overflowY: "auto",

        boxShadow: "10px 0 30px rgba(34, 197, 94, 0.25)",
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 20,
            padding: 18,
            marginBottom: 28,
            backdropFilter: "blur(10px)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#fff",
              fontWeight: 800,
              fontSize: 24,
            }}
          >
            FPT Dormitory
          </h2>

          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              color: "rgba(255,255,255,0.9)",
              fontSize: 13,
            }}
          >
            Dormitory Management System
          </p>
        </div>

        {/* Menu */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              style={{
                border: "none",
                height: 54,
                borderRadius: 14,
                background: item.active
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(255,255,255,0.08)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "0 18px",
                fontSize: 15,
                fontWeight: item.active ? 700 : 500,
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                boxShadow: item.active ? "0 8px 20px rgba(0,0,0,0.12)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.18)";
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 20,
                }}
              >
                {item.icon}
              </span>

              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <button
        style={{
          border: "none",
          height: 54,
          borderRadius: 14,
          background: "#ffffff",
          color: "#16a34a",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
        }}
      >
        <FaSignOutAlt />
        Đăng xuất
      </button>
    </aside>
  );
}

export default AdminSidebar;
