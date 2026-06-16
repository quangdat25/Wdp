import request from "../config/request";

export const getAllNotifications = () => {
  return request.get("api/notifications");
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