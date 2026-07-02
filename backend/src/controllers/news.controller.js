const News = require("../models/news.model");
const Notification = require("../models/notification.model");
const { getIO } = require("../socket");

// Manager đăng bản tin mới
exports.createNews = async (req, res) => {
  try {
    const { title, content, status, isPinned } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tiêu đề bản tin",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập nội dung bản tin",
      });
    }

    const news = await News.create({
      title: title.trim(),
      content: content.trim(),
      authorId: req.user._id || req.user.id,
      buildingId: req.user.buildingId || null,
      status: status || "published",
      isPinned: isPinned || false,
    });

    await news.populate("authorId", "fullName");
    await news.populate("buildingId", "name");

    const io = getIO();

    // Chỉ push realtime khi bản tin được xuất bản
    if (news.status === "published") {
      // 1. Push sự kiện new_news vào room role:student (cập nhật trang News)
      io.to("role:student").emit("new_news", news);

      // 2. Tạo Notification cho tất cả student (để chuông Header rung)
      const notification = await Notification.create({
        title: `Bản tin mới: ${news.title}`,
        content: news.content,
        targetType: "roles",
        targetRoles: ["student"],
        targetUsers: [],
        senderId: req.user._id || req.user.id,
      });

      io.to("role:student").emit("new_notification", notification);
    }

    return res.status(201).json({
      success: true,
      message: "Đăng bản tin thành công",
      data: news,
    });
  } catch (error) {
    console.error("Create news error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi đăng bản tin",
      error: error.message,
    });
  }
};

// Lấy danh sách bản tin (student chỉ thấy published, manager thấy tất cả)
exports.getAllNews = async (req, res) => {
  try {
    const userRole = req.auth?.role || req.user?.role;
    const query = {};

    // Sinh viên chỉ xem bản tin đã xuất bản
    if (userRole === "student") {
      query.status = "published";
    }

    const news = await News.find(query)
      .populate("authorId", "fullName")
      .populate("buildingId", "name")
      .sort({ isPinned: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    console.error("Get all news error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bản tin",
      error: error.message,
    });
  }
};
