import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../api/authService";
import { FaBell, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { getAllNotifications } from "../../api/notificationService";
import { showSuccess } from "../../components/alert";

import { socket } from "../../socket";
function StudentDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Trang chủ");

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [readIds, setReadIds] = useState([]);
  const [toast, setToast] = useState(null);
  const menuItems = [
    "Trang chủ",
    "Tin tức",
    "Lịch sử phòng",
    "Đặt phòng",
    "Lịch sử thanh toán",
    "Điện nước tiêu thụ",
    "Điểm ý thức",
    "Gửi yêu cầu",
  ];

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const res = await getAllNotifications();
      const allNotifications = res.data.data || [];

      const studentNotifications = allNotifications.filter((item) => {
        if (item.targetType === "all") return true;

        if (item.targetType === "roles") {
          return item.targetRoles?.includes("student");
        }

        return false;
      });

      setNotifications(studentNotifications);
    } catch (error) {
      console.error("Load notifications error:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Student connected:", socket.id);
      socket.emit("join_role", "student");
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Socket connect error:", err.message);
    });

    socket.onAny((event, ...args) => {
      console.log("📩 Socket event:", event, args);
    });

    const handleNewNotification = (notification) => {
      console.log("🔥 Student received notification:", notification);

      const isForStudent =
        notification.targetType === "all" ||
        notification.targetRoles?.includes("student");

      if (!isForStudent) return;

      setNotifications((prev) => {
        const exists = prev.some((item) => item._id === notification._id);
        if (exists) return prev;
        return [notification, ...prev];
      });

      setToast({
        title: notification.title || "Thông báo mới",
        content: notification.content || "",
      });

      setTimeout(() => {
        setToast(null);
      }, 3500);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("new_notification", handleNewNotification);
      socket.offAny();
    };
  }, []);
  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !readIds.includes(item._id)).length;
  }, [notifications, readIds]);

  const handleOpenNotification = () => {
    setShowNotificationModal(true);
    fetchNotifications();
  };

  const handleSelectNotification = (item) => {
    setSelectedNotification(item);

    setReadIds((prev) =>
      prev.includes(item._id) ? prev : [...prev, item._id],
    );
  };

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
                    background: isActive
                      ? "rgba(255, 255, 255, 0.45)"
                      : "#FFFFFF",
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
            <button
              type="button"
              onClick={handleOpenNotification}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#000000",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <FaBell size={18} />

              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    minWidth: 20,
                    height: 20,
                    borderRadius: 999,
                    background: "#EF4444",
                    color: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #FFFFFF",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

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
                }}
              >
                Đặt phòng
              </button>
            </div>

            <Card title="News">
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
            </Card>

            <Card title="Contact">
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
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  Ban Quản Lý KTX Đại Học FPT
                </div>

                <div style={contactStyle}>
                  <FaPhoneAlt style={{ color: "#0D47A1" }} />
                  Hotline hỗ trợ: 024.7300.5588
                </div>

                <div style={contactStyle}>
                  <FaEnvelope style={{ color: "#0D47A1" }} />
                  Email liên hệ: ktx@fpt.edu.vn
                </div>

                <div style={contactStyle}>
                  <FaMapMarkerAlt style={{ color: "#0D47A1" }} />
                  Văn phòng: Phòng 102 - Tòa nhà KTX A1
                </div>
              </div>
            </Card>
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
              Hệ thống đang tải dữ liệu cho chức năng{" "}
              <strong>{activeTab}</strong> dành cho sinh viên...
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
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            width: 340,
            background: "#ffffff",
            borderLeft: "6px solid #2563eb",
            borderRadius: 14,
            padding: "14px 16px",
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.22)",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 6,
            }}
          >
            📢 {toast.title}
          </div>

          <div
            style={{
              color: "#475569",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {toast.content}
          </div>
        </div>
      )}
      {showNotificationModal && (
        <NotificationModal
          notifications={notifications}
          loading={loadingNotifications}
          readIds={readIds}
          selectedNotification={selectedNotification}
          onSelect={handleSelectNotification}
          onClose={() => {
            setShowNotificationModal(false);
            setSelectedNotification(null);
          }}
        />
      )}
    </div>
  );
}

const contactStyle = {
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

function Card({ title, children }) {
  return (
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
        {title}
      </div>

      <div>{children}</div>
    </div>
  );
}

function NotificationModal({
  notifications,
  loading,
  readIds,
  selectedNotification,
  onSelect,
  onClose,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: 760,
          maxWidth: "94vw",
          maxHeight: "86vh",
          background: "#FFFFFF",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            background: "#0D47A1",
            color: "#FFFFFF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>Thông báo</h2>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#FFFFFF",
              color: "#0D47A1",
              borderRadius: 10,
              padding: "8px 14px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Đóng
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            minHeight: 420,
            maxHeight: "70vh",
          }}
        >
          <div
            style={{
              borderRight: "1px solid #E5E7EB",
              overflowY: "auto",
              background: "#F8FAFC",
            }}
          >
            {loading ? (
              <div style={{ padding: 20, textAlign: "center" }}>
                Đang tải thông báo...
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  padding: 20,
                  textAlign: "center",
                  color: "#64748B",
                }}
              >
                Chưa có thông báo nào
              </div>
            ) : (
              notifications.map((item) => {
                const isRead = readIds.includes(item._id);

                return (
                  <button
                    key={item._id}
                    onClick={() => onSelect(item)}
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom: "1px solid #E5E7EB",
                      background:
                        selectedNotification?._id === item._id
                          ? "#DBEAFE"
                          : isRead
                            ? "#FFFFFF"
                            : "#EFF6FF",
                      padding: 16,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <strong
                        style={{
                          color: "#0F172A",
                          fontSize: 14,
                          lineHeight: 1.4,
                        }}
                      >
                        {item.title}
                      </strong>

                      {!isRead && (
                        <span
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: "#2563EB",
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        color: "#64748B",
                        fontSize: 12,
                      }}
                    >
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </div>

                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#475569",
                        fontSize: 13,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.content}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          <div style={{ padding: 22, overflowY: "auto" }}>
            {!selectedNotification ? (
              <div
                style={{
                  height: "100%",
                  display: "grid",
                  placeItems: "center",
                  color: "#94A3B8",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                Chọn một thông báo để xem chi tiết
              </div>
            ) : (
              <div>
                <h2
                  style={{
                    margin: "0 0 10px",
                    color: "#0A4E9B",
                    fontSize: 24,
                  }}
                >
                  {selectedNotification.title}
                </h2>

                <div
                  style={{
                    color: "#64748B",
                    fontSize: 13,
                    marginBottom: 18,
                  }}
                >
                  {new Date(selectedNotification.createdAt).toLocaleString(
                    "vi-VN",
                  )}
                </div>

                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 14,
                    padding: 16,
                    color: "#334155",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedNotification.content}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
