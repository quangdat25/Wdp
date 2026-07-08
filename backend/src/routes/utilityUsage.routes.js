const express = require("express");
const multer = require("multer");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const {
  importUtilityExcel,
  getAllUtilityUsages,
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
  importUtilityExcel
);

// Staff, manager, admin xem danh sách
router.get(
  "/",
  authenticate,
  authorize("staff", "manager", "admin"),
  getAllUtilityUsages
);

// Manager/admin xóa bản ghi
router.delete(
  "/:id",
  authenticate,
  authorize("manager", "admin"),
  deleteUtilityUsage
);

// Manager tạo hóa đơn điện nước cho sinh viên cuối kỳ
router.post(
  "/create-invoices",
  authenticate,
  authorize("manager", "admin"),
  createUtilityInvoices
);

module.exports = router;