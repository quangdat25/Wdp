const express = require("express");
const { asyncHandler } = require("../auth/checkAuth");
const userController = require("../controllers/user.controller");
const router = express.Router();
const { authUser } = require("../middleware/authUser");

router.post("/login", asyncHandler(userController.login));
router.post("/google-login", asyncHandler(userController.googleLogin));
router.post("/logout", authUser, asyncHandler(userController.logout));
router.get("/me", authUser, asyncHandler(userController.getMe));

module.exports = router;