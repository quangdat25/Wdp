const xlsx = require("xlsx");
const bcrypt = require("bcryptjs");
const Student = require("../models/student.model");

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

    const importedStudents = [];
    const errorRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const studentCode = String(row["Mã sinh viên"] || "").trim();
      const fullName = String(row["Họ và tên"] || "").trim();
      const email = String(row["Email"] || "")
        .trim()
        .toLowerCase();

      const parentUsername = String(row["Tài khoản phụ huynh"] || "").trim();
      const parentPassword = String(row["Mật khẩu phụ huynh"] || "").trim();

      const dateOfBirth = parseExcelDate(row["Ngày sinh"]);

      if (!studentCode || !fullName || !email) {
        errorRows.push({
          row: i + 2,
          studentCode,
          reason: "Thiếu mã sinh viên, họ tên hoặc email",
        });
        continue;
      }

      if (!dateOfBirth) {
        errorRows.push({
          row: i + 2,
          studentCode,
          reason: "Ngày sinh không hợp lệ",
        });
        continue;
      }

      if (!parentUsername || !parentPassword) {
        errorRows.push({
          row: i + 2,
          studentCode,
          reason: "Thiếu tài khoản hoặc mật khẩu phụ huynh",
        });
        continue;
      }

      const existedStudent = await Student.findOne({
        $or: [{ studentCode }, { email }],
      });

      if (existedStudent) {
        errorRows.push({
          row: i + 2,
          studentCode,
          reason: "Mã sinh viên hoặc email đã tồn tại",
        });
        continue;
      }

      const passwordHash = await bcrypt.hash(parentPassword, 10);

      const student = await Student.create({
        roleId: "role_student",

        studentCode,
        fullName,
        email,

        phone: String(row["Số điện thoại"] || "").trim(),
        gender: normalizeGender(row["Giới tính"]),
        address: String(row["Địa chỉ"] || "").trim(),
        dateOfBirth,
        major: String(row["Chuyên ngành"] || "").trim(),
        status: "active",

        parent: {
          username: parentUsername,
          passwordHash,
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
      failed: errorRows.length,
      errors: errorRows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi import file Excel",
      error: error.message,
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

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
