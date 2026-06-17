import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../api/authService";
import { FaBell, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

function StudentDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Trang chủ");

  const menuItems = [
    "Trang chủ",
    "Tin tức",
    "Lịch sử phòng",
    "Đặt phòng",
    "Lịch sử thanh toán",
    "Điện nước tiêu thụ",
    "Điểm ý thức",
    "Gửi yêu cầu"
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

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F5F6F8",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <aside
        style={{
          width: 250,
          background: "#00E676",
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
              FPT Dormitory
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
              Hệ thống quản lý KTX
            </p>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {menuItems.map((item) => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
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
            {activeTab === "Trang chủ" ? "Student Board" : activeTab}
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
              A
            </div>
          </div>
        </header>

        {activeTab === "Trang chủ" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                background: "#DDF3FD",
                borderRadius: 12,
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  color: "#0A4E9B",
                  fontWeight: 700,
                }}
              >
                Phòng còn trống: 300
              </span>
              <button
                onClick={() => setActiveTab("Đặt phòng")}
                style={{
                  background: "#2E7D32",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 24px",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1B5E20";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#2E7D32";
                }}
              >
                Đặt phòng
              </button>
            </div>

            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 12,
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "#0D47A1",
                  padding: "14px 20px",
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                News
              </div>
              <div style={{ padding: 0 }}>
                {[
                  "Thông báo về việc đóng tiền nước sinh hoạt tháng 06/2026",
                  "Lịch bảo trì điều hòa toàn bộ tòa nhà KTX từ 10/06 đến 15/06",
                  "Giải bóng đá thường niên Dormitory Cup 2026 chính thức khởi tranh",
                  "Quy định mới về giờ giấc ra vào cổng KTX áp dụng từ tuần sau",
                ].map((newsItem, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "16px 20px",
                      background: idx % 2 === 0 ? "#EAEAEA" : "#FFFFFF",
                      color: "#000000",
                      fontSize: 14,
                      fontWeight: 600,
                      borderBottom: "1px solid #E0E0E0",
                    }}
                  >
                    {newsItem}
                  </div>
                ))}
                <div style={{ padding: "12px 20px" }}>
                  <a
                    href="#news"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("Tin tức");
                    }}
                    style={{
                      fontSize: 12,
                      color: "#0D47A1",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    Xem thêm
                  </a>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 12,
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "#0D47A1",
                  padding: "14px 20px",
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                Contact
              </div>
              <div
                style={{
                  background: "#EAEAEA",
                  padding: "24px 20px",
                  minHeight: 120,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Ban Quản Lý KTX Đại Học FPT</div>
                <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaPhoneAlt style={{ color: "#0D47A1" }} /> Hotline hỗ trợ: 024.7300.5588
                </div>
                <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaEnvelope style={{ color: "#0D47A1" }} /> Email liên hệ: ktx@fpt.edu.vn
                </div>
                <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaMapMarkerAlt style={{ color: "#0D47A1" }} /> Văn phòng: Phòng 102 - Tòa nhà KTX A1
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "Trang chủ" && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: 28,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              minHeight: 300,
            }}
          >
            <h2>Giao diện chức năng: {activeTab}</h2>
            <p style={{ color: "#666", marginTop: 8 }}>
              Hệ thống đang tải dữ liệu cho chức năng <strong>{activeTab}</strong> dành cho sinh viên...
            </p>
            <div
              style={{
                marginTop: 32,
                padding: 24,
                border: "2px dashed #CBD5E1",
                borderRadius: 12,
                textAlign: "center",
                color: "#94A3B8",
                fontWeight: 600,
              }}
            >
              [Chức năng {activeTab} của Sinh Viên đang được kết nối với API]
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;
