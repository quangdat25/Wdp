const express = require("express");
const multer = require("multer");
const studentController = require("../controllers/student.controller");

const { authenticate, authorize } = require("../middleware/authUser");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

// Lấy tất cả sinh viên
router.get("/", authenticate, authorize("admin"), studentController.getAllStudents);

// Import danh sách sinh viên + phụ huynh từ Excel
router.post(
  "/import",
  authenticate,
  authorize("admin"),
  upload.single("file"),
  studentController.importStudents
);

module.exports = router;