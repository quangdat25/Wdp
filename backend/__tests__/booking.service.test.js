/**
 * Function Code : BOOKING_*
 * Class        : Booking Service (booking.service.js)
 * Description  : Toan bo luong dat phong cua sinh vien
 * Pre-Condition: Ket noi server OK, cac repository/model duoc mock
 *
 * ===== BOOKING_ELIGIBILITY - checkBookingEligibility =====
 *   UTCID01 - Abnormal : khong co studentId                       -> 401
 *   UTCID02 - Abnormal : khong tim thay sinh vien                 -> 404
 *   UTCID03 - Abnormal : role khong phai student                  -> 404
 *   UTCID04 - Abnormal : khong co ky tiep theo                    -> 404 next_semester_not_found
 *   UTCID05 - Abnormal : ky chua cau hinh thoi gian dat           -> 400 booking_time_not_configured
 *   UTCID06 - Abnormal : ngoai khoang thoi gian dat phong         -> 400 booking_closed
 *   UTCID07 - Abnormal : da o trong phong (dat moi)               -> 400 already_in_room
 *   UTCID08 - Abnormal : da co booking active o ky tiep theo      -> 409 has_active_booking
 *   UTCID09 - Boundary : CFD = 79 (< 80)                          -> 400 low_cfd
 *   UTCID10 - Abnormal : con hoa don chua thanh toan              -> 400 unpaid_invoice
 *   UTCID11 - Normal   : du dieu kien, CFD = 80                   -> 200 eligible
 *   UTCID12 - Normal   : gia han (isRenew) dung khung gio gia han -> 200 eligible
 *
 * ===== BOOKING_CREATE - createBooking =====
 *   UTCID13 - Abnormal : khong co studentId                       -> 401
 *   UTCID14 - Abnormal : thieu roomId / bedNumber                 -> 400
 *   UTCID15 - Abnormal : roomId khong hop le                      -> 400
 *   UTCID16 - Abnormal : bedNumber khong phai so nguyen           -> 400
 *   UTCID17 - Abnormal : khong co ky tiep theo                    -> 404
 *   UTCID18 - Abnormal : khong tim thay sinh vien                 -> 404
 *   UTCID19 - Abnormal : da o trong phong (khong renew)           -> 400
 *   UTCID20 - Abnormal : da co booking non-pending o ky           -> 409
 *   UTCID21 - Boundary : CFD < 80                                 -> 400
 *   UTCID22 - Abnormal : con hoa don chua thanh toan              -> 400
 *   UTCID23 - Abnormal : khong tim thay phong                     -> 404
 *   UTCID24 - Abnormal : phong dang bao tri                       -> 400
 *   UTCID25 - Boundary : bedNumber > capacity                     -> 400
 *   UTCID26 - Abnormal : phong da du nguoi                        -> 409
 *   UTCID27 - Abnormal : giuong da co nguoi dat                   -> 409
 *   UTCID28 - Abnormal : chua co cau hinh gia active              -> 400
 *   UTCID29 - Abnormal : gia phong trong cau hinh khong hop le    -> 400
 *   UTCID30 - Normal   : dat phong thanh cong                     -> 201 + tao invoice
 *   UTCID31 - Abnormal : trung giuong khi create (E11000 bed)     -> 409
 *   UTCID32 - Normal   : co booking pending cu -> release + tao moi-> 201
 *
 * ===== BOOKING_AVAILABLE_ROOMS - getAvailableRooms =====
 *   UTCID33 - Abnormal : buildingId khong hop le                  -> 400
 *   UTCID34 - Abnormal : khong tim thay toa nha                   -> 404
 *   UTCID35 - Abnormal : khong co ky tiep theo                    -> 404
 *   UTCID36 - Abnormal : floor khong hop le                       -> 400
 *   UTCID37 - Normal   : tra danh sach phong con giuong trong     -> 200
 *
 * ===== BOOKING_BED_AVAILABILITY - getRoomBedAvailability =====
 *   UTCID38 - Abnormal : roomId khong hop le                      -> 400
 *   UTCID39 - Abnormal : khong co ky tiep theo                    -> 404
 *   UTCID40 - Abnormal : khong tim thay phong                     -> 404
 *   UTCID41 - Normal   : tra tinh trang giuong                    -> 200
 *
 * ===== BOOKING_MY - getMyBooking / getMyHistory =====
 *   UTCID42 - Normal   : chua co booking                          -> 200 data null
 *   UTCID43 - Normal   : co booking, lay bedNumber tu room        -> 200
 *   UTCID44 - Normal   : lay lich su dat phong                    -> 200
 *
 * ===== BOOKING_ROOM_HISTORY - getRoomHistory =====
 *   UTCID45 - Abnormal : roomId khong hop le                      -> 400
 *   UTCID46 - Normal   : phan loai ky truoc / ky toi              -> 200
 *
 * ===== BOOKING_ALL - getAllBookings =====
 *   UTCID47 - Abnormal : roomId filter khong hop le               -> 400
 *   UTCID48 - Normal   : loc theo studentCode                     -> 200
 *
 * ===== BOOKING_ROOMMATES - getRoommates =====
 *   UTCID49 - Abnormal : thieu roomId / semester                  -> 400
 *   UTCID50 - Normal   : tra danh sach ban cung phong             -> 200
 *
 * ===== BOOKING_ELIGIBILITY_EXT - checkBookingEligibility (bo sung) =====
 *   UTCID51 - Abnormal : khong co ky hien tai                     -> 400 booking_time_not_configured
 *   UTCID52 - Boundary : hom nay = ngay bat dau = ngay ket thuc   -> 200 eligible
 *   UTCID53 - Abnormal : isRenew nhung chua cau hinh gia han      -> 400 message "gia hạn"
 *   UTCID54 - Abnormal : isRenew ngoai khung gia han              -> 400 booking_closed "gia hạn"
 *   UTCID55 - Abnormal : dang o phong nhung khong co entry giuong -> 400 khong kem so giuong
 *   UTCID56 - Boundary : CFDScore undefined (coi nhu 0)           -> 400 low_cfd
 *   UTCID57 - Boundary : hoa don amount undefined (coi nhu 0)     -> 200 eligible
 *
 * ===== BOOKING_CREATE_EXT - createBooking (bo sung) =====
 *   UTCID58 - Boundary : bedNumber = 0 (< 1)                      -> 400
 *   UTCID59 - Boundary : bedNumber = capacity                     -> 201
 *   UTCID60 - Normal   : bedNumber la chuoi so "2"                -> 201 parse thanh 2
 *   UTCID61 - Normal   : renew (renewedFrom) du dang o phong      -> 201 + payload co renewedFrom
 *   UTCID62 - Abnormal : E11000 trung studentId+semester          -> 409 da co booking
 *   UTCID63 - Abnormal : E11000 keyPattern khac                   -> 409 du lieu trung
 *   UTCID64 - Abnormal : loi khac (khong phai E11000)             -> throw ra ngoai
 *   UTCID65 - Boundary : roomPrice = 0 (hop le)                   -> 201 price = 0
 *   UTCID66 - Abnormal : roomPrice khong phai so                  -> 400
 *   UTCID67 - Normal   : paymentExpiresAt ~ 5 phut, dueDate khop  -> 201
 *
 * ===== BOOKING_AVAILABLE_ROOMS_EXT - getAvailableRooms (bo sung) =====
 *   UTCID68 - Normal   : floor hop le -> query co floor           -> 200
 *   UTCID69 - Abnormal : floor = "1.5" (khong nguyen)             -> 400
 *   UTCID70 - Normal   : phong full giuong bi loai khoi ket qua   -> 200
 *   UTCID71 - Normal   : khong co phong -> data rong, khong query bed -> 200
 *
 * ===== BOOKING_BED_AVAILABILITY_EXT =====
 *   UTCID72 - Normal   : tat ca giuong trong                      -> 200 available het
 *
 * ===== BOOKING_MY_EXT =====
 *   UTCID73 - Normal   : room khong co entry cua sinh vien -> fallback bedNumber booking
 *
 * ===== BOOKING_ROOM_HISTORY_EXT =====
 *   UTCID74 - Normal   : booking ky hien tai khong vao history/upcoming
 *   UTCID75 - Normal   : studentId null -> fullName "N/A"
 *
 * ===== BOOKING_ALL_EXT =====
 *   UTCID76 - Normal   : loc theo status + semester + roomId hop le
 *   UTCID77 - Normal   : khong filter -> query rong
 */

// ---- Mock dependencies BEFORE require service ----
jest.mock("../src/repositories/booking.repository");
jest.mock("../src/repositories/systemConfig.repository");
jest.mock("../src/services/semester.service");
jest.mock("../src/models/invoice.model");

const bookingRepository = require("../src/repositories/booking.repository");
const systemConfigRepository = require("../src/repositories/systemConfig.repository");
const semesterService = require("../src/services/semester.service");
const Invoice = require("../src/models/invoice.model");

const bookingService = require("../src/services/booking.service");

// A valid 24-hex ObjectId string for tests that need mongoose validation to pass
const VALID_ROOM_ID = "507f1f77bcf86cd799439011";
const STUDENT_ID = "507f191e810c19729de860ea";

// Return "today" (UTC) so booking window tests are date-independent
const todayUTC = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

// Build a semester object whose booking window always contains "today"
const buildOpenSemester = () => {
  const now = new Date();
  const past = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const future = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return {
    name: "Fall",
    year: 2026,
    startDate: new Date("2026-09-01"),
    endDate: new Date("2027-01-01"),
    bookingStartDate: past,
    bookingEndDate: future,
    renewalStartDate: past,
    renewalEndDate: future,
  };
};

const NEXT_SEMESTER_TEXT = "Fall 2026";

beforeEach(() => {
  jest.clearAllMocks();

  // Sensible defaults; individual tests override as needed
  semesterService.getCurrentSemester.mockResolvedValue(buildOpenSemester());
  semesterService.getNextSemester.mockResolvedValue({
    name: "Fall",
    year: 2026,
    startDate: new Date("2026-09-01"),
    endDate: new Date("2027-01-01"),
  });
});

// =====================================================================
// BOOKING_ELIGIBILITY - checkBookingEligibility
// =====================================================================
describe("BOOKING_ELIGIBILITY - checkBookingEligibility", () => {
  const eligibleStudent = { _id: STUDENT_ID, role: "student", CFDScore: 90 };

  const setupEligibleDefaults = () => {
    bookingRepository.findStudentById.mockResolvedValue(eligibleStudent);
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue(null);
    bookingRepository.findActiveBookingByStudentAndSemester.mockResolvedValue(
      null,
    );
    bookingRepository.findUnpaidInvoicesByStudent.mockResolvedValue([]);
  };

  // UTCID01 - Abnormal
  test("UTCID01: khong co studentId -> 401", async () => {
    const result = await bookingService.checkBookingEligibility(null);
    expect(result.statusCode).toBe(401);
    expect(result.response.eligible).toBe(false);
  });

  // UTCID02 - Abnormal
  test("UTCID02: khong tim thay sinh vien -> 404", async () => {
    bookingRepository.findStudentById.mockResolvedValue(null);
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(404);
    expect(result.response.eligible).toBe(false);
  });

  // UTCID03 - Abnormal
  test("UTCID03: role khong phai student -> 404", async () => {
    bookingRepository.findStudentById.mockResolvedValue({
      _id: STUDENT_ID,
      role: "manager",
    });
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(404);
  });

  // UTCID04 - Abnormal
  test("UTCID04: khong co ky tiep theo -> 404 next_semester_not_found", async () => {
    bookingRepository.findStudentById.mockResolvedValue(eligibleStudent);
    semesterService.getNextSemester.mockResolvedValue(null);
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(404);
    expect(result.response.reason).toBe("next_semester_not_found");
  });

  // UTCID05 - Abnormal
  test("UTCID05: ky chua cau hinh thoi gian dat -> 400 booking_time_not_configured", async () => {
    bookingRepository.findStudentById.mockResolvedValue(eligibleStudent);
    semesterService.getCurrentSemester.mockResolvedValue({
      name: "Summer",
      year: 2026,
      bookingStartDate: null,
      bookingEndDate: null,
    });
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(400);
    expect(result.response.reason).toBe("booking_time_not_configured");
  });

  // UTCID06 - Abnormal
  test("UTCID06: ngoai khoang thoi gian dat phong -> 400 booking_closed", async () => {
    bookingRepository.findStudentById.mockResolvedValue(eligibleStudent);
    const closedSemester = buildOpenSemester();
    // window fully in the past
    closedSemester.bookingStartDate = new Date("2020-01-01");
    closedSemester.bookingEndDate = new Date("2020-01-07");
    semesterService.getCurrentSemester.mockResolvedValue(closedSemester);
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(400);
    expect(result.response.reason).toBe("booking_closed");
  });

  // UTCID07 - Abnormal
  test("UTCID07: da o trong phong (dat moi) -> 400 already_in_room", async () => {
    bookingRepository.findStudentById.mockResolvedValue(eligibleStudent);
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue({
      displayName: "A101",
      students: [{ student: STUDENT_ID, bedNumber: 2 }],
    });
    const result = await bookingService.checkBookingEligibility(
      STUDENT_ID,
      false,
    );
    expect(result.statusCode).toBe(400);
    expect(result.response.reason).toBe("already_in_room");
    expect(result.response.message).toContain("A101");
  });

  // UTCID08 - Abnormal
  test("UTCID08: da co booking active o ky tiep theo -> 409 has_active_booking", async () => {
    bookingRepository.findStudentById.mockResolvedValue(eligibleStudent);
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue(null);
    bookingRepository.findActiveBookingByStudentAndSemester.mockResolvedValue({
      status: "confirmed",
      semester: NEXT_SEMESTER_TEXT,
    });
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(409);
    expect(result.response.reason).toBe("has_active_booking");
  });

  // UTCID09 - Boundary (CFD = 79 < 80)
  test("UTCID09: CFD = 79 -> 400 low_cfd", async () => {
    setupEligibleDefaults();
    bookingRepository.findStudentById.mockResolvedValue({
      _id: STUDENT_ID,
      role: "student",
      CFDScore: 79,
    });
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(400);
    expect(result.response.reason).toBe("low_cfd");
  });

  // UTCID10 - Abnormal
  test("UTCID10: con hoa don chua thanh toan -> 400 unpaid_invoice", async () => {
    setupEligibleDefaults();
    bookingRepository.findUnpaidInvoicesByStudent.mockResolvedValue([
      { amount: 500000 },
      { amount: 200000 },
    ]);
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(400);
    expect(result.response.reason).toBe("unpaid_invoice");
    expect(result.response.message).toContain("700.000");
  });

  // UTCID11 - Normal (CFD boundary = 80 passes)
  test("UTCID11: du dieu kien, CFD = 80 -> 200 eligible", async () => {
    setupEligibleDefaults();
    bookingRepository.findStudentById.mockResolvedValue({
      _id: STUDENT_ID,
      role: "student",
      CFDScore: 80,
    });
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.eligible).toBe(true);
    expect(result.response.data.nextSemester).toBe(NEXT_SEMESTER_TEXT);
  });

  // UTCID12 - Normal (renew flow ignores existing room)
  test("UTCID12: gia han (isRenew) van du dieu kien du dang o phong -> 200", async () => {
    bookingRepository.findStudentById.mockResolvedValue(eligibleStudent);
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue({
      displayName: "A101",
      students: [{ student: STUDENT_ID, bedNumber: 1 }],
    });
    bookingRepository.findActiveBookingByStudentAndSemester.mockResolvedValue(
      null,
    );
    bookingRepository.findUnpaidInvoicesByStudent.mockResolvedValue([]);
    const result = await bookingService.checkBookingEligibility(
      STUDENT_ID,
      true,
    );
    expect(result.statusCode).toBe(200);
    expect(result.response.eligible).toBe(true);
  });
});

// =====================================================================
// BOOKING_CREATE - createBooking
// =====================================================================
describe("BOOKING_CREATE - createBooking", () => {
  const okStudent = { _id: STUDENT_ID, role: "student", CFDScore: 90 };
  const okRoom = { _id: VALID_ROOM_ID, capacity: 4, status: "available" };
  const activeConfig = {
    _id: "config-1",
    name: "Cau hinh 2026",
    roomPrice: 1500000,
  };

  const setupHappyPath = () => {
    bookingRepository.findStudentById.mockResolvedValue(okStudent);
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue(null);
    bookingRepository.findActiveBookingByStudentAndSemester.mockResolvedValue(
      null,
    );
    bookingRepository.findUnpaidInvoicesByStudent.mockResolvedValue([]);
    bookingRepository.findRoomById.mockResolvedValue(okRoom);
    bookingRepository.countReservedBedsByRoomAndSemester.mockResolvedValue(0);
    bookingRepository.findReservedBed.mockResolvedValue(null);
    systemConfigRepository.findActive.mockResolvedValue(activeConfig);
    bookingRepository.createBooking.mockResolvedValue({
      _id: "booking-1",
      semester: NEXT_SEMESTER_TEXT,
      bedNumber: 1,
    });
    bookingRepository.findPopulatedRoomById.mockResolvedValue(okRoom);
    Invoice.create.mockResolvedValue({ _id: "invoice-1" });
  };

  // UTCID13 - Abnormal
  test("UTCID13: khong co studentId -> 401", async () => {
    const result = await bookingService.createBooking(null, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(401);
  });

  // UTCID14 - Abnormal
  test("UTCID14: thieu roomId hoac bedNumber -> 400", async () => {
    const r1 = await bookingService.createBooking(STUDENT_ID, null, 1);
    expect(r1.statusCode).toBe(400);

    const r2 = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, "");
    expect(r2.statusCode).toBe(400);
  });

  // UTCID15 - Abnormal
  test("UTCID15: roomId khong hop le -> 400", async () => {
    const result = await bookingService.createBooking(
      STUDENT_ID,
      "not-an-objectid",
      1,
    );
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("roomId");
  });

  // UTCID16 - Abnormal
  test("UTCID16: bedNumber khong phai so nguyen -> 400", async () => {
    const result = await bookingService.createBooking(
      STUDENT_ID,
      VALID_ROOM_ID,
      "abc",
    );
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("Số giường");
  });

  // UTCID17 - Abnormal
  test("UTCID17: khong co ky tiep theo -> 404", async () => {
    semesterService.getNextSemester.mockResolvedValue(null);
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(404);
  });

  // UTCID18 - Abnormal
  test("UTCID18: khong tim thay sinh vien -> 404", async () => {
    bookingRepository.findStudentById.mockResolvedValue(null);
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(404);
  });

  // UTCID19 - Abnormal
  test("UTCID19: da o trong phong (khong renew) -> 400", async () => {
    bookingRepository.findStudentById.mockResolvedValue(okStudent);
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue({
      displayName: "B202",
    });
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("B202");
  });

  // UTCID20 - Abnormal
  test("UTCID20: da co booking non-pending o ky -> 409", async () => {
    bookingRepository.findStudentById.mockResolvedValue(okStudent);
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue(null);
    bookingRepository.findActiveBookingByStudentAndSemester.mockResolvedValue({
      status: "confirmed",
    });
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(409);
  });

  // UTCID21 - Boundary
  test("UTCID21: CFD < 80 -> 400", async () => {
    bookingRepository.findStudentById.mockResolvedValue({
      _id: STUDENT_ID,
      role: "student",
      CFDScore: 79,
    });
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue(null);
    bookingRepository.findActiveBookingByStudentAndSemester.mockResolvedValue(
      null,
    );
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("CFD");
  });

  // UTCID22 - Abnormal
  test("UTCID22: con hoa don chua thanh toan -> 400", async () => {
    bookingRepository.findStudentById.mockResolvedValue(okStudent);
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue(null);
    bookingRepository.findActiveBookingByStudentAndSemester.mockResolvedValue(
      null,
    );
    bookingRepository.findUnpaidInvoicesByStudent.mockResolvedValue([
      { amount: 100000 },
    ]);
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("hóa đơn");
  });

  // UTCID23 - Abnormal
  test("UTCID23: khong tim thay phong -> 404", async () => {
    setupHappyPath();
    bookingRepository.findRoomById.mockResolvedValue(null);
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(404);
    expect(result.response.message).toContain("phòng");
  });

  // UTCID24 - Abnormal
  test("UTCID24: phong dang bao tri -> 400", async () => {
    setupHappyPath();
    bookingRepository.findRoomById.mockResolvedValue({
      _id: VALID_ROOM_ID,
      capacity: 4,
      status: "maintenance",
    });
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("bảo trì");
  });

  // UTCID25 - Boundary
  test("UTCID25: bedNumber > capacity -> 400", async () => {
    setupHappyPath();
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 5);
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("Số giường không hợp lệ");
  });

  // UTCID26 - Abnormal
  test("UTCID26: phong da du nguoi -> 409", async () => {
    setupHappyPath();
    bookingRepository.countReservedBedsByRoomAndSemester.mockResolvedValue(4);
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(409);
    expect(result.response.message).toContain("đủ người");
  });

  // UTCID27 - Abnormal
  test("UTCID27: giuong da co nguoi dat -> 409", async () => {
    setupHappyPath();
    bookingRepository.findReservedBed.mockResolvedValue({ bedNumber: 1 });
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(409);
    expect(result.response.message).toContain("đã có sinh viên đặt");
  });

  // UTCID28 - Abnormal
  test("UTCID28: chua co cau hinh gia active -> 400", async () => {
    setupHappyPath();
    systemConfigRepository.findActive.mockResolvedValue(null);
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("cấu hình giá");
  });

  // UTCID29 - Abnormal
  test("UTCID29: gia phong trong cau hinh khong hop le -> 400", async () => {
    setupHappyPath();
    systemConfigRepository.findActive.mockResolvedValue({
      _id: "config-1",
      name: "Bad",
      roomPrice: -1,
    });
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("không hợp lệ");
  });

  // UTCID30 - Normal
  test("UTCID30: dat phong thanh cong -> 201 + tao invoice", async () => {
    setupHappyPath();
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(201);
    expect(result.response.success).toBe(true);
    expect(bookingRepository.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: STUDENT_ID,
        roomId: VALID_ROOM_ID,
        bedNumber: 1,
        semester: NEXT_SEMESTER_TEXT,
        status: "pending",
      }),
    );
    expect(Invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: "booking-1",
        type: "room_fee",
        amount: 1500000,
        status: "unpaid",
      }),
    );
    expect(result.response.data.price).toBe(1500000);
  });

  // UTCID31 - Abnormal (race condition duplicate bed)
  test("UTCID31: trung giuong khi create (E11000 bed) -> 409", async () => {
    setupHappyPath();
    const dupErr = new Error("dup");
    dupErr.code = 11000;
    dupErr.keyPattern = { roomId: 1, semester: 1, bedNumber: 1 };
    bookingRepository.createBooking.mockRejectedValue(dupErr);
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1);
    expect(result.statusCode).toBe(409);
    expect(result.response.message).toContain("vừa được sinh viên khác đặt");
  });

  // UTCID32 - Normal (release old pending, then create new)
  test("UTCID32: co booking pending cu -> release roi tao moi -> 201", async () => {
    setupHappyPath();
    bookingRepository.findActiveBookingByStudentAndSemester.mockResolvedValue({
      status: "pending",
    });
    bookingRepository.releasePendingBookingsByStudentAndSemester.mockResolvedValue(
      { deletedCount: 1 },
    );
    const result = await bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 2);
    expect(
      bookingRepository.releasePendingBookingsByStudentAndSemester,
    ).toHaveBeenCalledWith(STUDENT_ID, NEXT_SEMESTER_TEXT);
    expect(result.statusCode).toBe(201);
  });
});

// =====================================================================
// BOOKING_AVAILABLE_ROOMS - getAvailableRooms
// =====================================================================
describe("BOOKING_AVAILABLE_ROOMS - getAvailableRooms", () => {
  // UTCID33 - Abnormal
  test("UTCID33: buildingId khong hop le -> 400", async () => {
    const result = await bookingService.getAvailableRooms("bad-id");
    expect(result.statusCode).toBe(400);
  });

  // UTCID34 - Abnormal
  test("UTCID34: khong tim thay toa nha -> 404", async () => {
    bookingRepository.findBuildingById.mockResolvedValue(null);
    const result = await bookingService.getAvailableRooms(VALID_ROOM_ID);
    expect(result.statusCode).toBe(404);
  });

  // UTCID35 - Abnormal
  test("UTCID35: khong co ky tiep theo -> 404", async () => {
    bookingRepository.findBuildingById.mockResolvedValue({ _id: VALID_ROOM_ID });
    semesterService.getNextSemester.mockResolvedValue(null);
    const result = await bookingService.getAvailableRooms(VALID_ROOM_ID);
    expect(result.statusCode).toBe(404);
  });

  // UTCID36 - Abnormal
  test("UTCID36: floor khong hop le -> 400", async () => {
    bookingRepository.findBuildingById.mockResolvedValue({ _id: VALID_ROOM_ID });
    const result = await bookingService.getAvailableRooms(VALID_ROOM_ID, "0");
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("Tầng");
  });

  // UTCID37 - Normal
  test("UTCID37: tra danh sach phong con giuong trong -> 200", async () => {
    bookingRepository.findBuildingById.mockResolvedValue({ _id: VALID_ROOM_ID });
    bookingRepository.findAvailableRooms.mockResolvedValue([
      { _id: "room-1", capacity: 2, roomNumber: "101" },
    ]);
    // bed 1 reserved, bed 2 free -> room still available
    bookingRepository.findReservedBedsByRoomsAndSemester.mockResolvedValue([
      { roomId: "room-1", bedNumber: 1, status: "confirmed" },
    ]);
    const result = await bookingService.getAvailableRooms(VALID_ROOM_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.data).toHaveLength(1);
    expect(result.response.data[0].availableCount).toBe(1);
    expect(result.response.data[0].availableBeds).toEqual([2]);
    expect(result.response.totalAvailable).toBe(1);
  });
});

// =====================================================================
// BOOKING_BED_AVAILABILITY - getRoomBedAvailability
// =====================================================================
describe("BOOKING_BED_AVAILABILITY - getRoomBedAvailability", () => {
  // UTCID38 - Abnormal
  test("UTCID38: roomId khong hop le -> 400", async () => {
    const result = await bookingService.getRoomBedAvailability("bad-id");
    expect(result.statusCode).toBe(400);
  });

  // UTCID39 - Abnormal
  test("UTCID39: khong co ky tiep theo -> 404", async () => {
    semesterService.getNextSemester.mockResolvedValue(null);
    bookingRepository.findRoomById.mockResolvedValue({ _id: VALID_ROOM_ID });
    const result = await bookingService.getRoomBedAvailability(VALID_ROOM_ID);
    expect(result.statusCode).toBe(404);
  });

  // UTCID40 - Abnormal
  test("UTCID40: khong tim thay phong -> 404", async () => {
    bookingRepository.findRoomById.mockResolvedValue(null);
    const result = await bookingService.getRoomBedAvailability(VALID_ROOM_ID);
    expect(result.statusCode).toBe(404);
  });

  // UTCID41 - Normal
  test("UTCID41: tra tinh trang giuong -> 200", async () => {
    bookingRepository.findRoomById.mockResolvedValue({
      _id: VALID_ROOM_ID,
      roomNumber: "101",
      capacity: 3,
    });
    bookingRepository.findReservedBedsByRoomAndSemester.mockResolvedValue([
      { bedNumber: 2, status: "confirmed" },
    ]);
    const result = await bookingService.getRoomBedAvailability(VALID_ROOM_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.data.capacity).toBe(3);
    expect(result.response.data.availableCount).toBe(2);
    expect(result.response.data.reservedCount).toBe(1);
    expect(result.response.data.beds[1]).toMatchObject({
      bedNumber: 2,
      available: false,
      status: "reserved",
    });
  });
});

// =====================================================================
// BOOKING_MY - getMyBooking / getMyHistory
// =====================================================================
describe("BOOKING_MY - getMyBooking / getMyHistory", () => {
  // UTCID42 - Normal
  test("UTCID42: chua co booking -> 200 data null", async () => {
    bookingRepository.findCurrentBookingByStudent.mockResolvedValue(null);
    const result = await bookingService.getMyBooking(STUDENT_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.data).toBeNull();
  });

  // UTCID43 - Normal
  test("UTCID43: co booking, lay bedNumber tu room -> 200", async () => {
    bookingRepository.findCurrentBookingByStudent.mockResolvedValue({
      bedNumber: 1,
      roomId: {
        students: [{ student: { _id: STUDENT_ID }, bedNumber: 3 }],
      },
      toObject() {
        return { bedNumber: 1, semester: NEXT_SEMESTER_TEXT };
      },
    });
    const result = await bookingService.getMyBooking(STUDENT_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.data.myBedNumber).toBe(3);
  });

  // UTCID44 - Normal
  test("UTCID44: lay lich su dat phong -> 200", async () => {
    bookingRepository.findMyBookingHistory.mockResolvedValue([
      { _id: "b1" },
      { _id: "b2" },
    ]);
    const result = await bookingService.getMyHistory(STUDENT_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.data).toHaveLength(2);
  });
});

// =====================================================================
// BOOKING_ROOM_HISTORY - getRoomHistory
// =====================================================================
describe("BOOKING_ROOM_HISTORY - getRoomHistory", () => {
  // UTCID45 - Abnormal
  test("UTCID45: roomId khong hop le -> 400", async () => {
    const result = await bookingService.getRoomHistory("bad-id");
    expect(result.statusCode).toBe(400);
  });

  // UTCID46 - Normal
  test("UTCID46: phan loai ky truoc / ky toi -> 200", async () => {
    // current = Fall 2026, next = Spring 2027
    semesterService.getCurrentSemester.mockResolvedValue({
      name: "Fall",
      year: 2026,
    });
    semesterService.getNextSemester.mockResolvedValue({
      name: "Spring",
      year: 2027,
    });
    bookingRepository.findRoomBookingHistory.mockResolvedValue([
      {
        semester: "Summer 2026", // history (before Fall 2026)
        bedNumber: 1,
        status: "checked_out",
        studentId: { _id: "s1", fullName: "A" },
      },
      {
        semester: "Spring 2027", // next/upcoming
        bedNumber: 2,
        status: "confirmed",
        studentId: { _id: "s2", fullName: "B" },
      },
    ]);
    const result = await bookingService.getRoomHistory(VALID_ROOM_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.history).toHaveLength(1);
    expect(result.response.history[0].semester).toBe("Summer 2026");
    expect(result.response.upcoming).toHaveLength(1);
    expect(result.response.upcoming[0].fullName).toBe("B");
  });
});

// =====================================================================
// BOOKING_ALL - getAllBookings
// =====================================================================
describe("BOOKING_ALL - getAllBookings", () => {
  // UTCID47 - Abnormal
  test("UTCID47: roomId filter khong hop le -> 400", async () => {
    const result = await bookingService.getAllBookings({ roomId: "bad-id" });
    expect(result.statusCode).toBe(400);
  });

  // UTCID48 - Normal
  test("UTCID48: loc theo studentCode -> 200", async () => {
    bookingRepository.findStudentsByStudentCode.mockResolvedValue([
      { _id: "s1" },
    ]);
    bookingRepository.findAllBookings.mockResolvedValue([{ _id: "b1" }]);
    const result = await bookingService.getAllBookings({ studentCode: "HE12" });
    expect(result.statusCode).toBe(200);
    expect(bookingRepository.findStudentsByStudentCode).toHaveBeenCalledWith(
      "HE12",
    );
    expect(bookingRepository.findAllBookings).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: { $in: ["s1"] } }),
    );
    expect(result.response.total).toBe(1);
  });
});

// =====================================================================
// BOOKING_ROOMMATES - getRoommates
// =====================================================================
describe("BOOKING_ROOMMATES - getRoommates", () => {
  // UTCID49 - Abnormal
  test("UTCID49: thieu roomId hoac semester -> 400", async () => {
    const r1 = await bookingService.getRoommates(null, NEXT_SEMESTER_TEXT);
    expect(r1.statusCode).toBe(400);
    const r2 = await bookingService.getRoommates(VALID_ROOM_ID, null);
    expect(r2.statusCode).toBe(400);
  });

  // UTCID50 - Normal
  test("UTCID50: tra danh sach ban cung phong -> 200", async () => {
    bookingRepository.findRoommatesByRoomAndSemester.mockResolvedValue([
      { bedNumber: 1, studentId: { _id: "s1", fullName: "A" } },
      { bedNumber: 2, studentId: null }, // filtered out (not populated)
    ]);
    const result = await bookingService.getRoommates(
      VALID_ROOM_ID,
      NEXT_SEMESTER_TEXT,
    );
    expect(result.statusCode).toBe(200);
    expect(result.response.data).toHaveLength(1);
    expect(result.response.data[0]).toMatchObject({
      bedNumber: 1,
      student: { _id: "s1", fullName: "A" },
    });
  });
});

// =====================================================================
// BOOKING_ELIGIBILITY_EXT - checkBookingEligibility (bo sung)
// =====================================================================
describe("BOOKING_ELIGIBILITY_EXT - checkBookingEligibility (bo sung)", () => {
  const eligibleStudent = { _id: STUDENT_ID, role: "student", CFDScore: 90 };

  const setupEligibleDefaults = () => {
    bookingRepository.findStudentById.mockResolvedValue(eligibleStudent);
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue(null);
    bookingRepository.findActiveBookingByStudentAndSemester.mockResolvedValue(
      null,
    );
    bookingRepository.findUnpaidInvoicesByStudent.mockResolvedValue([]);
  };

  // UTCID51 - Abnormal (current semester null -> optional chaining -> not configured)
  test("UTCID51: khong co ky hien tai -> 400 booking_time_not_configured", async () => {
    setupEligibleDefaults();
    semesterService.getCurrentSemester.mockResolvedValue(null);
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(400);
    expect(result.response.reason).toBe("booking_time_not_configured");
  });

  // UTCID52 - Boundary (today == start == end still inside window)
  test("UTCID52: hom nay = ngay bat dau = ngay ket thuc -> 200 eligible", async () => {
    setupEligibleDefaults();
    const now = new Date();
    const semester = buildOpenSemester();
    semester.bookingStartDate = now;
    semester.bookingEndDate = now;
    semesterService.getCurrentSemester.mockResolvedValue(semester);
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.eligible).toBe(true);
  });

  // UTCID53 - Abnormal (renew flow but renewal window not configured)
  test("UTCID53: isRenew nhung chua cau hinh gia han -> 400 message 'gia hạn'", async () => {
    setupEligibleDefaults();
    const semester = buildOpenSemester();
    semester.renewalStartDate = null;
    semester.renewalEndDate = null;
    semesterService.getCurrentSemester.mockResolvedValue(semester);
    const result = await bookingService.checkBookingEligibility(
      STUDENT_ID,
      true,
    );
    expect(result.statusCode).toBe(400);
    expect(result.response.reason).toBe("booking_time_not_configured");
    expect(result.response.message).toContain("gia hạn");
  });

  // UTCID54 - Abnormal (renew flow outside renewal window)
  test("UTCID54: isRenew ngoai khung gia han -> 400 booking_closed 'gia hạn'", async () => {
    setupEligibleDefaults();
    const semester = buildOpenSemester();
    semester.renewalStartDate = new Date("2020-01-01");
    semester.renewalEndDate = new Date("2020-01-07");
    semesterService.getCurrentSemester.mockResolvedValue(semester);
    const result = await bookingService.checkBookingEligibility(
      STUDENT_ID,
      true,
    );
    expect(result.statusCode).toBe(400);
    expect(result.response.reason).toBe("booking_closed");
    expect(result.response.message).toContain("gia hạn");
  });

  // UTCID55 - Abnormal (in a room but bed entry missing -> message without bed number)
  test("UTCID55: dang o phong nhung khong tim thay entry giuong -> 400 khong kem so giuong", async () => {
    setupEligibleDefaults();
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue({
      displayName: "C303",
      students: [{ student: "someone-else", bedNumber: 4 }],
    });
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(400);
    expect(result.response.reason).toBe("already_in_room");
    expect(result.response.message).toContain("C303");
    expect(result.response.message).not.toContain("Giường");
  });

  // UTCID56 - Boundary (CFDScore undefined treated as 0)
  test("UTCID56: CFDScore undefined -> 400 low_cfd", async () => {
    setupEligibleDefaults();
    bookingRepository.findStudentById.mockResolvedValue({
      _id: STUDENT_ID,
      role: "student",
    });
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(400);
    expect(result.response.reason).toBe("low_cfd");
    expect(result.response.message).toContain("0");
  });

  // UTCID57 - Boundary (invoice amount undefined treated as 0 -> still eligible)
  test("UTCID57: hoa don amount undefined -> tong no = 0 -> 200 eligible", async () => {
    setupEligibleDefaults();
    bookingRepository.findUnpaidInvoicesByStudent.mockResolvedValue([
      { _id: "inv-1" }, // no amount field
    ]);
    const result = await bookingService.checkBookingEligibility(STUDENT_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.eligible).toBe(true);
  });
});

// =====================================================================
// BOOKING_CREATE_EXT - createBooking (bo sung)
// =====================================================================
describe("BOOKING_CREATE_EXT - createBooking (bo sung)", () => {
  const okStudent = { _id: STUDENT_ID, role: "student", CFDScore: 90 };
  const okRoom = { _id: VALID_ROOM_ID, capacity: 4, status: "available" };
  const activeConfig = {
    _id: "config-1",
    name: "Cau hinh 2026",
    roomPrice: 1500000,
  };

  const setupHappyPath = () => {
    bookingRepository.findStudentById.mockResolvedValue(okStudent);
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue(null);
    bookingRepository.findActiveBookingByStudentAndSemester.mockResolvedValue(
      null,
    );
    bookingRepository.findUnpaidInvoicesByStudent.mockResolvedValue([]);
    bookingRepository.findRoomById.mockResolvedValue(okRoom);
    bookingRepository.countReservedBedsByRoomAndSemester.mockResolvedValue(0);
    bookingRepository.findReservedBed.mockResolvedValue(null);
    systemConfigRepository.findActive.mockResolvedValue(activeConfig);
    bookingRepository.createBooking.mockResolvedValue({
      _id: "booking-1",
      semester: NEXT_SEMESTER_TEXT,
      bedNumber: 1,
    });
    bookingRepository.findPopulatedRoomById.mockResolvedValue(okRoom);
    Invoice.create.mockResolvedValue({ _id: "invoice-1" });
  };

  beforeEach(() => setupHappyPath());

  // UTCID58 - Boundary (bedNumber = 0 < 1)
  test("UTCID58: bedNumber = 0 -> 400", async () => {
    const result = await bookingService.createBooking(
      STUDENT_ID,
      VALID_ROOM_ID,
      0,
    );
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("Số giường không hợp lệ");
  });

  // UTCID59 - Boundary (bedNumber = capacity is valid)
  test("UTCID59: bedNumber = capacity (4) -> 201", async () => {
    const result = await bookingService.createBooking(
      STUDENT_ID,
      VALID_ROOM_ID,
      4,
    );
    expect(result.statusCode).toBe(201);
    expect(bookingRepository.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({ bedNumber: 4 }),
    );
  });

  // UTCID60 - Normal (numeric string bedNumber is parsed)
  test('UTCID60: bedNumber la chuoi so "2" -> 201, parse thanh 2', async () => {
    const result = await bookingService.createBooking(
      STUDENT_ID,
      VALID_ROOM_ID,
      "2",
    );
    expect(result.statusCode).toBe(201);
    expect(bookingRepository.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({ bedNumber: 2 }),
    );
  });

  // UTCID61 - Normal (renew skips the already-in-room check + payload has renewedFrom)
  test("UTCID61: renew (renewedFrom) du dang o phong -> 201 + payload co renewedFrom", async () => {
    bookingRepository.findCurrentRoomByStudent.mockResolvedValue({
      displayName: "A101",
    });
    const result = await bookingService.createBooking(
      STUDENT_ID,
      VALID_ROOM_ID,
      1,
      "old-booking-id",
    );
    expect(result.statusCode).toBe(201);
    expect(bookingRepository.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({ renewedFrom: "old-booking-id" }),
    );
  });

  // UTCID62 - Abnormal (E11000 duplicate studentId+semester)
  test("UTCID62: E11000 trung studentId+semester -> 409 da co booking", async () => {
    const dupErr = new Error("dup");
    dupErr.code = 11000;
    dupErr.keyPattern = { studentId: 1, semester: 1 };
    bookingRepository.createBooking.mockRejectedValue(dupErr);
    const result = await bookingService.createBooking(
      STUDENT_ID,
      VALID_ROOM_ID,
      1,
    );
    expect(result.statusCode).toBe(409);
    expect(result.response.message).toContain("đã có booking");
  });

  // UTCID63 - Abnormal (E11000 with unknown keyPattern)
  test("UTCID63: E11000 keyPattern khac -> 409 du lieu trung", async () => {
    const dupErr = new Error("dup");
    dupErr.code = 11000;
    dupErr.keyPattern = { other: 1 };
    bookingRepository.createBooking.mockRejectedValue(dupErr);
    const result = await bookingService.createBooking(
      STUDENT_ID,
      VALID_ROOM_ID,
      1,
    );
    expect(result.statusCode).toBe(409);
    expect(result.response.message).toContain("trùng");
  });

  // UTCID64 - Abnormal (non-duplicate error propagates)
  test("UTCID64: loi khac (khong phai E11000) -> throw ra ngoai", async () => {
    bookingRepository.createBooking.mockRejectedValue(new Error("db down"));
    await expect(
      bookingService.createBooking(STUDENT_ID, VALID_ROOM_ID, 1),
    ).rejects.toThrow("db down");
  });

  // UTCID65 - Boundary (roomPrice = 0 is accepted)
  test("UTCID65: roomPrice = 0 -> 201, price = 0", async () => {
    systemConfigRepository.findActive.mockResolvedValue({
      _id: "config-free",
      name: "Free",
      roomPrice: 0,
    });
    const result = await bookingService.createBooking(
      STUDENT_ID,
      VALID_ROOM_ID,
      1,
    );
    expect(result.statusCode).toBe(201);
    expect(result.response.data.price).toBe(0);
    expect(Invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 0 }),
    );
  });

  // UTCID66 - Abnormal (roomPrice not a number)
  test("UTCID66: roomPrice khong phai so -> 400", async () => {
    systemConfigRepository.findActive.mockResolvedValue({
      _id: "config-bad",
      name: "Bad",
      roomPrice: "abc",
    });
    const result = await bookingService.createBooking(
      STUDENT_ID,
      VALID_ROOM_ID,
      1,
    );
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("không hợp lệ");
  });

  // UTCID67 - Normal (hold time ~5 minutes, invoice dueDate matches expiry)
  test("UTCID67: paymentExpiresAt ~5 phut va dueDate = paymentExpiresAt -> 201", async () => {
    const before = Date.now();
    const result = await bookingService.createBooking(
      STUDENT_ID,
      VALID_ROOM_ID,
      1,
    );
    const after = Date.now();
    expect(result.statusCode).toBe(201);

    const expiresAt = result.response.data.paymentExpiresAt.getTime();
    expect(expiresAt).toBeGreaterThanOrEqual(before + 5 * 60 * 1000);
    expect(expiresAt).toBeLessThanOrEqual(after + 5 * 60 * 1000);

    const bookingPayload = bookingRepository.createBooking.mock.calls[0][0];
    const invoicePayload = Invoice.create.mock.calls[0][0];
    expect(invoicePayload.dueDate).toEqual(bookingPayload.paymentExpiresAt);
  });
});

// =====================================================================
// BOOKING_AVAILABLE_ROOMS_EXT - getAvailableRooms (bo sung)
// =====================================================================
describe("BOOKING_AVAILABLE_ROOMS_EXT - getAvailableRooms (bo sung)", () => {
  beforeEach(() => {
    bookingRepository.findBuildingById.mockResolvedValue({
      _id: VALID_ROOM_ID,
      name: "Toa A",
    });
    bookingRepository.findAvailableRooms.mockResolvedValue([]);
    bookingRepository.findReservedBedsByRoomsAndSemester.mockResolvedValue([]);
  });

  // UTCID68 - Normal (valid floor is added to the query)
  test("UTCID68: floor hop le -> query co floor -> 200", async () => {
    const result = await bookingService.getAvailableRooms(VALID_ROOM_ID, "2");
    expect(result.statusCode).toBe(200);
    expect(bookingRepository.findAvailableRooms).toHaveBeenCalledWith(
      expect.objectContaining({
        building: VALID_ROOM_ID,
        floor: 2,
        status: { $ne: "maintenance" },
      }),
    );
  });

  // UTCID69 - Abnormal (non-integer floor)
  test('UTCID69: floor = "1.5" -> 400', async () => {
    const result = await bookingService.getAvailableRooms(
      VALID_ROOM_ID,
      "1.5",
    );
    expect(result.statusCode).toBe(400);
    expect(result.response.message).toContain("Tầng");
  });

  // UTCID70 - Normal (fully-booked room filtered out)
  test("UTCID70: phong full giuong bi loai khoi ket qua -> 200", async () => {
    bookingRepository.findAvailableRooms.mockResolvedValue([
      { _id: "room-full", capacity: 2, roomNumber: "101" },
      { _id: "room-free", capacity: 2, roomNumber: "102" },
    ]);
    bookingRepository.findReservedBedsByRoomsAndSemester.mockResolvedValue([
      { roomId: "room-full", bedNumber: 1, status: "confirmed" },
      { roomId: "room-full", bedNumber: 2, status: "pending" },
    ]);
    const result = await bookingService.getAvailableRooms(VALID_ROOM_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.data).toHaveLength(1);
    expect(result.response.data[0]._id).toBe("room-free");
    expect(result.response.totalAvailable).toBe(1);
  });

  // UTCID71 - Normal (no rooms -> skip reserved-bed query)
  test("UTCID71: khong co phong -> data rong, khong query giuong -> 200", async () => {
    const result = await bookingService.getAvailableRooms(VALID_ROOM_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.data).toEqual([]);
    expect(
      bookingRepository.findReservedBedsByRoomsAndSemester,
    ).not.toHaveBeenCalled();
  });
});

// =====================================================================
// BOOKING_BED_AVAILABILITY_EXT - getRoomBedAvailability (bo sung)
// =====================================================================
describe("BOOKING_BED_AVAILABILITY_EXT - getRoomBedAvailability (bo sung)", () => {
  // UTCID72 - Normal (no reservations -> all beds available)
  test("UTCID72: tat ca giuong trong -> 200 available het", async () => {
    bookingRepository.findRoomById.mockResolvedValue({
      _id: VALID_ROOM_ID,
      roomNumber: "201",
      capacity: 4,
    });
    bookingRepository.findReservedBedsByRoomAndSemester.mockResolvedValue([]);
    const result = await bookingService.getRoomBedAvailability(VALID_ROOM_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.data.availableCount).toBe(4);
    expect(result.response.data.reservedCount).toBe(0);
    expect(result.response.data.beds.every((bed) => bed.available)).toBe(true);
  });
});

// =====================================================================
// BOOKING_MY_EXT - getMyBooking (bo sung)
// =====================================================================
describe("BOOKING_MY_EXT - getMyBooking (bo sung)", () => {
  // UTCID73 - Normal (student not in room.students -> keep booking.bedNumber)
  test("UTCID73: room khong co entry cua sinh vien -> fallback bedNumber cua booking", async () => {
    bookingRepository.findCurrentBookingByStudent.mockResolvedValue({
      bedNumber: 2,
      roomId: {
        students: [{ student: { _id: "someone-else" }, bedNumber: 1 }],
      },
      toObject() {
        return { bedNumber: 2, semester: NEXT_SEMESTER_TEXT };
      },
    });
    const result = await bookingService.getMyBooking(STUDENT_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.data.myBedNumber).toBe(2);
  });
});

// =====================================================================
// BOOKING_ROOM_HISTORY_EXT - getRoomHistory (bo sung)
// =====================================================================
describe("BOOKING_ROOM_HISTORY_EXT - getRoomHistory (bo sung)", () => {
  beforeEach(() => {
    semesterService.getCurrentSemester.mockResolvedValue({
      name: "Fall",
      year: 2026,
    });
    semesterService.getNextSemester.mockResolvedValue({
      name: "Spring",
      year: 2027,
    });
  });

  // UTCID74 - Normal (current-semester booking excluded from both groups)
  test("UTCID74: booking ky hien tai khong vao history/upcoming -> 200", async () => {
    bookingRepository.findRoomBookingHistory.mockResolvedValue([
      {
        semester: "Fall 2026", // current semester
        bedNumber: 1,
        status: "checked_in",
        studentId: { _id: "s1", fullName: "A" },
      },
    ]);
    const result = await bookingService.getRoomHistory(VALID_ROOM_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.history).toHaveLength(0);
    expect(result.response.upcoming).toHaveLength(0);
  });

  // UTCID75 - Normal (missing populated student -> N/A fallback)
  test("UTCID75: studentId null -> fullName 'N/A'", async () => {
    bookingRepository.findRoomBookingHistory.mockResolvedValue([
      {
        semester: "Summer 2026", // past semester
        bedNumber: 3,
        status: "checked_out",
        studentId: null,
      },
    ]);
    const result = await bookingService.getRoomHistory(VALID_ROOM_ID);
    expect(result.statusCode).toBe(200);
    expect(result.response.history).toHaveLength(1);
    expect(result.response.history[0].students[0].fullName).toBe("N/A");
    expect(result.response.history[0].students[0].studentCode).toBe("N/A");
  });
});

// =====================================================================
// BOOKING_ALL_EXT - getAllBookings (bo sung)
// =====================================================================
describe("BOOKING_ALL_EXT - getAllBookings (bo sung)", () => {
  // UTCID76 - Normal (status + semester + valid roomId filters)
  test("UTCID76: loc theo status + semester + roomId hop le -> 200", async () => {
    bookingRepository.findAllBookings.mockResolvedValue([]);
    const result = await bookingService.getAllBookings({
      status: "confirmed",
      semester: NEXT_SEMESTER_TEXT,
      roomId: VALID_ROOM_ID,
    });
    expect(result.statusCode).toBe(200);
    expect(bookingRepository.findAllBookings).toHaveBeenCalledWith({
      status: "confirmed",
      semester: NEXT_SEMESTER_TEXT,
      roomId: VALID_ROOM_ID,
    });
  });

  // UTCID77 - Normal (no filters -> empty query)
  test("UTCID77: khong filter -> query rong -> 200", async () => {
    bookingRepository.findAllBookings.mockResolvedValue([{ _id: "b1" }]);
    const result = await bookingService.getAllBookings();
    expect(result.statusCode).toBe(200);
    expect(bookingRepository.findAllBookings).toHaveBeenCalledWith({});
    expect(result.response.total).toBe(1);
  });
});
