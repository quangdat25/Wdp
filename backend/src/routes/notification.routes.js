const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");
const { authenticate } = require("../middleware/authUser");
router.post("/", authenticate, notificationController.createNotification);

router.get("/my", authenticate, notificationController.getMyNotifications);

router.patch("/:id/read", authenticate, notificationController.markAsRead);

router.get("/", authenticate, notificationController.getAllNotifications);

router.get("/:id", authenticate, notificationController.getNotificationById);

router.delete("/:id", authenticate, notificationController.deleteNotification);

module.exports = router;
    