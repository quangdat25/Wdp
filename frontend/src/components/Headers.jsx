import { useEffect, useMemo, useRef, useState } from "react";
import { FaBell, FaTimes } from "react-icons/fa";

import { getMyNotifications, markAsRead } from "../api/notificationService";
import { socket } from "../socket";

function Header({ 
  avatarText = "A", 
  title = null, 
  bgGradient = null, 
  borderColor = null, 
  shadowColor = null,
  titleColor = "#0F172A"
}) {
  const toastTimerRef = useRef(null);

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [toast, setToast] = useState(null);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.isRead).length;
  }, [notifications]);

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

  const closeToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast(null);
  };

  const fetchNotifications = async (showLatestToast = false) => {
    try {
      setLoadingNotifications(true);

      const res = await getMyNotifications();
      const data = res.data.data || [];

      setNotifications(data);

      const latestUnread = data.find((item) => !item.isRead);

      if (showLatestToast && latestUnread) {
        showToast(latestUnread);
      }
    } catch (error) {
      console.error("Load notifications error:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications(false);
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.auth = { token: localStorage.getItem("accessToken") };
      socket.connect();
    }

    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        const exists = prev.some((item) => item._id === notification._id);
        if (exists) return prev;

        return [{ ...notification, isRead: false }, ...prev];
      });

      showToast(notification);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
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

  const handleCloseNotification = () => {
    setShowNotificationModal(false);
    setSelectedNotification(null);
  };

  const handleSelectNotification = async (item) => {
    try {
      setSelectedNotification({ ...item, isRead: true });

      if (!item.isRead) {
        await markAsRead(item._id);

        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (error) {
      console.error("Mark notification as read error:", error);
    }
  };

  return (
    <>
      <header
        style={{
          width: "100%",
          minHeight: 72,
          display: "flex",
          justifyContent: title ? "space-between" : "flex-end",
          alignItems: "center",
          padding: "14px 24px",
          marginBottom: 24,
          borderRadius: 20,
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: bgGradient || "linear-gradient(135deg, rgba(52,211,153,0.16), rgba(34,197,94,0.12), rgba(22,163,74,0.10))",
          border: `1px solid ${borderColor || "rgba(22,163,74,0.18)"}`,
          boxShadow: `0 14px 35px ${shadowColor || "rgba(22, 163, 74, 0.08)"}`,
          boxSizing: "border-box",
        }}
      >
        {title && (
          <h1 style={{ fontSize: 28, color: titleColor, fontWeight: 800, margin: 0 }}>
            {title}
          </h1>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            type="button"
            onClick={handleOpenNotification}
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              border: "1px solid rgba(22,163,74,0.18)",
              background: "#ffffff",
              color: "#16a34a",
              cursor: "pointer",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              boxShadow: "0 10px 24px rgba(22,163,74,0.16)",
            }}
          >
            <FaBell />

            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  minWidth: 18,
                  height: 18,
                  padding: "0 4px",
                  borderRadius: 999,
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  border: "2px solid #fff",
                  boxSizing: "border-box",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background:
                "linear-gradient(180deg, #34d399 0%, #22c55e 50%, #16a34a 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 18,
              boxShadow: "0 10px 24px rgba(22,163,74,0.24)",
              border: "2px solid rgba(255,255,255,0.85)",
            }}
          >
            {avatarText}
          </div>
        </div>
      </header>

      {toast && <NotificationToast toast={toast} onClose={closeToast} />}

      {showNotificationModal && (
        <NotificationModal
          notifications={notifications}
          loading={loadingNotifications}
          selectedNotification={selectedNotification}
          onSelect={handleSelectNotification}
          onClose={handleCloseNotification}
        />
      )}
    </>
  );
}

function NotificationToast({ toast, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        width: 360,
        background: "#ffffff",
        borderLeft: "6px solid #16a34a",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 18px 45px rgba(22,163,74,0.22)",
        zIndex: 2000,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "none",
          background: "#f1f5f9",
          color: "#64748b",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <FaTimes />
      </button>

      <div
        style={{
          fontWeight: 800,
          color: "#14532d",
          marginBottom: 6,
          paddingRight: 30,
        }}
      >
        📢 {toast.title}
      </div>

      <div
        style={{
          color: "#475569",
          fontSize: 14,
          lineHeight: 1.5,
          paddingRight: 30,
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "min(780px, 94vw)",
          height: "min(640px, 86vh)",
          background: "#FFFFFF",
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flexShrink: 0,
            padding: "20px 24px",
            background:
              "linear-gradient(180deg, #34d399 0%, #22c55e 50%, #16a34a 100%)",
            color: "#FFFFFF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
              Thông báo
            </h2>

            <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.9 }}>
              Thông báo từ Ban quản lý ký túc xá
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              border: "none",
              background: "rgba(255,255,255,0.18)",
              color: "#FFFFFF",
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <FaTimes />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "minmax(260px, 320px) minmax(0, 1fr)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              minHeight: 0,
              height: "100%",
              borderRight: "1px solid #E5E7EB",
              overflowY: "auto",
              overflowX: "hidden",
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
                const isRead = item.isRead;
                const isSelected = selectedNotification?._id === item._id;

                return (
                  <button
                    key={item._id}
                    onClick={() => onSelect(item)}
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom: "1px solid #E5E7EB",
                      background: isSelected
                        ? "#dcfce7"
                        : isRead
                          ? "#ffffff"
                          : "#f0fdf4",
                      borderLeft: isSelected
                        ? "4px solid #16a34a"
                        : "4px solid transparent",
                      padding: 16,
                      textAlign: "left",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
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
                            background: "#ef4444",
                            flexShrink: 0,
                            marginTop: 5,
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

          <div
            style={{
              minHeight: 0,
              height: "100%",
              padding: 22,
              overflowY: "auto",
              overflowX: "hidden",
              boxSizing: "border-box",
            }}
          >
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
                    color: "#16a34a",
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
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 16,
                    padding: 18,
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

export default Header;
