const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");

const { authenticate, authorize } = require("../middleware/authUser");

// ===== BUILDINGS =====

// Lấy tất cả tòa nhà
router.get("/buildings", authenticate, authorize("admin", "manager"), roomController.getAllBuildings);

// Tạo tòa nhà mới (tự động tạo 5 tầng × 14 phòng)
router.post("/buildings", authenticate, authorize("admin"), roomController.createBuilding);

// Xóa tòa nhà
router.delete("/buildings/:id", authenticate, authorize("admin"), roomController.deleteBuilding);

// Khởi tạo dữ liệu 4 tòa A, B, C, D
router.post("/buildings/seed", authenticate, authorize("admin"), roomController.seedBuildings);

// Lấy danh sách phòng theo tòa nhà (query: ?floor=1)
router.get("/buildings/:buildingId/rooms", authenticate, authorize("admin", "manager"), roomController.getRoomsByBuilding);

// ===== ROOMS =====

// Xem chi tiết phòng
router.get("/rooms/:id", authenticate, authorize("admin", "manager"), roomController.getRoomDetail);

// Cập nhật phòng (status, capacity)
router.put("/rooms/:id", authenticate, authorize("admin"), roomController.updateRoom);

// Thêm sinh viên vào phòng
router.post("/rooms/:id/students", authenticate, authorize("admin"), roomController.assignStudent);

// Xóa sinh viên khỏi phòng
router.delete("/rooms/:id/students/:studentId", authenticate, authorize("admin"), roomController.removeStudent);

// Lấy danh sách sinh viên chưa có phòng
router.get("/students/available", authenticate, authorize("admin", "manager"), roomController.getAvailableStudents);

module.exports = router;