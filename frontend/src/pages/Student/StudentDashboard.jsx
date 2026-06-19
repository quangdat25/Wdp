import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBed,
  FaDoorOpen,
  FaCheckCircle,
  FaStar,
  FaBolt,
  FaWater,
  FaCalendarAlt,
} from "react-icons/fa";

import authService from "../../api/authService";
import { getAllNotifications } from "../../api/notificationService";
import { socket } from "../../socket";
import "./StudentDashboard.css";

const studentModules = [
  { id: "home", label: "Trang chủ", title: "Student Board", icon: <FaBed /> },
  { id: "news", label: "Tin tức", title: "Tin tức", icon: <FaBell /> },
  {
    id: "room-history",
    label: "Lịch sử phòng",
    title: "Lịch sử phòng",
    icon: <FaDoorOpen />,
  },
  {
    id: "booking",
    label: "Đặt phòng",
    title: "Đặt phòng",
    icon: <FaBed />,
  },
  {
    id: "payment-history",
    label: "Lịch sử thanh toán",
    title: "Lịch sử thanh toán",
    icon: <FaCalendarAlt />,
  },
  {
    id: "utility",
    label: "Điện nước tiêu thụ",
    title: "Điện nước tiêu thụ",
    icon: <FaBolt />,
  },
  {
    id: "cfd-score",
    label: "Điểm ý thức",
    title: "Điểm ý thức",
    icon: <FaStar />,
  },
  {
    id: "request",
    label: "Gửi yêu cầu",
    title: "Gửi yêu cầu",
    icon: <FaEnvelope />,
  },
];

const newsItems = [
  {
    title: "Thông báo về việc đóng tiền nước sinh hoạt tháng 06/2026",
    date: "10/06/2026",
  },
  {
    title: "Lịch bảo trì điều hòa toàn bộ tòa nhà KTX từ 10/06 đến 15/06",
    date: "09/06/2026",
  },
  {
    title: "Giải bóng đá thường niên Dormitory Cup 2026 chính thức khởi tranh",
    date: "08/06/2026",
  },
  {
    title: "Quy định mới về giờ giấc ra vào cổng KTX áp dụng từ tuần sau",
    date: "07/06/2026",
  },
];

function StudentDashboard() {
  const navigate = useNavigate();
  const toastTimerRef = useRef(null);

  const [activeModule, setActiveModule] = useState("home");
  const [hasBooked] = useState(false);

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [readIds, setReadIds] = useState([]);
  const [toast, setToast] = useState(null);

  const activeConfig =
    studentModules.find((item) => item.id === activeModule) ||
    studentModules[0];

  const showToast = (notification) => {
    setToast({
      title: notification?.title || "Thông báo mới",
      content: notification?.content || "",
    });

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const filterStudentNotifications = (items) => {
    return items.filter((item) => {
      if (item.targetType === "all") return true;

      if (item.targetType === "roles") {
        return item.targetRoles?.includes("student");
      }

      return false;
    });
  };

  const fetchNotifications = async (showLatestToast = false) => {
    try {
      setLoadingNotifications(true);

      const res = await getAllNotifications();
      const allNotifications = res.data.data || [];
      const studentNotifications = filterStudentNotifications(allNotifications);

      setNotifications(studentNotifications);

      if (showLatestToast && studentNotifications.length > 0) {
        showToast(studentNotifications[0]);
      }
    } catch (error) {
      console.error("Load notifications error:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("Student socket connected:", socket.id);
      socket.emit("join_role", "student");
    };

    const handleNewNotification = (notification) => {
      console.log("Student received notification:", notification);

      const isForStudent =
        notification.targetType === "all" ||
        notification.targetRoles?.includes("student");

      if (!isForStudent) return;

      setNotifications((prev) => {
        const exists = prev.some((item) => item._id === notification._id);
        if (exists) return prev;

        return [notification, ...prev];
      });

      showToast(notification);
    };

    socket.on("connect", handleConnect);
    socket.on("new_notification", handleNewNotification);

    if (socket.connected) {
      socket.emit("join_role", "student");
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_notification", handleNewNotification);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !readIds.includes(item._id)).length;
  }, [notifications, readIds]);

  const handleOpenNotification = () => {
    setShowNotificationModal(true);
    fetchNotifications(false);
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
    <div className="student-shell">
      <aside className="student-sidebar">
        <div>
          <div className="student-brand">
            <div className="student-brand__mark">
              <FaBed />
            </div>

            <div>
              <h1>FPT Dormitory</h1>
              <p>Student Portal</p>
            </div>
          </div>

          <nav className="student-nav">
            {studentModules.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveModule(item.id)}
                className={`student-nav__item ${
                  activeModule === item.id ? "is-active" : ""
                }`}
              >
                <span className="student-nav__icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="student-logout-btn"
        >
          Đăng xuất
        </button>
      </aside>

      <main className="student-main">
        <header className="student-topbar">
          <div>
            <span className="student-kicker">Student Portal</span>
            <h2>{activeConfig.title}</h2>
            <p>
              Quản lý thông tin ký túc xá và theo dõi các thông báo mới nhất.
            </p>
          </div>

          <div className="student-topbar__actions">
            <button
              type="button"
              className="student-icon-button"
              onClick={handleOpenNotification}
            >
              <FaBell />

              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    minWidth: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    border: "2px solid #fff",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="student-profile__avatar">A</div>
          </div>
        </header>

        {activeModule === "home" &&
          (hasBooked ? (
            <BookedHomeScreen setActiveModule={setActiveModule} />
          ) : (
            <UnbookedHomeScreen setActiveModule={setActiveModule} />
          ))}

        {activeModule !== "home" && (
          <PlaceholderScreen activeConfig={activeConfig} />
        )}
      </main>

      {toast && <NotificationToast toast={toast} />}

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

function PlaceholderScreen({ activeConfig }) {
  return (
    <div className="student-placeholder">
      <div className="student-placeholder__icon">{activeConfig.icon}</div>
      <h3>Giao diện chức năng: {activeConfig.label}</h3>
      <p>
        Hệ thống đang tải dữ liệu cho chức năng{" "}
        <strong>{activeConfig.label}</strong> dành cho sinh viên...
      </p>
    </div>
  );
}

function NotificationToast({ toast }) {
  return (
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

function UnbookedHomeScreen({ setActiveModule }) {
  return (
    <div className="student-stack">
      <div className="student-cta-banner">
        <div className="student-cta-banner__left">
          <div className="student-cta-banner__icon">
            <FaDoorOpen />
          </div>

          <div>
            <strong>Bạn chưa có phòng ở kỳ Summer 2026</strong>
            <span>
              Hiện còn <b>300 phòng</b> đang trống – đặt sớm để có lựa chọn tốt
              nhất!
            </span>
          </div>
        </div>

        <button
          type="button"
          className="student-primary-button"
          onClick={() => setActiveModule("booking")}
        >
          <FaBed /> Đặt phòng ngay
        </button>
      </div>

      <section className="student-metrics">
        <MetricCard
          icon={<FaBed />}
          label="Phòng còn trống"
          value="300"
          note="Kỳ Summer 2026"
          tone="blue"
        />
        <MetricCard
          icon={<FaCheckCircle />}
          label="Phòng 4 giường"
          value="120"
          note="Giá từ 950.000đ/tháng"
          tone="green"
        />
        <MetricCard
          icon={<FaCheckCircle />}
          label="Phòng 6 giường"
          value="132"
          note="Giá từ 750.000đ/tháng"
          tone="amber"
        />
        <MetricCard
          icon={<FaStar />}
          label="Điểm ý thức"
          value="96"
          note="CFD Score hiện tại"
          tone="purple"
        />
      </section>

      <HomeInfoGrid setActiveModule={setActiveModule} />
    </div>
  );
}

function BookedHomeScreen({ setActiveModule }) {
  return (
    <div className="student-stack">
      <div className="student-room-banner">
        <div className="student-room-banner__info">
          <div className="student-room-banner__icon">
            <FaBed />
          </div>

          <div className="student-room-banner__text">
            <strong>Phòng đang ở: A-203 – Tòa Dorm A</strong>
            <span>Giường số 3 · Summer 2026 · Đang hoạt động</span>
          </div>
        </div>

        <button
          type="button"
          className="student-primary-button"
          onClick={() => setActiveModule("room-history")}
        >
          Xem chi tiết
        </button>
      </div>

      <section className="student-metrics">
        <MetricCard
          icon={<FaBolt />}
          label="Điện tháng 06"
          value="4.210 kWh"
          note="Cập nhật 08/06/2026"
          tone="amber"
        />
        <MetricCard
          icon={<FaWater />}
          label="Nước tháng 06"
          value="782 m³"
          note="Cập nhật 08/06/2026"
          tone="blue"
        />
        <MetricCard
          icon={<FaStar />}
          label="Điểm ý thức"
          value="96"
          note="CFD Score hiện tại"
          tone="green"
        />
        <MetricCard
          icon={<FaCalendarAlt />}
          label="Hóa đơn tháng 06"
          value="1.200.000đ"
          note="Hạn: 15/06/2026"
          tone="purple"
        />
      </section>

      <HomeInfoGrid setActiveModule={setActiveModule} />
    </div>
  );
}

function HomeInfoGrid({ setActiveModule }) {
  return (
    <section className="student-grid student-grid--wide">
      <div className="student-panel">
        <div className="student-panel__header">
          <div>
            <h3>Tin tức mới nhất</h3>
            <p>Thông báo từ Ban Quản Lý KTX</p>
          </div>

          <button
            type="button"
            className="student-panel__see-more"
            onClick={() => setActiveModule("news")}
          >
            Xem thêm
          </button>
        </div>

        <div className="student-news-list">
          {newsItems.map((item, idx) => (
            <div key={idx} className="student-news-item">
              <span className="student-news-item__dot" />
              <span className="student-news-item__text">{item.title}</span>
              <span className="student-news-item__date">{item.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="student-panel">
        <div className="student-panel__header">
          <div>
            <h3>Liên hệ hỗ trợ</h3>
            <p>Ban Quản Lý KTX Đại Học FPT</p>
          </div>
        </div>

        <ContactList />
      </div>
    </section>
  );
}

function ContactList() {
  return (
    <div className="student-contact-list">
      <div className="student-contact-item">
        <div className="student-contact-item__icon">
          <FaPhoneAlt />
        </div>

        <div>
          <div className="student-contact-item__label">Hotline hỗ trợ</div>
          <div className="student-contact-item__value">024.7300.5588</div>
        </div>
      </div>

      <div className="student-contact-item">
        <div className="student-contact-item__icon">
          <FaEnvelope />
        </div>

        <div>
          <div className="student-contact-item__label">Email liên hệ</div>
          <div className="student-contact-item__value">ktx@fpt.edu.vn</div>
        </div>
      </div>

      <div className="student-contact-item">
        <div className="student-contact-item__icon">
          <FaMapMarkerAlt />
        </div>

        <div>
          <div className="student-contact-item__label">Văn phòng</div>
          <div className="student-contact-item__value">
            Phòng 102 – Tòa KTX A1
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, note, tone }) {
  return (
    <div className={`student-metric-card student-metric-card--${tone}`}>
      <div className="student-metric-card__icon">{icon}</div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <p className="metric-note">{note}</p>
    </div>
  );
}

export default StudentDashboard;