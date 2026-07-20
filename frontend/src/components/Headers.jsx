import { useEffect, useMemo, useRef, useState } from "react";
import { FaBell, FaTimes, FaUser } from "react-icons/fa";

import authService from "../api/authService";
import { getMyNotifications, markAsRead } from "../api/notificationService";
import { socket } from "../socket";

function Header({
  avatarText = "A",
  title = null,
  bgGradient = null,
  borderColor = null,
  shadowColor = null,
  titleColor = "#0F172A",
}) {
  const toastTimerRef = useRef(null);
  const avatarMenuRef = useRef(null);

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [toast, setToast] = useState(null);

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.isRead).length;
  }, [notifications]);

  const fetchUserProfile = async () => {
    try {
      setLoadingUser(true);
      const res = await authService.getMyProfile();

      if (res.success) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (error) {
      console.error("Load user profile error:", error);
    } finally {
      setLoadingUser(false);
    }
  };

  const showToast = (notification) => {
    setToast({
      title: notification?.title || "Thông báo mới",
      content: notification?.content || "",
    });

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const closeToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await getMyNotifications();
      const data = res.data.data || [];
      setNotifications(data);
    } catch (error) {
      console.error("Load notifications error:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUserProfile();
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
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target)
      ) {
        setShowAvatarMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenNotification = () => {
    setShowNotificationModal(true);
    fetchNotifications();
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
          position: "relative",
          zIndex: 1000,
          background:
            bgGradient ||
            "linear-gradient(135deg, rgba(52,211,153,0.16), rgba(34,197,94,0.12), rgba(22,163,74,0.10))",
          border: `1px solid ${borderColor || "rgba(22,163,74,0.18)"}`,
          boxShadow: `0 14px 35px ${shadowColor || "rgba(22, 163, 74, 0.08)"}`,
          boxSizing: "border-box",
        }}
      >
        {title && (
          <h1
            style={{
              fontSize: 28,
              color: titleColor,
              fontWeight: 800,
              margin: 0,
            }}
          >
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

          <div ref={avatarMenuRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowAvatarMenu((prev) => !prev)}
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
                cursor: "pointer",
              }}
            >
              {avatarText}
            </button>

            {showAvatarMenu && (
              <div
                style={{
                  position: "absolute",
                  top: 56,
                  right: 0,
                  width: 210,
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
                  overflow: "hidden",
                  zIndex: 3000,
                }}
              >
                <button
                  type="button"
                  onClick={async () => {
                    await fetchUserProfile();
                    setShowUserModal(true);
                    setShowAvatarMenu(false);
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "#fff",
                    padding: "14px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "#0f172a",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <FaUser />
                  Xem thông tin
                </button>
              </div>
            )}
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

      {showUserModal && (
        <UserInfoModal
          user={user}
          loading={loadingUser}
          avatarText={avatarText}
          onClose={() => setShowUserModal(false)}
        />
      )}
    </>
  );
}

function UserInfoModal({ user, loading, avatarText, onClose }) {
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
          width: "min(540px, 94vw)",
          maxHeight: "86vh",
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
            padding: "20px 24px",
            background:
              "linear-gradient(180deg, #34d399 0%, #22c55e 50%, #16a34a 100%)",
            color: "#FFFFFF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
              Thông tin tài khoản
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.9 }}>
              Chi tiết người dùng đang đăng nhập
            </p>
          </div>

          <button
            type="button"
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
            }}
          >
            <FaTimes />
          </button>
        </div>

        <div style={{ padding: 24, overflowY: "auto" }}>
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: "50%",
              margin: "0 auto 18px",
              background:
                "linear-gradient(180deg, #34d399 0%, #22c55e 50%, #16a34a 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 900,
              boxShadow: "0 12px 28px rgba(22,163,74,0.22)",
            }}
          >
            {avatarText}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 20, color: "#64748b" }}>
              Đang tải thông tin...
            </div>
          ) : (
            <>
              <InfoRow label="Họ tên" value={user?.fullName || user?.name} />
              <InfoRow label="Email" value={user?.email} />
              <InfoRow label="Số điện thoại" value={user?.phone} />
              <InfoRow label="Vai trò" value={formatRole(user?.role)} />
              <InfoRow label="Trạng thái" value={formatStatus(user?.status)} />
              <InfoRow label="Tên đăng nhập" value={user?.username} />

              {user?.role === "student" && (
                <>
                  <InfoRow label="Mã sinh viên" value={user?.studentCode} />
                  <InfoRow
                    label="Giới tính"
                    value={formatGender(user?.gender)}
                  />
                  <InfoRow label="Điểm CFD" value={user?.CFDScore} />
                  <InfoRow
                    label="Ngày sinh"
                    value={formatDate(user?.dateOfBirth)}
                  />
                  <InfoRow label="Ngành học" value={user?.major} />
                  <InfoRow label="Địa chỉ" value={user?.address} />
                  <InfoRow
                    label="Tòa nhà"
                    value={
                      user?.buildingId?.buildingName || user?.buildingId?.name
                    }
                  />
                  <InfoRow
                    label="Phòng"
                    value={user?.roomId?.roomNumber || user?.roomId?.roomName}
                  />
                </>
              )}

              {user?.role === "staff" && (
                <>
                  <InfoRow label="Mã nhân viên" value={user?.staffCode} />
                  <InfoRow
                    label="Loại nhân viên"
                    value={formatStaffType(user?.staffType)}
                  />
                  <InfoRow label="Ca làm" value={formatShift(user?.shift)} />
                  <InfoRow
                    label="Ngày bắt đầu"
                    value={formatDate(user?.startDate)}
                  />
                  <InfoRow
                    label="Tòa phụ trách"
                    value={
                      user?.buildingId?.buildingName || user?.buildingId?.name
                    }
                  />
                </>
              )}

              {user?.role === "manager" && (
                <>
                  <InfoRow label="Mã quản lý" value={user?.managerCode} />
                  <InfoRow label="Phòng ban" value={user?.department} />
                  <InfoRow
                    label="Ngày bắt đầu"
                    value={formatDate(user?.startDate)}
                  />
                  <InfoRow
                    label="Tòa quản lý"
                    value={
                      user?.buildingId?.buildingName || user?.buildingId?.name
                    }
                  />
                </>
              )}

              {user?.role === "admin" && (
                <>
                  <InfoRow label="Mã admin" value={user?.adminCode} />
                  <InfoRow label="Phòng ban" value={user?.department} />
                  <InfoRow
                    label="Quyền hạn"
                    value={formatPermission(user?.permissionLevel)}
                  />
                </>
              )}

              {user?.role === "parent" && (
                <>
                  <InfoRow label="Quan hệ" value={user?.relationship} />
                  <InfoRow
                    label="Tên sinh viên"
                    value={user?.student?.fullName}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        padding: "12px 0",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <span style={{ color: "#64748B", fontWeight: 700 }}>{label}</span>
      <span
        style={{
          color: "#0F172A",
          fontWeight: 800,
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value === 0 ? 0 : value || "Chưa có"}
      </span>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
}

function formatRole(role) {
  const map = {
    student: "Sinh viên",
    parent: "Phụ huynh",
    staff: "Nhân viên",
    manager: "Quản lý",
    admin: "Admin",
  };
  return map[role] || role;
}

function formatStatus(status) {
  const map = {
    active: "Đang hoạt động",
    inactive: "Ngừng hoạt động",
    leave: "Nghỉ phép",
    probation: "Thử việc",
  };
  return map[status] || status;
}

function formatGender(gender) {
  const map = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  };
  return map[gender] || gender;
}

function formatStaffType(type) {
  const map = {
    security: "Bảo vệ",
    maintenance: "Bảo trì",
    cleaner: "Vệ sinh",
  };
  return map[type] || type;
}

function formatShift(shift) {
  const map = {
    morning: "Ca sáng",
    afternoon: "Ca chiều",
    night: "Ca đêm",
    office: "Giờ hành chính",
  };
  return map[shift] || shift;
}

function formatPermission(permission) {
  const map = {
    super_admin: "Quản trị tối cao",
    admin: "Quản trị viên",
  };
  return map[permission] || permission;
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
            type="button"
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
              background: "#F8FAFC",
            }}
          >
            {loading ? (
              <div style={{ padding: 20, textAlign: "center" }}>
                Đang tải thông báo...
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{ padding: 20, textAlign: "center", color: "#64748B" }}
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
                    type="button"
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
                    <strong style={{ color: "#0F172A", fontSize: 14 }}>
                      {item.title}
                    </strong>

                    <div
                      style={{ marginTop: 6, color: "#64748B", fontSize: 12 }}
                    >
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </div>

                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#475569",
                        fontSize: 13,
                        lineHeight: 1.4,
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
                <h2 style={{ margin: "0 0 10px", color: "#16a34a" }}>
                  {selectedNotification.title}
                </h2>

                <div
                  style={{ color: "#64748B", fontSize: 13, marginBottom: 18 }}
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
