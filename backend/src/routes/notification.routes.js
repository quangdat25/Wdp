const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");
const verifyToken = require("../middleware/checkAuth").verifyToken;
router.post("/", verifyToken, notificationController.createNotification);

router.get("/my", verifyToken, notificationController.getMyNotifications);

router.patch("/:id/read", verifyToken, notificationController.markAsRead);

router.get("/", verifyToken, notificationController.getAllNotifications);

router.get("/:id", verifyToken, notificationController.getNotificationById);

router.delete("/:id", verifyToken, notificationController.deleteNotification);

module.exports = router;
