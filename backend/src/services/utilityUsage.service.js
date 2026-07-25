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

    const deleteUploadedFile = () => {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    };

    try {
      const systemConfig =
        await utilityUsageRepository.findActiveSystemConfig();

      if (!systemConfig) {
        throw createError(400, "Chưa có cấu hình hệ thống đang hoạt động");
      }

      const electricityUnitPrice = Number(systemConfig.electricityPrice);

      const waterUnitPrice = Number(systemConfig.waterPrice);

      if (!Number.isFinite(electricityUnitPrice) || electricityUnitPrice < 0) {
        throw createError(400, "Giá điện trong cấu hình hệ thống không hợp lệ");
      }

      if (!Number.isFinite(waterUnitPrice) || waterUnitPrice < 0) {
        throw createError(400, "Giá nước trong cấu hình hệ thống không hợp lệ");
      }

      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw createError(400, "File Excel không có sheet dữ liệu");
      }

      const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        raw: false,
        defval: "",
      });

      if (!Array.isArray(rows) || rows.length === 0) {
        throw createError(400, "File Excel không có dữ liệu");
      }

      const normalizeUsage = (value) => {
        if (value === "" || value === null || value === undefined) {
          return 0;
        }

        const normalized = String(value)
          .trim()
          .replace(/\s/g, "")
          .replace(",", ".");

        const result = Number(normalized);

        return Number.isFinite(result) ? result : NaN;
      };

      const validRows = [];
      const errorRows = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        const buildingName = String(row["Tòa"] || "").trim();
        const floor = Number(row["Tầng"]);
        const roomNumber = String(row["Phòng"] || "").trim();

        const electricityUsage = normalizeUsage(row["Số điện"]);

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

        if (!Number.isInteger(floor) || floor < 1 || floor > 5) {
          errorRows.push({
            row: rowNumber,
            column: "Tầng",
            buildingName,
            reason: "Tầng phải là số nguyên từ 1 đến 5",
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

        if (!Number.isFinite(electricityUsage) || electricityUsage < 0) {
          errorRows.push({
            row: rowNumber,
            column: "Số điện",
            buildingName,
            floor,
            roomNumber,
            reason: "Số điện phải là số hợp lệ và không được âm",
          });

          continue;
        }

        if (!Number.isInteger(month) || month < 1 || month > 12) {
          errorRows.push({
            row: rowNumber,
            column: "Tháng",
            buildingName,
            floor,
            roomNumber,
            reason: "Tháng phải là số nguyên từ 1 đến 12",
          });

          continue;
        }

        if (!Number.isInteger(year) || year < 2000) {
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

        const room =
          await utilityUsageRepository.findRoomByBuildingFloorAndNumber({
            buildingName,
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
            reason: "Không tìm thấy phòng tương ứng trong hệ thống",
          });

          continue;
        }

        /*
         * Lấy số sinh viên đang ở trong phòng.
         * Ưu tiên độ dài mảng students.
         */
        const occupantCount = Array.isArray(room.students)
          ? room.students.length
          : Number(room.currentOccupants || 0);

        if (
          !Number.isInteger(occupantCount) ||
          occupantCount < 0 ||
          occupantCount > room.capacity
        ) {
          errorRows.push({
            row: rowNumber,
            column: "Phòng",
            buildingName,
            floor,
            roomNumber,
            reason: "Số người hiện đang ở trong phòng không hợp lệ",
          });

          continue;
        }

        const electricityAmount = Math.round(
          electricityUsage * electricityUnitPrice,
        );

        const waterAmount = Math.round(occupantCount * waterUnitPrice);

        const totalAmount = electricityAmount + waterAmount;

        validRows.push({
          room,
          buildingName,
          floor,
          roomNumber,
          semester,
          month,
          year,
          electricityUsage,
          electricityUnitPrice,
          electricityAmount,
          waterAmount,
          totalAmount,
        });
      }

      if (errorRows.length > 0) {
        return {
          success: false,
          message: "File có lỗi. Vui lòng sửa rồi import lại.",
          totalRows: rows.length,
          imported: 0,
          existed: 0,
          failed: errorRows.length,
          errors: errorRows,
          existedRows: [],
          data: [],
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

            electricityUsage: item.electricityUsage,

            electricityUnitPrice: item.electricityUnitPrice,

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

      return {
        success: imported.length > 0,

        message:
          imported.length > 0
            ? "Import dữ liệu điện nước thành công"
            : "Dữ liệu đã tồn tại",

        systemConfig: {
          id: systemConfig._id,
          name: systemConfig.name,
          electricityPrice: electricityUnitPrice,
          waterPrice: waterUnitPrice,
        },

        totalRows: rows.length,
        imported: imported.length,
        existed: existedRows.length,
        failed: 0,
        errors: [],
        existedRows,
        data: imported,
      };
    } finally {
      deleteUploadedFile();
    }
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
    const { semester, billingMonth, dueDate } = data;

    if (!semester || billingMonth === undefined || !dueDate) {
      throw createError(
        400,
        "Thiếu học kỳ, tháng thanh toán hoặc hạn thanh toán",
      );
    }

    const parsedBillingMonth = Number(billingMonth);

    if (
      !Number.isInteger(parsedBillingMonth) ||
      parsedBillingMonth < 1 ||
      parsedBillingMonth > 12
    ) {
      throw createError(
        400,
        "Tháng thanh toán phải nằm trong khoảng từ 1 đến 12",
      );
    }

    const dueDateTime = new Date(dueDate);

    if (Number.isNaN(dueDateTime.getTime())) {
      throw createError(400, "Hạn thanh toán không hợp lệ");
    }

    dueDateTime.setHours(23, 59, 59, 999);

    const bookings =
      await utilityUsageRepository.findConfirmedBookingsBySemester(semester);

    if (!bookings.length) {
      throw createError(
        404,
        "Không tìm thấy sinh viên đang ở trong học kỳ này",
      );
    }

    const results = [];

    for (const booking of bookings) {
      try {
        const room = booking.roomId;
        const studentId = booking.studentId?._id || booking.studentId;

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

        /*
         * Chỉ lấy dữ liệu điện nước của đúng một tháng,
         * không cộng toàn bộ 4 tháng trong học kỳ nữa.
         */
        const usage =
          await utilityUsageRepository.findUsageByRoomSemesterAndMonth(
            room._id,
            semester,
            parsedBillingMonth,
          );

        if (!usage) {
          results.push({
            bookingId: booking._id,
            studentId,
            roomId: room._id,
            status: "failed",
            message: `Phòng chưa có dữ liệu điện nước tháng ${parsedBillingMonth} của học kỳ ${semester}`,
          });
          continue;
        }

        /*
         * Kiểm tra trùng theo:
         * booking + sinh viên + học kỳ + tháng.
         */
        const existedInvoice =
          await utilityUsageRepository.findExistingUtilityInvoice({
            bookingId: booking._id,
            studentId,
            semester,
            billingMonth: parsedBillingMonth,
          });

        if (existedInvoice) {
          results.push({
            bookingId: booking._id,
            studentId,
            roomId: room._id,
            invoiceId: existedInvoice._id,
            status: "skipped",
            message: `Sinh viên đã có hóa đơn điện nước tháng ${parsedBillingMonth} của học kỳ ${semester}`,
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
            bookingId: booking._id,
            studentId,
            roomId: room._id,
            status: "failed",
            message: "Không có sinh viên trong phòng",
          });
          continue;
        }

        /*
         * Vì usage là dữ liệu của một tháng nên không cần reduce
         * cộng nhiều bản ghi của cả học kỳ.
         */
        const totalElectricity = Number(usage.electricityAmount || 0);
        const totalWater = Number(usage.waterAmount || 0);

        const studentElectricity = Math.round(totalElectricity / studentCount);

        const studentWater = Math.round(totalWater / studentCount);

        const studentTotal = studentElectricity + studentWater;

        const invoice = await utilityUsageRepository.createInvoice({
          bookingId: booking._id,
          studentId,

          invoiceCode: generateInvoiceCode({
            semester,
            billingMonth: parsedBillingMonth,
          }),

          type: "utility",

          semester,
          billingMonth: parsedBillingMonth,

          amount: studentTotal,

          items: [
            {
              name: "electricity",
              amount: studentElectricity,
            },
            {
              name: "water",
              amount: studentWater,
            },
          ],

          dueDate: dueDateTime,
          status: "unpaid",
        });

        const student = await utilityUsageRepository.findStudentById(studentId);

        let emailSent = false;

        if (student?.email) {
          try {
            await sendUtilityInvoiceMail({
              booking: {
                ...booking.toObject(),
                studentId: student,
              },
              invoice,
              semester,
              billingMonth: parsedBillingMonth,
              dueDate,
            });

            emailSent = true;
          } catch (mailError) {
            console.error(
              `Không thể gửi email hóa đơn cho sinh viên ${studentId}:`,
              mailError.message,
            );
          }
        }

        results.push({
          status: "success",
          bookingId: booking._id,
          studentId,
          roomId: room._id,
          invoiceId: invoice._id,
          semester,
          billingMonth: parsedBillingMonth,
          amount: studentTotal,
          message: emailSent
            ? "Tạo hóa đơn thành công và đã gửi email"
            : student?.email
              ? "Tạo hóa đơn thành công nhưng gửi email thất bại"
              : "Tạo hóa đơn thành công nhưng sinh viên chưa có email",
        });
      } catch (error) {
        /*
         * Nếu hai request tạo cùng hóa đơn chạy đồng thời
         * và database có unique index, MongoDB trả mã 11000.
         */
        if (error?.code === 11000) {
          results.push({
            bookingId: booking._id,
            studentId: booking.studentId?._id || booking.studentId,
            roomId: booking.roomId?._id,
            status: "skipped",
            message: `Hóa đơn tháng ${parsedBillingMonth} đã tồn tại`,
          });

          continue;
        }

        results.push({
          bookingId: booking._id,
          studentId: booking.studentId?._id || booking.studentId,
          roomId: booking.roomId?._id,
          status: "failed",
          message: error.message || "Không thể tạo hóa đơn",
        });
      }
    }

    const successCount = results.filter(
      (item) => item.status === "success",
    ).length;

    const skippedCount = results.filter(
      (item) => item.status === "skipped",
    ).length;

    if (successCount === 0 && skippedCount === 0) {
      throw createError(
        400,
        `Không thể tạo hóa đơn tháng ${parsedBillingMonth}. Chưa có dữ liệu điện nước hợp lệ.`,
      );
    }

    return results;
  }
}

module.exports = new UtilityUsageService();
