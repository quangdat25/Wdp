const xlsx = require("xlsx");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Student = require("../models/student.model");
const Room = require("../models/room.models");
const Violation = require("../models/violation.model");

const normalizeGender = (gender) => {
  if (!gender) return "other";

  const value = String(gender).trim().toLowerCase();

  if (["nam", "male"].includes(value)) return "male";
  if (["nữ", "nu", "female"].includes(value)) return "female";

  return "other";
};

const parseExcelDate = (value) => {
  if (!value) return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    const date = xlsx.SSF.parse_date_code(value);
    if (!date) return null;

    return new Date(date.y, date.m - 1, date.d);
  }

  if (typeof value === "string") {
    const text = value.trim();

    const parts = text.split(/[\/\-]/);

    if (parts.length === 3) {
      const day = Number(parts[0]);
      const month = Number(parts[1]);
      const year = Number(parts[2]);

      const parsedDate = new Date(year, month - 1, day);

      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  }

  return null;
};

exports.importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn file Excel",
      });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];

    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      raw: false,
      defval: "",
    });

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "File Excel không có dữ liệu",
      });
    }

    const validStudents = [];
    const errorRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      const studentCode = String(row["Mã sinh viên"] || "").trim();
      const fullName = String(row["Họ và tên"] || "").trim();
      const email = String(row["Email"] || "")
        .trim()
        .toLowerCase();

      const parentUsername = String(row["Tài khoản phụ huynh"] || "").trim();
      const parentPassword = String(row["Mật khẩu phụ huynh"] || "").trim();

      const dateOfBirth = parseExcelDate(row["Ngày sinh"]);

      if (!studentCode) {
        errorRows.push({
          row: rowNumber,
          column: "Mã sinh viên",
          studentCode,
          reason: "Thiếu mã sinh viên",
        });
        continue;
      }

      if (!fullName) {
        errorRows.push({
          row: rowNumber,
          column: "Họ và tên",
          studentCode,
          reason: "Thiếu họ và tên",
        });
        continue;
      }

      if (!email) {
        errorRows.push({
          row: rowNumber,
          column: "Email",
          studentCode,
          reason: "Thiếu email",
        });
        continue;
      }

      if (!dateOfBirth) {
        errorRows.push({
          row: rowNumber,
          column: "Ngày sinh",
          studentCode,
          reason: "Ngày sinh không hợp lệ",
        });
        continue;
      }

      if (!parentUsername) {
        errorRows.push({
          row: rowNumber,
          column: "Tài khoản phụ huynh",
          studentCode,
          reason: "Thiếu tài khoản phụ huynh",
        });
        continue;
      }

      if (!parentPassword) {
        errorRows.push({
          row: rowNumber,
          column: "Mật khẩu phụ huynh",
          studentCode,
          reason: "Thiếu mật khẩu phụ huynh",
        });
        continue;
      }
      const existedByCode = await Student.findOne({ studentCode });
      const existedByEmail = await Student.findOne({ email });

      if (existedByCode && existedByEmail) {
        errorRows.push({
          row: rowNumber,
          column: "Mã sinh viên / Email",
          studentCode,
          reason: "Mã sinh viên và email đã tồn tại",
        });
        continue;
      }

      if (existedByCode) {
        errorRows.push({
          row: rowNumber,
          column: "Mã sinh viên",
          studentCode,
          reason: "Mã sinh viên đã tồn tại",
        });
        continue
      }

      if (existedByEmail) {
        errorRows.push({
          row: rowNumber,
          column: "Email",
          studentCode,
          reason: "Email đã tồn tại",
        });
        continue;
      }
      validStudents.push({
        row,
        studentCode,
        fullName,
        email,
        parentUsername,
        parentPassword,
        dateOfBirth,
      });
    }

    if (errorRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "File có lỗi. Vui lòng sửa các dòng lỗi rồi import lại.",
        totalRows: rows.length,
        imported: 0,
        failed: errorRows.length,
        errors: errorRows,
      });
    }

    const importedStudents = [];

    for (const item of validStudents) {
      const row = item.row;

      const parentPassword = await bcrypt.hash(item.parentPassword, 10);

      const student = await Student.create({
        role: "student",

        fullName: item.fullName,
        email: item.email,

        studentCode: item.studentCode,

        phone: String(row["Số điện thoại"] || "").trim(),

        gender: normalizeGender(row["Giới tính"]),

        dateOfBirth: item.dateOfBirth,

        major: String(row["Chuyên ngành"] || "").trim(),

        address: String(row["Địa chỉ"] || "").trim(),

        status: "active",

        parent: {
          username: item.parentUsername,
          password: parentPassword,
          fullName: String(row["Họ tên phụ huynh"] || "").trim(),
          phone: String(row["Số điện thoại phụ huynh"] || "").trim(),
          relationship: "parent",
        },
      });

      importedStudents.push(student);
    }

    return res.status(200).json({
      success: true,
      message: "Import danh sách sinh viên thành công",
      totalRows: rows.length,
      imported: importedStudents.length,
      failed: 0,
      errors: [],
      data: importedStudents,
    });
  } catch (error) {
    console.log("IMPORT STUDENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi import file Excel",
      error: error.message,
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({
      role: "student",
    }).sort({ createdAt: -1 });
    console.log(students);
    
    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách sinh viên",
      error: error.message,
    });
  }
};

// Che phần giữa chuỗi, giữ lại 3 ký tự đầu
const maskField = (value) => {
  if (!value) return "";
  const str = String(value);
  if (str.length <= 3) return str;
  return str.slice(0, 3) + "****";
};

// Security tra cứu sinh viên (theo MSSV, tên, SĐT)
// Phân tầng: SV cùng tòa → xem đủ, SV khác tòa → che field nhạy cảm
exports.searchStudents = async (req, res) => {
  try {
    const { q } = req.query;
    const securityBuildingId = req.user.buildingId || null;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Từ khóa tìm kiếm cần ít nhất 2 ký tự",
      });
    }

    const keyword = q.trim();
    const query = {
      $or: [
        { fullName: { $regex: keyword, $options: "i" } },
        { studentCode: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
      ],
    };

    const students = await Student.find(query)
      .populate("buildingId", "name")
      .populate("roomId", "roomNumber floor displayName")
      .select("-password -username")
      .limit(20)
      .sort({ fullName: 1 });

    if (!students || students.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Batch lookup bedNumber từ Room
    const studentIds = students.map((s) => s._id);
    const roomsWithTheseStudents = await Room.find({
      "students.student": { $in: studentIds },
    }).select("students.student students.bedNumber");

    const bedMap = {};
    for (const room of roomsWithTheseStudents) {
      for (const entry of room.students) {
        const sid = entry.student.toString();
        if (studentIds.some((s) => s.toString() === sid)) {
          bedMap[sid] = entry.bedNumber;
        }
      }
    }

    // Post-process: phân tầng field theo tòa
    const result = [];
    for (const student of students) {
      const studentObj = student.toObject();
      const isSameBuilding =
        securityBuildingId &&
        student.buildingId &&
        student.buildingId._id.toString() === securityBuildingId.toString();

      studentObj.isSameBuilding = isSameBuilding;
      studentObj.bedNumber = bedMap[student._id.toString()] || null;

      if (isSameBuilding) {
        // SV cùng tòa: lấy thêm lịch sử vi phạm
        const violations = await Violation.find({
          studentId: student._id,
        })
          .select("reason location pointsDeducted status createdAt")
          .sort({ createdAt: -1 })
          .limit(10);
        studentObj.violations = violations;
      } else {
        // SV khác tòa: che field nhạy cảm
        studentObj.phone = maskField(studentObj.phone);
        studentObj.email = maskField(studentObj.email);
        studentObj.CFDScore = null;
        studentObj.violations = [];
        studentObj.parent = null;
      }

      result.push(studentObj);
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Search students error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm sinh viên",
      error: error.message,
    });
  }
};
