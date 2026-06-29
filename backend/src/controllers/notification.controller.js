const Notification = require("../models/notification.model");
const NotificationReceipt = require("../models/notificationReceipt.model");
const { getIO } = require("../socket");

class NotificationController {
  async createNotification(req, res) {
    try {
      const { title, content, targetType, targetRoles, targetUsers } = req.body;

      const notification = await Notification.create({
        title,
        content,
        targetType,
        targetRoles: targetRoles || [],
        targetUsers: targetUsers || [],
        senderId: req.user?.id,
      });

      const io = getIO();

      switch (targetType) {
        case "all":
          io.to("all").emit("new_notification", notification);
          break;

        case "roles":
          (targetRoles || []).forEach((role) => {
            io.to(`role:${role}`).emit("new_notification", notification);
          });
          break;

        case "users":
          (targetUsers || []).forEach((userId) => {
            io.to(`user:${userId}`).emit("new_notification", notification);
          });
          break;
      }

      return res.status(201).json({
        success: true,
        message: "Gửi thông báo thành công",
        data: notification,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi gửi thông báo",
        error: error.message,
      });
    }
  }

  async getAllNotifications(req, res) {
    try {
      const notifications = await Notification.find()
        .populate("senderId", "fullName role")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getNotificationById(req, res) {
    try {
      const notification = await Notification.findById(req.params.id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông báo",
        });
      }

      return res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const notification = await Notification.findByIdAndDelete(req.params.id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông báo",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Xóa thông báo thành công",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMyNotifications(req, res) {
    try {
      const role = req.user.role;
      const userId = req.user.id;

      const notifications = await Notification.find({
        $or: [
          { targetType: "all" },
          {
            targetType: "roles",
            targetRoles: role,
          },
          {
            targetType: "users",
            targetUsers: userId,
          },
        ],
      })
        .populate("senderId", "fullName role")
        .sort({ createdAt: -1 });

      const receipts = await NotificationReceipt.find({
        userId,
        isRead: true,
      });

      const readIds = receipts.map((item) => item.notificationId.toString());

      const data = notifications.map((item) => {
        const obj = item.toObject();

        return {
          ...obj,
          isRead: readIds.includes(item._id.toString()),
        };
      });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const notificationId = req.params.id;
      const userId = req.user.id;

      await NotificationReceipt.findOneAndUpdate(
        {
          notificationId,
          userId,
        },
        {
          isRead: true,
          readAt: new Date(),
        },
        {
          upsert: true,
          new: true,
        },
      );

      return res.status(200).json({
        success: true,
        message: "Đã đọc thông báo",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new NotificationController();
