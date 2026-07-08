const express = require("express");
const router = express.Router();
const newsController = require("../controllers/news.controller");
const { authenticate, authorize } = require("../middleware/authUser");
const { asyncHandler } = require("../middleware/asyncHandler");

// Lấy danh sách bản tin (manager + student đều xem được)
router.get(
  "/",
  authenticate,
  asyncHandler(newsController.getAllNews)
);

// Đăng bản tin mới (chỉ Manager)
router.post(
  "/",
  authenticate,
  authorize("manager"),
  asyncHandler(newsController.createNews)
);

module.exports = router;
