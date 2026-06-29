import request from "../config/axiosConfig";

// ===== BUILDINGS =====

// Lấy danh sách tất cả tòa nhà
export const getAllBuildings = async () => {
  const res = await request.get("/api/buildings");
  return res.data;
};

// Tạo tòa nhà mới
export const createBuilding = async (data) => {
  const res = await request.post("/api/buildings", data);
  return res.data;
};

// Xóa tòa nhà
export const deleteBuilding = async (id) => {
  const res = await request.delete(`/api/buildings/${id}`);
  return res.data;
};

// Khởi tạo dữ liệu 4 tòa A, B, C, D
export const seedBuildings = async () => {
  const res = await request.post("/api/buildings/seed");
  return res.data;
};

// ===== ROOMS =====

// Lấy danh sách phòng theo tòa nhà (có thể filter theo tầng)
export const getRoomsByBuilding = async (buildingId, floor) => {
  let url = `/api/buildings/${buildingId}/rooms`;
  if (floor) url += `?floor=${floor}`;
  const res = await request.get(url);
  return res.data;
};

// Xem chi tiết phòng
export const getRoomDetail = async (id) => {
  const res = await request.get(`/api/rooms/${id}`);
  return res.data;
};

// Cập nhật phòng
export const updateRoom = async (id, data) => {
  const res = await request.put(`/api/rooms/${id}`, data);
  return res.data;
};

// ===== STUDENTS IN ROOMS =====

// Thêm sinh viên vào phòng
export const assignStudentToRoom = async (roomId, studentId) => {
  const res = await request.post(`/api/rooms/${roomId}/students`, { studentId });
  return res.data;
};

// Xóa sinh viên khỏi phòng
export const removeStudentFromRoom = async (roomId, studentId) => {
  const res = await request.delete(`/api/rooms/${roomId}/students/${studentId}`);
  return res.data;
};

// Lấy danh sách sinh viên chưa có phòng
export const getAvailableStudents = async (search) => {
  let url = "/api/students/available";
  if (search) url += `?search=${encodeURIComponent(search)}`;
  const res = await request.get(url);
  return res.data;
};



// Kiểm tra kết nối server
export const healthCheck = async () => {
  const res = await request.get("/healthz");
  return res.data;
};

export default {
  healthCheck,
  getAllBuildings,
  createBuilding,
  deleteBuilding,
  seedBuildings,
  getRoomsByBuilding,
  getRoomDetail,
  updateRoom,
  assignStudentToRoom,
  removeStudentFromRoom,
  getAvailableStudents,
};
