const express = require("express");
const multer = require("multer");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const {
  importUtilityExcel,
  getAllUtilityUsages,
  getMyUtility,
  getUtilityByStudentId,
  deleteUtilityUsage,
  createUtilityInvoices,
} = require("../controllers/utilityUsage.controller");

const { authenticate, authorize } = require("../middleware/authUser");

// Staff import file Excel
router.post(
  "/import",
  authenticate,
  authorize("staff"),
  upload.single("file"),
  importUtilityExcel,
);

// Sinh viên xem tiền điện nước từng tháng của chính mình
router.get("/my-utilities", authenticate, authorize("student"), getMyUtility);

router.get(
  "/student/:studentId",
  authenticate,
  authorize("manager", "admin"),
  getUtilityByStudentId,
);
// Staff, manager, admin xem toàn bộ danh sách
router.get(
  "/",
  authenticate,
  authorize("staff", "manager", "admin"),
  getAllUtilityUsages,
);

// Manager tạo hóa đơn điện nước cuối kỳ
router.post(
  "/create-invoices",
  authenticate,
  authorize("manager", "admin"),
  createUtilityInvoices,
);

// Manager/admin xóa bản ghi
router.delete(
  "/:id",
  authenticate,
  authorize("manager", "admin"),
  deleteUtilityUsage,
);

module.exports = router;
