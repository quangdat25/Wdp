const bcrypt = require("bcryptjs");
const Staff = require("../models/staff.model");
const Manager = require("../models/manager.model");
const User = require("../models/user.model");

exports.getAllPersonnel = async (req, res) => {
  try {
    const personnel = await User.find({
      role: { $in: ["staff", "manager"] },
    })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: personnel.length,
      data: personnel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách nhân sự",
      error: error.message,
    });
  }
};
exports.getPersonnelById = async (req, res) => {
  try {
    const personnel = await User.findOne({
      _id: req.params.id,
      role: { $in: ["staff", "manager"] },
    }).select("-passwordHash");

    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân sự",
      });
    }

    return res.status(200).json({
      success: true,
      data: personnel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết nhân sự",
      error: error.message,
    });
  }
};
exports.createPersonnel = async (req, res) => {
  try {
    const {
      role,
      fullName,
      email,
      username,
      password,
      phone,
      status,
      staffCode,
      staffType,
      shift,
      managerCode,
      department,
      startDate,
      note,
    } = req.body;

    if (!role || !["staff", "manager"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role không hợp lệ",
      });
    }

    if (!fullName || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập họ tên, email, username và password",
      });
    }

    const existedUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existedUser) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc username đã tồn tại",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let personnel;

    if (role === "staff") {
      if (!staffCode || !staffType) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mã nhân viên và loại staff",
        });
      }

      const existedStaffCode = await Staff.findOne({ staffCode });

      if (existedStaffCode) {
        return res.status(400).json({
          success: false,
          message: "Mã nhân viên đã tồn tại",
        });
      }

      personnel = await Staff.create({
        role: "staff",
        fullName,
        email,
        username,
        passwordHash,
        phone,
        status: status || "active",
        staffCode,
        staffType,
        shift: shift || "office",
        startDate,
        note,
      });
    }

    if (role === "manager") {
      if (!managerCode) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mã quản lý",
        });
      }

      const existedManagerCode = await Manager.findOne({ managerCode });

      if (existedManagerCode) {
        return res.status(400).json({
          success: false,
          message: "Mã quản lý đã tồn tại",
        });
      }

      personnel = await Manager.create({
        role: "manager",
        fullName,
        email,
        username,
        passwordHash,
        phone,
        status: status || "active",
        managerCode,
        department,
        startDate,
        note,
      });
    }

    const result = personnel.toObject();
    delete result.passwordHash;

    return res.status(201).json({
      success: true,
      message: "Tạo nhân sự thành công",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo nhân sự",
      error: error.message,
    });
  }
};

exports.updatePersonnel = async (req, res) => {
  try {
    const personnel = await User.findOne({
      _id: req.params.id,
      role: { $in: ["staff", "manager"] },
    });

    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân sự",
      });
    }

    const {
      fullName,
      email,
      username,
      password,
      phone,
      status,
      staffType,
      shift,
      department,
      startDate,
      note,
    } = req.body;

    if (email && email !== personnel.email) {
      const existedEmail = await User.findOne({ email });

      if (existedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email đã tồn tại",
        });
      }
    }

    if (username && username !== personnel.username) {
      const existedUsername = await User.findOne({ username });

      if (existedUsername) {
        return res.status(400).json({
          success: false,
          message: "Username đã tồn tại",
        });
      }
    }

    personnel.fullName = fullName ?? personnel.fullName;
    personnel.email = email ?? personnel.email;
    personnel.username = username ?? personnel.username;
    personnel.phone = phone ?? personnel.phone;
    personnel.status = status ?? personnel.status;
    personnel.startDate = startDate ?? personnel.startDate;
    personnel.note = note ?? personnel.note;

    if (password) {
      personnel.passwordHash = await bcrypt.hash(password, 10);
    }

    if (personnel.role === "staff") {
      personnel.staffType = staffType ?? personnel.staffType;
      personnel.shift = shift ?? personnel.shift;
    }

    if (personnel.role === "manager") {
      personnel.department = department ?? personnel.department;
    }

    await personnel.save();

    const result = personnel.toObject();
    delete result.passwordHash;

    return res.status(200).json({
      success: true,
      message: "Cập nhật nhân sự thành công",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật nhân sự",
      error: error.message,
    });
  }
};

exports.deletePersonnel = async (req, res) => {
  try {
    const personnel = await User.findOneAndDelete({
      _id: req.params.id,
      role: { $in: ["staff", "manager"] },
    });

    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân sự",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa nhân sự thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa nhân sự",
      error: error.message,
    });
  }
};
