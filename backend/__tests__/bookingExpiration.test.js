/**
 * Function Code : BOOKING_EXPIRE_*
 * Class        : Booking Repository + Expiration Job
 *                (booking.repository.js / bookingExpiration.job.js)
 * Description  : Luong giu giuong 5 phut - xoa booking pending het han
 *                va hoa don tien phong chua thanh toan lien quan
 * Pre-Condition: Cac model mongoose duoc mock
 *
 * ===== BOOKING_EXPIRE_REPO - deleteExpiredPendingBookings =====
 *   UTCID01 - Normal   : khong co booking het han -> khong xoa gi, tra 0/0
 *   UTCID02 - Normal   : co booking het han -> xoa booking + invoice room_fee unpaid
 *   UTCID03 - Normal   : chi xoa invoice type room_fee & status unpaid cua dung bookingIds
 *
 * ===== BOOKING_EXPIRE_REPO - release/delete pending =====
 *   UTCID04 - Normal   : releasePendingBookingsByStudentAndSemester xoa dung dieu kien
 *   UTCID05 - Normal   : deletePendingBookingById chi xoa booking status pending
 *   UTCID06 - Normal   : deletePendingBookingByTxnRef chi xoa booking status pending
 *
 * ===== BOOKING_EXPIRE_JOB - autoDeleteExpiredBookings (cron moi phut) =====
 *   UTCID07 - Normal   : dang ky cron "* * * * *" timezone Asia/Ho_Chi_Minh
 *   UTCID08 - Normal   : tick co xoa -> goi repository + log ket qua
 *   UTCID09 - Normal   : tick khong xoa gi -> khong log
 *   UTCID10 - Abnormal : repository throw -> bat loi, khong crash
 */

// ---- Mock dependencies BEFORE require ----
jest.mock("../src/models/room.models");
jest.mock("../src/models/building.model");
jest.mock("../src/models/booking.model");
jest.mock("../src/models/user.model");
jest.mock("../src/models/invoice.model");
jest.mock("../src/models/systemConfig.model");
jest.mock("node-cron");

const cron = require("node-cron");
const Booking = require("../src/models/booking.model");
const Invoice = require("../src/models/invoice.model");
const bookingRepository = require("../src/repositories/booking.repository");
const autoDeleteExpiredBookings = require("../src/config/bookingExpiration.job");

beforeEach(() => {
  jest.clearAllMocks();
});

// =====================================================================
// BOOKING_EXPIRE_REPO - deleteExpiredPendingBookings
// =====================================================================
describe("BOOKING_EXPIRE_REPO - deleteExpiredPendingBookings", () => {
  // UTCID01 - Normal
  test("UTCID01: khong co booking het han -> khong xoa gi, tra 0/0", async () => {
    Booking.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    });

    const result = await bookingRepository.deleteExpiredPendingBookings();

    expect(result).toEqual({ deletedBookings: 0, deletedInvoices: 0 });
    expect(Invoice.deleteMany).not.toHaveBeenCalled();
    expect(Booking.deleteMany).not.toHaveBeenCalled();
  });

  // UTCID02 - Normal
  test("UTCID02: co booking het han -> xoa booking + invoice, tra dung so luong", async () => {
    Booking.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([{ _id: "b1" }, { _id: "b2" }]),
    });
    Invoice.deleteMany.mockResolvedValue({ deletedCount: 2 });
    Booking.deleteMany.mockResolvedValue({ deletedCount: 2 });

    const result = await bookingRepository.deleteExpiredPendingBookings();

    expect(result).toEqual({ deletedBookings: 2, deletedInvoices: 2 });

    // Query booking het han: pending + paymentExpiresAt <= now
    expect(Booking.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "pending",
        paymentExpiresAt: expect.objectContaining({
          $lte: expect.any(Date),
        }),
      }),
    );

    // Chi xoa booking pending da het han theo dung ids
    expect(Booking.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: { $in: ["b1", "b2"] },
        status: "pending",
      }),
    );
  });

  // UTCID03 - Normal
  test("UTCID03: chi xoa invoice room_fee unpaid cua dung bookingIds", async () => {
    Booking.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([{ _id: "b1" }]),
    });
    Invoice.deleteMany.mockResolvedValue({ deletedCount: 1 });
    Booking.deleteMany.mockResolvedValue({ deletedCount: 1 });

    await bookingRepository.deleteExpiredPendingBookings();

    expect(Invoice.deleteMany).toHaveBeenCalledWith({
      bookingId: { $in: ["b1"] },
      type: "room_fee",
      status: "unpaid",
    });
  });
});

// =====================================================================
// BOOKING_EXPIRE_REPO - release/delete pending
// =====================================================================
describe("BOOKING_EXPIRE_REPO - release/delete pending", () => {
  // UTCID04 - Normal
  test("UTCID04: releasePendingBookingsByStudentAndSemester xoa dung dieu kien", async () => {
    Booking.deleteMany.mockResolvedValue({ deletedCount: 1 });

    await bookingRepository.releasePendingBookingsByStudentAndSemester(
      "student-1",
      "Fall 2026",
    );

    expect(Booking.deleteMany).toHaveBeenCalledWith({
      studentId: "student-1",
      semester: "Fall 2026",
      status: "pending",
    });
  });

  // UTCID05 - Normal
  test("UTCID05: deletePendingBookingById chi xoa booking pending", async () => {
    Booking.findOneAndDelete.mockResolvedValue({ _id: "b1" });

    await bookingRepository.deletePendingBookingById("b1");

    expect(Booking.findOneAndDelete).toHaveBeenCalledWith({
      _id: "b1",
      status: "pending",
    });
  });

  // UTCID06 - Normal
  test("UTCID06: deletePendingBookingByTxnRef chi xoa booking pending", async () => {
    Booking.findOneAndDelete.mockResolvedValue({ _id: "b1" });

    await bookingRepository.deletePendingBookingByTxnRef("TXN-123");

    expect(Booking.findOneAndDelete).toHaveBeenCalledWith({
      txnRef: "TXN-123",
      status: "pending",
    });
  });
});

// =====================================================================
// BOOKING_EXPIRE_JOB - autoDeleteExpiredBookings
// =====================================================================
describe("BOOKING_EXPIRE_JOB - autoDeleteExpiredBookings", () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  const getScheduledCallback = () => {
    autoDeleteExpiredBookings();
    return cron.schedule.mock.calls[0][1];
  };

  // UTCID07 - Normal
  test('UTCID07: dang ky cron "* * * * *" timezone Asia/Ho_Chi_Minh', () => {
    autoDeleteExpiredBookings();

    expect(cron.schedule).toHaveBeenCalledWith(
      "* * * * *",
      expect.any(Function),
      { timezone: "Asia/Ho_Chi_Minh" },
    );
  });

  // UTCID08 - Normal
  test("UTCID08: tick co xoa -> goi repository + log ket qua", async () => {
    Booking.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([{ _id: "b1" }]),
    });
    Invoice.deleteMany.mockResolvedValue({ deletedCount: 1 });
    Booking.deleteMany.mockResolvedValue({ deletedCount: 1 });

    const tick = getScheduledCallback();
    await tick();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Deleted 1 expired bookings"),
    );
  });

  // UTCID09 - Normal
  test("UTCID09: tick khong xoa gi -> khong log", async () => {
    Booking.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    });

    const tick = getScheduledCallback();
    await tick();

    expect(logSpy).not.toHaveBeenCalled();
  });

  // UTCID10 - Abnormal
  test("UTCID10: repository throw -> bat loi, khong crash", async () => {
    Booking.find.mockImplementation(() => {
      throw new Error("db down");
    });

    const tick = getScheduledCallback();
    await expect(tick()).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      "Auto delete expired bookings error:",
      expect.any(Error),
    );
  });
});
