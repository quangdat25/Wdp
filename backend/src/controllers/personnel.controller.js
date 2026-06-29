const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const Staff = require("../models/staff.model");
const Manager = require("../models/manager.model");
const User = require("../models/user.model");
const Building = require("../models/building.model");

const PERSONNEL_ROLES = ["staff", "manager"];
const STAFF_TYPES = ["security", "maintenance", "cleaner"];

const populateBuilding = {
  path: "buildingId",
  select: "buildingName name code address",
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateSecurityBuilding = async (staffType, buildingId) => {
  if (staffType !== "security") return null;

  if (!buildingId) {
    return "Vui lòng chọn tòa nhà làm việc cho bảo vệ";
  }

  if (!isValidObjectId(buildingId)) {
    return "Tòa nhà không hợp lệ";
  }

  const building = await Building.findById(buildingId);

  if (!building) {
    return "Không tìm thấy tòa nhà";
  }

  return null;
};

exports.getAllPersonnel = async (req, res) => {
  try {
    const personnel = await User.find({
      role: { $in: PERSONNEL_ROLES },
    })
      .select("-password")
      .populate(populateBuilding)
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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID nhân sự không hợp lệ",
      });
    }

    const personnel = await User.findOne({
      _id: req.params.id,
      role: { $in: PERSONNEL_ROLES },
    })
      .select("-password")
      .populate(populateBuilding);

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
      buildingId,
    } = req.body;

    if (!role || !PERSONNEL_ROLES.includes(role)) {
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

    const hashedPassword = await bcrypt.hash(password, 10);
    let personnel;

    if (role === "staff") {
      if (!staffCode || !staffType) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mã nhân viên và loại staff",
        });
      }

      if (!STAFF_TYPES.includes(staffType)) {
        return res.status(400).json({
          success: false,
          message: "Loại staff không hợp lệ",
        });
      }

      const buildingError = await validateSecurityBuilding(
        staffType,
        buildingId
      );

      if (buildingError) {
        return res.status(400).json({
          success: false,
          message: buildingError,
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
        password: hashedPassword,
        phone,
        status: status || "active",
        staffCode,
        staffType,
        shift: shift || "office",
        startDate,
        note,
        buildingId: staffType === "security" ? buildingId : undefined,
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
        password: hashedPassword,
        phone,
        status: status || "active",
        managerCode,
        department,
        startDate,
        note,
      });
    }

    const result = await User.findById(personnel._id)
      .select("-password")
      .populate(populateBuilding);

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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID nhân sự không hợp lệ",
      });
    }

    const personnel = await User.findOne({
      _id: req.params.id,
      role: { $in: PERSONNEL_ROLES },
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
      buildingId,
    } = req.body;

    if (email && email !== personnel.email) {
      const existedEmail = await User.findOne({
        _id: { $ne: personnel._id },
        email,
      });

      if (existedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email đã tồn tại",
        });
      }
    }

    if (username && username !== personnel.username) {
      const existedUsername = await User.findOne({
        _id: { $ne: personnel._id },
        username,
      });

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

    if (password && password.trim() !== "") {
      personnel.password = await bcrypt.hash(password, 10);
    }

    if (personnel.role === "staff") {
      const nextStaffType = staffType ?? personnel.staffType;

      if (!STAFF_TYPES.includes(nextStaffType)) {
        return res.status(400).json({
          success: false,
          message: "Loại staff không hợp lệ",
        });
      }

      const nextBuildingId =
        buildingId !== undefined ? buildingId : personnel.buildingId;

      const buildingError = await validateSecurityBuilding(
        nextStaffType,
        nextBuildingId
      );

      if (buildingError) {
        return res.status(400).json({
          success: false,
          message: buildingError,
        });
      }

      personnel.staffType = nextStaffType;
      personnel.shift = shift ?? personnel.shift;

      if (nextStaffType === "security") {
        personnel.buildingId = nextBuildingId;
      } else {
        personnel.buildingId = undefined;
      }
    }

    if (personnel.role === "manager") {
      personnel.department = department ?? personnel.department;
    }

    await personnel.save();

    const result = await User.findById(personnel._id)
      .select("-password")
      .populate(populateBuilding);

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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID nhân sự không hợp lệ",
      });
    }

    const personnel = await User.findOneAndDelete({
      _id: req.params.id,
      role: { $in: PERSONNEL_ROLES },
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