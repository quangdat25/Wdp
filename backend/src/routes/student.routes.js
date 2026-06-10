const express = require("express");
const multer = require("multer");
const studentController = require("../controllers/student.controller");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

// Lấy tất cả sinh viên
router.get("/", studentController.getAllStudents);

// Import danh sách sinh viên + phụ huynh từ Excel
router.post(
  "/import",
  upload.single("file"),
  studentController.importStudents
);

module.exports = router;