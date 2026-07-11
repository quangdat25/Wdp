const xlsx = require("xlsx");
const fs = require("fs");
const sendMail = require("../config/mail");
const utilityUsageRepository = require("../repositories/utilityUsage.repository");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const generateInvoiceCode = () => {
  return `UTIL-${Math.floor(Math.random() * 10000)}`;
};

const normalizeMoney = (value) => {
  if (value === "" || value === null || value === undefined) return 0;

  return Number(
    String(value)
      .replace(/,/g, "")
      .replace(/\./g, "")
      .replace(/\s/g, "")
      .trim(),
  );
};
const sendUtilityInvoiceMail = async ({
  booking,
  invoice,
  semester,
  dueDate,
}) => {
  try {
    const student = booking.studentId;

    if (!student?.email) {
      console.log("Student không có email, bỏ qua gửi mail");
      return;
    }

    const studentName = student.fullName || student.username || "sinh viên";
    const room = booking.roomId;
    const building =
      room?.building?.name ||
      room?.building?.buildingName ||
      room?.building?.displayName ||
      "";

    const electricity =
      invoice.items.find((item) => item.name === "electricity")?.amount || 0;

    const water =
      invoice.items.find((item) => item.name === "water")?.amount || 0;

    await sendMail({
      to: student.email,
      subject: "[FPT Dormitory] Hóa đơn điện nước mới",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="color: #2563eb;">Thông báo hóa đơn điện nước</h2>

          <p>Xin chào <b>${studentName}</b>,</p>

          <p>Bạn có hóa đơn điện nước mới cần thanh toán.</p>

          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p><b>Mã hóa đơn:</b> ${invoice.invoiceCode}</p>
            <p><b>Kỳ:</b> ${semester}</p>
            <p><b>Tòa / Phòng:</b> ${building} - ${room?.roomNumber || ""}</p>
            <p><b>Tiền điện:</b> ${electricity.toLocaleString("vi-VN")} VNĐ</p>
            <p><b>Tiền nước:</b> ${water.toLocaleString("vi-VN")} VNĐ</p>
            <p><b>Tổng tiền:</b> ${invoice.amount.toLocaleString("vi-VN")} VNĐ</p>
            <p><b>Hạn thanh toán:</b> ${new Date(dueDate).toLocaleDateString("vi-VN")}</p>
            <p><b>Trạng thái:</b> Chưa thanh toán</p>
          </div>

          <p>Vui lòng thanh toán trước hạn để tránh phát sinh vấn đề trong quá trình ở ký túc xá.</p>

          <p>Trân trọng,<br/>FPT Dormitory</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Send utility invoice mail error:", error.message);
  }
};
class UtilityUsageService {
  async importUtilityExcel(file, userId) {
    if (!file) {
      throw createError(400, "Vui lòng chọn file Excel");
    }

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];

    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      raw: false,
      defval: "",
    });

    if (!rows || rows.length === 0) {
      throw createError(400, "File Excel không có dữ liệu");
    }

    const validRows = [];
    const errorRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      const buildingName = String(row["Tòa"] || "").trim();
      const floor = Number(row["Tầng"]);
      const roomNumber = String(row["Phòng"] || "").trim();

      const electricityAmount = normalizeMoney(row["Tiền điện"]);
      const waterAmount = normalizeMoney(row["Tiền nước"]);
      const excelTotalAmount = normalizeMoney(row["Tổng tiền"]);

      const month = Number(row["Tháng"]);
      const year = Number(row["Năm"]);
      const semester = String(row["Kỳ"] || "").trim();

      if (!buildingName) {
        errorRows.push({
          row: rowNumber,
          column: "Tòa",
          reason: "Thiếu tên tòa",
        });
        continue;
      }

      if (!floor || floor < 1) {
        errorRows.push({
          row: rowNumber,
          column: "Tầng",
          buildingName,
          reason: "Tầng không hợp lệ",
        });
        continue;
      }

      if (!roomNumber) {
        errorRows.push({
          row: rowNumber,
          column: "Phòng",
          buildingName,
          floor,
          reason: "Thiếu số phòng",
        });
        continue;
      }

      if (electricityAmount < 0 || waterAmount < 0) {
        errorRows.push({
          row: rowNumber,
          column: "Tiền điện / Tiền nước",
          buildingName,
          floor,
          roomNumber,
          reason: "Tiền điện nước không được âm",
        });
        continue;
      }

      if (!month || month < 1 || month > 12) {
        errorRows.push({
          row: rowNumber,
          column: "Tháng",
          buildingName,
          floor,
          roomNumber,
          reason: "Tháng không hợp lệ",
        });
        continue;
      }

      if (!year || year < 2000) {
        errorRows.push({
          row: rowNumber,
          column: "Năm",
          buildingName,
          floor,
          roomNumber,
          reason: "Năm không hợp lệ",
        });
        continue;
      }

      if (!semester) {
        errorRows.push({
          row: rowNumber,
          column: "Kỳ",
          buildingName,
          floor,
          roomNumber,
          reason: "Thiếu kỳ",
        });
        continue;
      }

      const calculatedTotal = electricityAmount + waterAmount;

      if (excelTotalAmount !== calculatedTotal) {
        errorRows.push({
          row: rowNumber,
          column: "Tổng tiền",
          buildingName,
          floor,
          roomNumber,
          reason: `Tổng tiền không khớp. Excel: ${excelTotalAmount}, hệ thống tính: ${calculatedTotal}`,
        });
        continue;
      }

      const room = await utilityUsageRepository.findRoomByImportInfo({
        floor,
        roomNumber,
      });

      if (!room) {
        errorRows.push({
          row: rowNumber,
          column: "Tòa / Tầng / Phòng",
          buildingName,
          floor,
          roomNumber,
          reason: "Không tìm thấy phòng",
        });
        continue;
      }

      if (!room) {
        errorRows.push({
          row: rowNumber,
          column: "Tòa / Tầng / Phòng",
          buildingName,
          floor,
          roomNumber,
          reason: "Không tìm thấy phòng",
        });
        continue;
      }

      const realBuildingName =
        room.building?.name ||
        room.building?.buildingName ||
        room.building?.displayName ||
        "";

      if (
        realBuildingName &&
        realBuildingName.trim().toLowerCase() !== buildingName.toLowerCase()
      ) {
        errorRows.push({
          row: rowNumber,
          column: "Tòa",
          buildingName,
          floor,
          roomNumber,
          reason: `Tên tòa không khớp. Tòa đúng trong hệ thống: ${realBuildingName}`,
        });
        continue;
      }

      validRows.push({
        room,
        buildingName,
        floor,
        roomNumber,
        semester,
        month,
        year,
        electricityAmount,
        waterAmount,
        totalAmount: calculatedTotal,
      });
    }

    if (errorRows.length > 0) {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        success: false,
        message: "File có lỗi. Vui lòng sửa rồi import lại.",
        totalRows: rows.length,
        imported: 0,
        failed: errorRows.length,
        errors: errorRows,
      };
    }

    const imported = [];
    const existedRows = [];

    for (const item of validRows) {
      const result = await utilityUsageRepository.upsertUtilityUsage(
        {
          roomId: item.room._id,
          month: item.month,
          year: item.year,
        },
        {
          roomId: item.room._id,
          buildingName: item.buildingName,
          floor: item.floor,
          roomNumber: item.roomNumber,
          semester: item.semester,
          month: item.month,
          year: item.year,
          electricityAmount: item.electricityAmount,
          waterAmount: item.waterAmount,
          totalAmount: item.totalAmount,
          importedBy: userId,
        },
      );

      if (result.action === "created") {
        imported.push(result.record);
      }

      if (result.action === "existed") {
        existedRows.push({
          buildingName: item.buildingName,
          floor: item.floor,
          roomNumber: item.roomNumber,
          month: item.month,
          year: item.year,
          semester: item.semester,
          reason: "Dữ liệu phòng/tháng/năm đã tồn tại",
        });
      }
    }

    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      success: imported.length > 0,
      message:
        imported.length > 0
          ? "Import tiền điện nước thành công"
          : "Dữ liệu đã tồn tại",
      totalRows: rows.length,
      imported: imported.length,
      existed: existedRows.length,
      failed: 0,
      errors: [],
      existedRows,
      data: imported,
    };
  }

  async getAllUtilityUsages(query) {
    const filter = {};

    if (query.month) filter.month = Number(query.month);
    if (query.year) filter.year = Number(query.year);
    if (query.semester) filter.semester = query.semester;
    if (query.roomId) filter.roomId = query.roomId;
    if (query.buildingName) filter.buildingName = query.buildingName;
    if (query.floor) filter.floor = Number(query.floor);
    if (query.roomNumber) filter.roomNumber = query.roomNumber;

    return utilityUsageRepository.findAll(filter);
  }
  async getUtilityByStudentId(studentId) {
    if (!studentId) {
      throw createError(400, "Thiếu ID sinh viên");
    }

    return utilityUsageRepository.findByStudentId(studentId);
  }
  async deleteUtilityUsage(id) {
    const record = await utilityUsageRepository.findById(id);

    if (!record) {
      throw createError(404, "Không tìm thấy bản ghi điện nước");
    }

    await utilityUsageRepository.deleteById(id);

    return record;
  }

  async createUtilityInvoices(data) {
    const { semester, dueDate } = data;

    if (!semester || !dueDate) {
      throw createError(400, "Thiếu kỳ hoặc hạn thanh toán");
    }

    const dueDateTime = new Date(dueDate);
    dueDateTime.setHours(23, 59, 59, 999);

    const bookings =
      await utilityUsageRepository.findConfirmedBookingsBySemester(semester);

    if (!bookings.length) {
      throw createError(404, "Không tìm thấy sinh viên đang ở trong kỳ này");
    }

    const results = [];

    for (const booking of bookings) {
      const room = booking.roomId;
      const studentId = booking.studentId;

      if (!room) {
        results.push({
          bookingId: booking._id,
          status: "failed",
          message: "Booking không có phòng",
        });
        continue;
      }

      if (!studentId) {
        results.push({
          bookingId: booking._id,
          roomId: room._id,
          status: "failed",
          message: "Booking không có sinh viên",
        });
        continue;
      }

      const usages = await utilityUsageRepository.findUsagesByRoomAndSemester(
        room._id,
        semester,
      );

      if (!usages.length) {
        results.push({
          bookingId: booking._id,
          studentId,
          roomId: room._id,
          status: "failed",
          message: "Phòng chưa có dữ liệu điện nước do staff import",
        });
        continue;
      }

      const existedInvoice =
        await utilityUsageRepository.findExistingUtilityInvoice(
          booking._id,
          studentId,
        );

      if (existedInvoice) {
        results.push({
          bookingId: booking._id,
          studentId,
          roomId: room._id,
          status: "skipped",
          message: "Sinh viên đã có hóa đơn điện nước kỳ này",
        });
        continue;
      }

      const studentCount =
        await utilityUsageRepository.countStudentsInRoomBySemester(
          room._id,
          semester,
        );

      if (studentCount <= 0) {
        results.push({
          roomId: room._id,
          status: "failed",
          message: "Không có sinh viên trong phòng",
        });
        continue;
      }

      const totalElectricity = usages.reduce(
        (sum, item) => sum + Number(item.electricityAmount || 0),
        0,
      );

      const totalWater = usages.reduce(
        (sum, item) => sum + Number(item.waterAmount || 0),
        0,
      );

      const studentElectricity = Math.round(totalElectricity / studentCount);
      const studentWater = Math.round(totalWater / studentCount);
      const studentTotal = studentElectricity + studentWater;

      const invoice = await utilityUsageRepository.createInvoice({
        bookingId: booking._id,
        studentId,
        invoiceCode: generateInvoiceCode(),
        type: "utility",
        amount: studentTotal,
        items: [
          { name: "electricity", amount: studentElectricity },
          { name: "water", amount: studentWater },
        ],
        dueDate: dueDateTime,
        status: "unpaid",
      });

      const student = await utilityUsageRepository.findStudentById(studentId);
      if (student?.email) {
        await sendUtilityInvoiceMail({
          booking: {
            ...booking.toObject(),
            studentId: student,
          },
          invoice,
          semester,
          dueDate,
        });
      }

      results.push({
        status: "success",
        bookingId: booking._id,
        studentId,
        roomId: room._id,
        invoiceId: invoice._id,
        amount: studentTotal,
        message: student?.email
          ? "Tạo hóa đơn thành công và đã gửi mail"
          : "Tạo hóa đơn thành công nhưng sinh viên chưa có email",
      });
    }

    const successCount = results.filter(
      (item) => item.status === "success",
    ).length;

    if (successCount === 0) {
      throw createError(
        400,
        "Không thể tạo hóa đơn. Chưa có dữ liệu điện nước hợp lệ do staff import hoặc hóa đơn đã tồn tại.",
      );
    }

    return results;
  }
}

module.exports = new UtilityUsageService();
