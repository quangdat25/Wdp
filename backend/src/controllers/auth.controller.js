// const jwt = require("jsonwebtoken");
// const User = require("../models/user.model");
// const Student = require("../models/student.model");
// const Parent = require("../models/parent.model");
// const Admin = require("../models/admin.model");
// const DormManager = require("../models/dormManager.model");
// const SecurityStaff = require("../models/securityStaff.model");
// const CleaningStaff = require("../models/cleaningStaff.model");
// const MaintenanceStaff = require("../models/maintenanceStaff.model");

// // ============================================================
// // Helper: generate JWT token
// // ============================================================
// const generateToken = (user) => {
//   return jwt.sign(
//     { id: user._id, role: user.role, email: user.email },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );
// };

// // ============================================================
// // Helper: get profile model by role
// // ============================================================
// const getProfileModel = (role) => {
//   const map = {
//     student: Student,
//     parent: Parent,
//     admin: Admin,
//     dorm_manager: DormManager,
//     security_staff: SecurityStaff,
//     cleaning_staff: CleaningStaff,
//     maintenance_staff: MaintenanceStaff,
//   };
//   return map[role] || null;
// };

// // ============================================================
// // POST /api/auth/google-login   — Student only (Google OAuth)
// // ============================================================
// exports.googleLogin = async (req, res, next) => {
//   try {
//     const { googleId, email, fullName, avatar } = req.body;

//     if (!googleId || !email) {
//       return res.status(400).json({
//         success: false,
//         message: "googleId và email là bắt buộc",
//       });
//     }

//     // Find existing user by googleId or email
//     let user = await User.findOne({
//       $or: [{ googleId }, { email }],
//     });

//     if (user) {
//       // User exists — make sure it's a student
//       if (user.role !== "student") {
//         return res.status(403).json({
//           success: false,
//           message: "Email này đã được đăng ký với vai trò khác",
//         });
//       }

//       // Update Google info if needed
//       if (!user.googleId) user.googleId = googleId;
//       if (fullName) user.fullName = fullName;
//       if (avatar) user.avatar = avatar;
//       user.lastLogin = new Date();
//       await user.save();
//     } else {
//       // Create new student user
//       user = await User.create({
//         email,
//         googleId,
//         authMethod: "google",
//         role: "student",
//         fullName: fullName || email.split("@")[0],
//         avatar: avatar || null,
//         lastLogin: new Date(),
//       });
//     }

//     // Ensure student profile exists
//     let studentProfile = await Student.findOne({ userId: user._id });
//     if (!studentProfile) {
//       studentProfile = await Student.create({
//         userId: user._id,
//         studentCode: `SV_${Date.now()}`, // placeholder — admin can update later
//         gender: "Nam",
//         dateOfBirth: new Date("2000-01-01"),
//         address: "Chưa cập nhật",
//         major: "Chưa cập nhật",
//       });
//     }

//     const token = generateToken(user);

//     // Set cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Đăng nhập Google thành công",
//       data: {
//         user,
//         profile: studentProfile,
//         token,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================================
// // POST /api/auth/login   — All roles EXCEPT student (username + password)
// // ============================================================
// exports.login = async (req, res, next) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Username và password là bắt buộc",
//       });
//     }

//     // Find by username
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Tài khoản hoặc mật khẩu không đúng",
//       });
//     }

//     // Students cannot login with username/password
//     if (user.authMethod === "google") {
//       return res.status(403).json({
//         success: false,
//         message: "Tài khoản này chỉ đăng nhập bằng Google",
//       });
//     }

//     // Check password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Tài khoản hoặc mật khẩu không đúng",
//       });
//     }

//     // Check if active
//     if (!user.isActive) {
//       return res.status(403).json({
//         success: false,
//         message: "Tài khoản đã bị vô hiệu hóa",
//       });
//     }

//     user.lastLogin = new Date();
//     await user.save();

//     // Load role-specific profile
//     const ProfileModel = getProfileModel(user.role);
//     let profile = null;
//     if (ProfileModel) {
//       profile = await ProfileModel.findOne({ userId: user._id });
//     }

//     const token = generateToken(user);

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Đăng nhập thành công",
//       data: {
//         user,
//         profile,
//         token,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================================
// // POST /api/auth/register   — Admin creates accounts for staff/parent/admin
// // ============================================================
// exports.register = async (req, res, next) => {
//   try {
//     const {
//       email,
//       username,
//       password,
//       role,
//       fullName,
//       phoneNumber,
//       // Role-specific fields
//       profileData,
//     } = req.body;

//     // Validate
//     if (!email || !username || !password || !role || !fullName) {
//       return res.status(400).json({
//         success: false,
//         message: "Vui lòng cung cấp đầy đủ thông tin: email, username, password, role, fullName",
//       });
//     }

//     // Students cannot be created via this route
//     if (role === "student") {
//       return res.status(400).json({
//         success: false,
//         message: "Sinh viên chỉ được tạo tài khoản qua Google",
//       });
//     }

//     // Check valid role
//     const validRoles = [
//       "parent",
//       "admin",
//       "dorm_manager",
//       "security_staff",
//       "cleaning_staff",
//       "maintenance_staff",
//     ];
//     if (!validRoles.includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: `Role không hợp lệ. Các role hợp lệ: ${validRoles.join(", ")}`,
//       });
//     }

//     // Check duplicates
//     const existingUser = await User.findOne({
//       $or: [{ email }, { username }],
//     });
//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message: "Email hoặc username đã tồn tại",
//       });
//     }

//     // Create user
//     const user = await User.create({
//       email,
//       username,
//       password,
//       authMethod: "local",
//       role,
//       fullName,
//       phoneNumber: phoneNumber || null,
//     });

//     // Create role-specific profile
//     const ProfileModel = getProfileModel(role);
//     let profile = null;
//     if (ProfileModel) {
//       profile = await ProfileModel.create({
//         userId: user._id,
//         ...(profileData || {}),
//       });
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Tạo tài khoản thành công",
//       data: {
//         user,
//         profile,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================================
// // POST /api/auth/logout
// // ============================================================
// exports.logout = async (req, res, next) => {
//   try {
//     res.clearCookie("token");
//     return res.status(200).json({
//       success: true,
//       message: "Đăng xuất thành công",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================================
// // GET /api/auth/me   — Get current logged-in user info
// // ============================================================
// exports.getMe = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy người dùng",
//       });
//     }

//     // Load role-specific profile
//     const ProfileModel = getProfileModel(user.role);
//     let profile = null;
//     if (ProfileModel) {
//       profile = await ProfileModel.findOne({ userId: user._id });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Lấy thông tin người dùng thành công",
//       data: {
//         user,
//         profile,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
