import request from "../config/axiosConfig";

export const getAllNotifications = () => {
  return request.get("api/notifications");
};

export const getMyNotifications = () => {
  return request.get("/api/notifications/my");
};

export const getNotificationById = (id) => {
  return request.get(`api/notifications/${id}`);
};

export const createNotification = (data) => {
  return request.post("api/notifications", data);
};

export const deleteNotification = (id) => {
  return request.delete(`api/notifications/${id}`);
};

export const markAsRead = (id) => {
  return request.patch(`/api/notifications/${id}/read`);
};
