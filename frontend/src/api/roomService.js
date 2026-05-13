import request from "../config/request";

// Kiểm tra kết nối server
export const healthCheck = async () => {
  const res = await request.get("/healthz");
  return res.data;
};

// Lấy danh sách tất cả phòng
export const getAllRooms = async () => {
  const res = await request.get("/api/room");
  return res.data;
};

// Lấy chi tiết một phòng
export const getRoomById = async (id) => {
  const res = await request.get(`/api/room/${id}`);
  return res.data;
};

// Tạo phòng mới
export const createRoom = async (roomData) => {
  const res = await request.post("/api/room", roomData);
  return res.data;
};

// Cập nhật phòng
export const updateRoom = async (id, roomData) => {
  const res = await request.put(`/api/room/${id}`, roomData);
  return res.data;
};

// Xóa phòng
export const deleteRoom = async (id) => {
  const res = await request.delete(`/api/room/${id}`);
  return res.data;
};

export default {
  healthCheck,
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
