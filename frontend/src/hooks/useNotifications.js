import { useEffect, useState, useCallback } from "react";
import { getMyNotifications, markAsRead as markAsReadApi } from "../api/notificationService";
import { socket } from "../socket";

// Custom hook dùng chung: fetch notifications + realtime socket + markAsRead
// Trả về { notifications, loading, markAsRead }
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch danh sách thông báo của user hiện tại
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyNotifications();
      const data = res.data?.data || [];
      setNotifications(data);
    } catch (error) {
      console.error("Load notifications error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe socket realtime (1 listener duy nhất per hook instance)
  useEffect(() => {
    // Kết nối socket nếu chưa
    if (!socket.connected) {
      socket.auth = { token: localStorage.getItem("accessToken") };
      socket.connect();
    }

    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        // Tránh trùng lặp
        const exists = prev.some((item) => item._id === notification._id);
        if (exists) return prev;
        return [{ ...notification, isRead: false }, ...prev];
      });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, []);

  // Đánh dấu đã đọc + update local state ngay
  const markAsRead = useCallback(async (id) => {
    try {
      await markAsReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Mark notification as read error:", error);
    }
  }, []);

  return { notifications, loading, markAsRead };
};

export default useNotifications;
