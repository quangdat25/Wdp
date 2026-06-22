const express = require("express");
const { asyncHandler } = require("../middleware/asyncHandler");
const userController = require("../controllers/user.controller");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/authUser");

router.post("/login", asyncHandler(userController.login));
router.post("/google-login", asyncHandler(userController.googleLogin));
router.post("/logout", authenticate, asyncHandler(userController.logout));
router.get("/me", authenticate, asyncHandler(userController.getMe));
router.get("/refresh", asyncHandler(userController.refreshToken));

// --- VÍ DỤ CÁCH DÙNG PHÂN QUYỀN VỚI MIDDLEWARE MỚI CỦA BẠN ---
// (Chỉ Manager và Admin mới gọi được API này)
// router.get("/all-users", authenticate, authorize("manager", "admin"), userController.getAllUsers);

module.exports = router;