import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBed,
  FaBell,
  FaCalendarAlt,
  FaCommentAlt,
  FaEnvelope,
  FaHistory,
  FaHome,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSignOutAlt,
  FaStar,
  FaTachometerAlt,
  FaTint,
  FaUserShield,
} from "react-icons/fa";

import { getAllNotifications } from "../../api/notificationService";
import { socket } from "../../socket";
import "./ParentDashboard.css";
import Sidebar from "../../components/Sidebar";


const newsItems = [
  {
    title: "Thông báo về việc đóng tiền nước sinh hoạt tháng 06/2026",
    date: "08/06/2026",
  },
  {
    title: "Lịch bảo trì điều hòa toàn bộ tòa nhà KTX từ 10/06 đến 15/06",
    date: "07/06/2026",
  },
  {
    title: "Giải bóng đá thường niên Dormitory Cup 2026 chính thức khởi tranh",
    date: "05/06/2026",
  },
  {
    title: "Quy định mới về giờ giấc ra vào cổng KTX áp dụng từ tuần sau",
    date: "03/06/2026",
  },
];

function ParentDashboard() {
  const navigate = useNavigate();
  const toastTimerRef = useRef(null);

  const [activeModule, setActiveModule] = useState("home");
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [readIds, setReadIds] = useState([]);
  const [toast, setToast] = useState(null);


  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !readIds.includes(item._id)).length;
  }, [notifications, readIds]);

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

  const filterParentNotifications = (items) => {
    return items.filter((item) => {
      if (item.targetType === "all") return true;

      if (item.targetType === "roles") {
        return item.targetRoles?.includes("parent");
      }

      return false;
    });
  };

  const fetchNotifications = async (showLatestToast = false) => {
    try {
      setLoadingNotifications(true);

      const res = await getAllNotifications();
      const allNotifications = res.data.data || [];
      const parentNotifications = filterParentNotifications(allNotifications);

      setNotifications(parentNotifications);

      if (showLatestToast && parentNotifications.length > 0) {
        showToast(parentNotifications[0]);
      }
    } catch (error) {
      console.error("Load parent notifications error:", error);
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
      console.log("Parent socket connected:", socket.id);
      socket.emit("join_role", "parent");
    };

    const handleNewNotification = (notification) => {
      console.log("Parent received notification:", notification);

      const isForParent =
        notification.targetType === "all" ||
        notification.targetRoles?.includes("parent");

      if (!isForParent) return;

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
      socket.emit("join_role", "parent");
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_notification", handleNewNotification);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div className="parent-shell">

    <Sidebar/>
      <main className="parent-main">
        <header className="parent-topbar">
          {/* <div>
            <span className="parent-kicker">Parent dashboard</span>
            <h2>{activeConfig?.label}</h2>
            <p>
              {activeModule === "home"
                ? "Theo dõi thông tin, phòng và tình trạng của con tại KTX."
                : `Quản lý chức năng ${activeConfig?.label} dành cho phụ huynh.`}
            </p>
          </div> */}

          <div className="parent-topbar__actions">
            <button
              type="button"
              className="parent-icon-button"
              aria-label="Thông báo"
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

            <button type="button" className="parent-primary-button">
              <FaCalendarAlt />
              Summer 2026
            </button>
          </div>
        </header>

        {activeModule === "home" && (
          <HomeScreen setActiveModule={setActiveModule} />
        )}

        {activeModule !== "home" && (
          <div className="parent-placeholder">
            <div className="parent-placeholder__icon">{activeConfig?.icon}</div>
            <h3>{activeConfig?.label}</h3>
            <p>Chức năng đang được kết nối với dữ liệu học viên...</p>
          </div>
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

function NotificationToast({ toast }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        width: 360,
        background: "#fff",
        borderRadius: 18,
        borderLeft: "6px solid #7c3aed",
        padding: 18,
        boxShadow: "0 15px 40px rgba(124,58,237,.18)",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 22 }}>🔔</span>

        <strong
          style={{
            color: "#5b21b6",
            fontSize: 15,
          }}
        >
          {toast.title}
        </strong>
      </div>

      <div
        style={{
          color: "#475569",
          fontSize: 14,
          lineHeight: 1.6,
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
            padding: "20px 24px",
            background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              🔔 Thông báo
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                opacity: 0.9,
              }}
            >
              Thông báo từ Ban quản lý ký túc xá
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "rgba(255,255,255,.18)",
              color: "#fff",
              borderRadius: 10,
              padding: "8px 14px",
              cursor: "pointer",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
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
                          ? "#ede9fe"
                          : isRead
                            ? "#ffffff"
                            : "#faf5ff",
                      borderLeft:
                        selectedNotification?._id === item._id
                          ? "4px solid #7c3aed"
                          : "4px solid transparent",
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
                            background: "#a855f7",
                            boxShadow: "0 0 10px rgba(168,85,247,.5)",
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
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    color: "#a78bfa",
                  }}
                >
                  <div style={{ fontSize: 60 }}>🔔</div>

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    Chưa chọn thông báo
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      color: "#94a3b8",
                    }}
                  >
                    Chọn một thông báo bên trái để xem nội dung
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#5b21b6",
                    fontSize: 26,
                    fontWeight: 700,
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
                    background: "#faf5ff",
                    border: "1px solid #e9d5ff",
                    borderRadius: 18,
                    padding: 20,
                    color: "#334155",
                    lineHeight: 1.8,
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

function HomeScreen({ setActiveModule }) {
  return (
    <div className="parent-stack">
      <div className="parent-room-banner">
        <div className="parent-room-banner__info">
          <div className="parent-room-banner__icon">
            <FaBed />
          </div>
          <div className="parent-room-banner__text">
            <strong>Phòng của con: 302 – Tòa A1</strong>
            <span>Giường số 2 · Summer 2026 · Đang hoạt động</span>
          </div>
        </div>

        <button
          type="button"
          className="parent-primary-button"
          onClick={() => setActiveModule("room")}
        >
          Xem chi tiết
        </button>
      </div>

      <section className="parent-metrics">
        <MetricCard
          icon={<FaBed />}
          label="Phòng của con"
          value="302 – A1"
          note="Đang lưu trú"
          tone="purple"
        />
        <MetricCard
          icon={<FaTachometerAlt />}
          label="Điện tháng 06"
          value="4.210 kWh"
          note="Cập nhật 08/06/2026"
          tone="amber"
        />
        <MetricCard
          icon={<FaTint />}
          label="Nước tháng 06"
          value="782 m³"
          note="Cập nhật 08/06/2026"
          tone="rose"
        />
        <MetricCard
          icon={<FaStar />}
          label="Điểm ý thức"
          value="96"
          note="CFD Score của con"
          tone="green"
        />
      </section>

      <section className="parent-grid parent-grid--wide">
        <div className="parent-panel">
          <div className="parent-panel__header">
            <div>
              <h3>Tin tức mới nhất</h3>
              <p>Thông báo từ Ban Quản Lý KTX</p>
            </div>

            <button
              type="button"
              className="parent-panel__see-more"
              onClick={() => setActiveModule("news")}
            >
              Xem thêm
            </button>
          </div>

          <div className="parent-news-list">
            {newsItems.map((item, idx) => (
              <div key={idx} className="parent-news-item">
                <span className="parent-news-item__dot" />
                <span className="parent-news-item__text">{item.title}</span>
                <span className="parent-news-item__date">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="parent-panel">
          <div className="parent-panel__header">
            <div>
              <h3>Liên hệ hỗ trợ</h3>
              <p>Ban Quản Lý KTX Đại Học FPT</p>
            </div>
          </div>

          <div className="parent-contact-list">
            <div className="parent-contact-item">
              <div className="parent-contact-item__icon">
                <FaPhoneAlt />
              </div>
              <div>
                <div className="parent-contact-item__label">Hotline hỗ trợ</div>
                <div className="parent-contact-item__value">024.7300.5588</div>
              </div>
            </div>

            <div className="parent-contact-item">
              <div className="parent-contact-item__icon">
                <FaEnvelope />
              </div>
              <div>
                <div className="parent-contact-item__label">Email liên hệ</div>
                <div className="parent-contact-item__value">ktx@fpt.edu.vn</div>
              </div>
            </div>

            <div className="parent-contact-item">
              <div className="parent-contact-item__icon">
                <FaMapMarkerAlt />
              </div>
              <div>
                <div className="parent-contact-item__label">Văn phòng</div>
                <div className="parent-contact-item__value">
                  Phòng 102 – Tòa KTX A1
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, note, tone }) {
  return (
    <div className={`parent-metric-card parent-metric-card--${tone}`}>
      <div className="parent-metric-card__icon">{icon}</div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <p className="metric-note">{note}</p>
    </div>
  );
}

export default ParentDashboard;
