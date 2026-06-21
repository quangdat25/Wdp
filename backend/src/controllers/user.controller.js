const bcrypt = require("bcryptjs");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken, verifyTokenGoogle, verifyToken } = require("../utils/jwt.util");

function setCookie(res, accessToken, refreshToken) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    sameSite: isProduction ? "none" : "lax",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: isProduction ? "none" : "lax",
  });
  res.cookie("logged", 1, {
    httpOnly: false,
    secure: isProduction,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: isProduction ? "none" : "lax",
  });
}

class UserController {
  async login(req, res) {
    try {
      const { username, email, password } = req.body;
      const loginId = username || email || req.query.username;

      if (!loginId || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ tên đăng nhập (hoặc email) và mật khẩu",
        });
      }

      // Tìm user theo username chính hoặc email hoặc username của parent
      const findUser = await userModel.findOne({
        $or: [
          { username: loginId },
          { email: loginId },
          { "parent.username": loginId },
        ],
      });

      if (!findUser) {
        return res
          .status(404)
          .json({ success: false, message: "Không tồn tại người dùng" });
      }

      let isMatchPassword = false;
      let actualRole = findUser.role;
      let loginUsername = loginId;

      // Kiểm tra xem ai đang đăng nhập (tài khoản chính hay tài khoản parent)
      if (findUser.username === loginId || findUser.email === loginId) {
        // Đăng nhập bằng tài khoản chính (student, staff, admin)
        if (password === findUser.password) {
          isMatchPassword = true;
        } else {
          isMatchPassword = await bcrypt.compare(password, findUser.password);
        }
      } else if (
        findUser.parent &&
        findUser.parent.username === loginId
      ) {
        // Đăng nhập bằng tài khoản parent (nằm trong sub-document của student)
        const parentPassword = findUser.parent.password || findUser.parent.passwordHash;
        if (password === parentPassword) {
          isMatchPassword = true;
        } else {
          isMatchPassword = await bcrypt.compare(password, parentPassword);
        }
        actualRole = "parent"; // Override role cho parent
      }

      if (!isMatchPassword) {
        return res
          .status(401)
          .json({ success: false, message: "Mật khẩu không đúng" });
      }

      const tokenPayload = {
        id: findUser._id,
        username: loginUsername,
        role: actualRole, // Dùng actualRole (nếu là parent thì token sẽ có role parent)
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      setCookie(res, accessToken, refreshToken);

      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          id: findUser._id,
          fullName:
            actualRole === "parent"
              ? findUser.parent.fullName
              : findUser.fullName,
          email: findUser.email,
          username: loginUsername,
          role: actualRole,
          ...(actualRole === "staff" && { staffType: findUser.staffType }),
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ",
      });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.clearCookie("logged");
      return res.status(200).json({
        success: true,
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ",
      });
    }
  }

  async getMe(req, res) {
    try {
      const findUser = await userModel.findById(req.user).select("-password -passwordHash");

      if (!findUser) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        });
      }

      return res.status(200).json({
        success: true,
        data: findUser,
      });
    } catch (error) {
      console.error("GetMe error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ",
      });
    }
  }
  async googleLogin(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: "Vui lòng cung cấp token" });
      }

      const payload = await verifyTokenGoogle(token);
      const { email, name } = payload;

      const findUser = await userModel.findOne({ email });

      if (!findUser) {
        return res.status(404).json({ success: false, message: "Tài khoản không tồn tại trên hệ thống" });
      }

      if (findUser.role !== "student") {
        return res.status(403).json({ success: false, message: "Chỉ sinh viên mới được phép đăng nhập bằng Google" });
      }

      const tokenPayload = {
        id: findUser._id,
        username: findUser.username || findUser.email,
        role: findUser.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      setCookie(res, accessToken, refreshToken);

      return res.status(200).json({
        success: true,
        message: "Đăng nhập Google thành công",
        data: {
          id: findUser._id,
          fullName: findUser.fullName,
          email: findUser.email,
          username: findUser.username,
          role: findUser.role,
        },
      });
    } catch (error) {
      console.error("Google Login error:", error);

    }
  }
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Không tìm thấy Refresh Token",
        });
      }

      const decoded = await verifyToken(refreshToken);
      if (!decoded) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(401).json({
          success: false,
          message: "Refresh Token không hợp lệ hoặc đã hết hạn",
        });
      }

      const findUser = await userModel.findById(decoded.id);
      if (!findUser) {
        return res.status(401).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      const tokenPayload = {
        id: findUser._id,
        username: findUser.username || findUser.email,
        role: findUser.role,
      };

      const newAccessToken = generateAccessToken(tokenPayload);

      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        sameSite: isProduction ? "none" : "lax",
      });

      return res.status(200).json({
        success: true,
        message: "Lấy Access Token mới thành công",
        accessToken: newAccessToken
      });
    } catch (error) {
      console.error("Refresh Token error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ",
      });
    }
  }
}

module.exports = new UserController();