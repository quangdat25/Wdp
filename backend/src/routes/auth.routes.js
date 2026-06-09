// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/auth.controller");
// const { verifyToken, authorizeRoles } = require("../middleware/checkAuth");

// // --- Public routes ---

// // Student login via Google
// router.post("/google-login", authController.googleLogin);

// // Staff / Parent / Admin login via username + password
// router.post("/login", authController.login);

// // Logout
// router.post("/logout", authController.logout);

// // --- Protected routes ---

// // Get current user info
// router.get("/me", verifyToken, authController.getMe);

// // Register new account (admin only)
// router.post(
//   "/register",
//   verifyToken,
//   authorizeRoles("admin"),
//   authController.register
// );

// module.exports = router;
