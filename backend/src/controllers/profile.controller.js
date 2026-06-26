const User = require("../models/user.model");

require("../models/student.model");
require("../models/staff.model");
require("../models/manager.model");
require("../models/admin.model");

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;

    const user = await User.findById(userId)
      .select("-password -parent.password -parent.passwordHash")
      .populate("buildingId", "buildingName name")
      .populate("roomId", "roomNumber roomName name")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    if (req.auth?.role === "parent") {
      return res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.parent?.fullName || "",
          email: user.email || "",
          username: user.parent?.username || "",
          phone: user.parent?.phone || "",
          relationship: user.parent?.relationship || "parent",
          role: "parent",
          student: {
            fullName: user.fullName,
          },
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin tài khoản",
      error: error.message,
    });
  }
};
