const { verifyToken } = require("../auth/checkAuth");
const userModel = require("../models/user.model");

const authUser = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, logged } = req.cookies;

    if ((logged && !accessToken) || (!logged && accessToken)) {
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
        message: "Vui lòng đăng nhập lại",
      });
    }

    const decoded = await verifyToken(accessToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    req.user = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Phiên đăng nhập đã hết hạn",
    });
  }
};

const authAdmin = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập lại",
      });
    }

    const decoded = await verifyToken(accessToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
    });
  }
};

module.exports = {
  authUser,
  authAdmin,
};