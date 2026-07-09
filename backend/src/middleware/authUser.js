const { verifyToken } = require("../utils/jwt.util");
const userModel = require("../models/user.model");

// 1. Middleware xác thực: Đảm bảo người dùng đã đăng nhập
const authenticate = async (req, res, next) => {
  try {
    // Lấy accessToken từ cookie hoặc từ Header Authorization (Bearer token)
    let accessToken = req.cookies?.accessToken;

    if (
      !accessToken &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      accessToken = req.headers.authorization.split(" ")[1];
    }

    const { refreshToken, logged } = req.cookies || {};

    if (
      req.cookies?.logged &&
      ((logged && !req.cookies?.accessToken) ||
        (!logged && req.cookies?.accessToken))
    ) {
      res.clearCookie("logged");
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập lại",
      });
    }

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Chưa đăng nhập hoặc phiên làm việc đã hết hạn",
      });
    }

    // Verify token từ file checkAuth.js
    const decoded = await verifyToken(accessToken);
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Token không hợp lệ" });
    }

    // Tìm user trong DB để xác nhận tồn tại
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    // Gán thông tin user vào req để các controller/middleware sau dùng
    req.user = user;
    // thêm thông tin từ token
    req.auth = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Lỗi xác thực: " + error.message,
    });
  }
};

// 2. Middleware phân quyền: Dùng cho các role/staffType cụ thể
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user đã được gán từ middleware authenticate trước đó
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Chưa xác thực" });
    }

    const staffType = req.user.staffType;
    const role = req.auth?.role || req.user.role;

    // Kiểm tra nếu role hoặc staffType nằm trong danh sách được phép
    const isAllowed =
      allowedRoles.includes(role) || allowedRoles.includes(staffType);

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập vào mục này.",
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
