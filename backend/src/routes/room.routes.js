const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");

// ===== BUILDINGS =====

// Lấy tất cả tòa nhà
router.get("/buildings", roomController.getAllBuildings);

// Tạo tòa nhà mới (tự động tạo 5 tầng × 14 phòng)
router.post("/buildings", roomController.createBuilding);

// Xóa tòa nhà
router.delete("/buildings/:id", roomController.deleteBuilding);

// Khởi tạo dữ liệu 4 tòa A, B, C, D
router.post("/buildings/seed", roomController.seedBuildings);

// Lấy danh sách phòng theo tòa nhà (query: ?floor=1)
router.get("/buildings/:buildingId/rooms", roomController.getRoomsByBuilding);

// ===== ROOMS =====

// Xem chi tiết phòng
router.get("/rooms/:id", roomController.getRoomDetail);

// Cập nhật phòng (status, capacity)
router.put("/rooms/:id", roomController.updateRoom);

// Thêm sinh viên vào phòng
router.post("/rooms/:id/students", roomController.assignStudent);

// Xóa sinh viên khỏi phòng
router.delete("/rooms/:id/students/:studentId", roomController.removeStudent);

// Lấy danh sách sinh viên chưa có phòng
router.get("/students/available", roomController.getAvailableStudents);

module.exports = router;