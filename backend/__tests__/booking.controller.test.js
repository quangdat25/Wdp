/**
 * Function Code : BOOKING_CTRL_*
 * Class        : Booking Controller (booking.controller.js)
 * Description  : Lop controller cua luong dat phong - map request -> service
 *                va xu ly loi tap trung qua handleService
 * Pre-Condition: bookingService duoc mock toan bo
 *
 * ===== BOOKING_CTRL_HANDLE - handleService (qua checkBookingEligibility) =====
 *   UTCID01 - Normal   : service tra ket qua -> res dung statusCode + response
 *   UTCID02 - Abnormal : service throw E11000  -> 409 giuong vua duoc dat
 *   UTCID03 - Abnormal : service throw error co status -> tra dung status + message
 *   UTCID04 - Abnormal : service throw error thuong -> 500 + fallback message
 *
 * ===== BOOKING_CTRL_MAP - truyen tham so dung =====
 *   UTCID05 - Normal   : checkBookingEligibility doc isRenew tu query ("true" -> true)
 *   UTCID06 - Normal   : checkBookingEligibility isRenew khac "true" -> false
 *   UTCID07 - Normal   : getAvailableRooms truyen buildingId + floor
 *   UTCID08 - Normal   : getRoomBedAvailability truyen roomId tu params
 *   UTCID09 - Normal   : createBooking truyen userId + body (roomId, bedNumber, renewedFrom)
 *   UTCID10 - Normal   : createBooking khong co req.user -> truyen undefined
 *   UTCID11 - Normal   : getMyBooking truyen userId
 *   UTCID12 - Normal   : getMyHistory truyen userId
 *   UTCID13 - Normal   : getRoomHistory truyen roomId tu params
 *   UTCID14 - Normal   : getAllBookings truyen query filters
 *   UTCID15 - Normal   : getRoommates truyen roomId + semester
 */

// ---- Mock service BEFORE require controller ----
jest.mock("../src/services/booking.service");

const bookingService = require("../src/services/booking.service");
const bookingController = require("../src/controllers/booking.controller");

const STUDENT_ID = "507f191e810c19729de860ea";
const ROOM_ID = "507f1f77bcf86cd799439011";
const BUILDING_ID = "507f1f77bcf86cd799439012";

// Helper: build fake res object
const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const buildReq = (overrides = {}) => ({
  user: { _id: STUDENT_ID },
  params: {},
  query: {},
  body: {},
  ...overrides,
});

const OK_RESULT = {
  statusCode: 200,
  response: { success: true },
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

// =====================================================================
// BOOKING_CTRL_HANDLE - handleService
// =====================================================================
describe("BOOKING_CTRL_HANDLE - handleService", () => {
  // UTCID01 - Normal
  test("UTCID01: service tra ket qua -> res dung statusCode + response", async () => {
    bookingService.checkBookingEligibility.mockResolvedValue({
      statusCode: 200,
      response: { success: true, eligible: true },
    });
    const req = buildReq();
    const res = buildRes();

    await bookingController.checkBookingEligibility(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, eligible: true });
  });

  // UTCID02 - Abnormal (duplicate key raced through service)
  test("UTCID02: service throw E11000 -> 409 giuong vua duoc dat", async () => {
    const dupErr = new Error("dup");
    dupErr.code = 11000;
    bookingService.createBooking.mockRejectedValue(dupErr);
    const req = buildReq({ body: { roomId: ROOM_ID, bedNumber: 1 } });
    const res = buildRes();

    await bookingController.createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("vừa được sinh viên khác đặt"),
      }),
    );
  });

  // UTCID03 - Abnormal (error with explicit status)
  test("UTCID03: service throw error co status -> tra dung status + message", async () => {
    const err = new Error("Không có kỳ học nào đang diễn ra");
    err.status = 404;
    bookingService.checkBookingEligibility.mockRejectedValue(err);
    const req = buildReq();
    const res = buildRes();

    await bookingController.checkBookingEligibility(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Không có kỳ học nào đang diễn ra",
      }),
    );
  });

  // UTCID04 - Abnormal (unknown error -> 500 + fallback)
  test("UTCID04: service throw error thuong -> 500 + fallback message", async () => {
    bookingService.createBooking.mockRejectedValue(new Error("db down"));
    const req = buildReq({ body: { roomId: ROOM_ID, bedNumber: 1 } });
    const res = buildRes();

    await bookingController.createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Lỗi khi đặt phòng",
        error: "db down",
      }),
    );
  });
});

// =====================================================================
// BOOKING_CTRL_MAP - truyen tham so dung
// =====================================================================
describe("BOOKING_CTRL_MAP - truyen tham so dung", () => {
  // UTCID05 - Normal
  test('UTCID05: checkBookingEligibility isRenew = "true" -> true', async () => {
    bookingService.checkBookingEligibility.mockResolvedValue(OK_RESULT);
    const req = buildReq({ query: { isRenew: "true" } });

    await bookingController.checkBookingEligibility(req, buildRes());

    expect(bookingService.checkBookingEligibility).toHaveBeenCalledWith(
      STUDENT_ID,
      true,
    );
  });

  // UTCID06 - Normal
  test('UTCID06: checkBookingEligibility isRenew khac "true" -> false', async () => {
    bookingService.checkBookingEligibility.mockResolvedValue(OK_RESULT);
    const req = buildReq({ query: { isRenew: "1" } });

    await bookingController.checkBookingEligibility(req, buildRes());

    expect(bookingService.checkBookingEligibility).toHaveBeenCalledWith(
      STUDENT_ID,
      false,
    );
  });

  // UTCID07 - Normal
  test("UTCID07: getAvailableRooms truyen buildingId + floor", async () => {
    bookingService.getAvailableRooms.mockResolvedValue(OK_RESULT);
    const req = buildReq({
      params: { buildingId: BUILDING_ID },
      query: { floor: "3" },
    });

    await bookingController.getAvailableRooms(req, buildRes());

    expect(bookingService.getAvailableRooms).toHaveBeenCalledWith(
      BUILDING_ID,
      "3",
    );
  });

  // UTCID08 - Normal
  test("UTCID08: getRoomBedAvailability truyen roomId tu params", async () => {
    bookingService.getRoomBedAvailability.mockResolvedValue(OK_RESULT);
    const req = buildReq({ params: { roomId: ROOM_ID } });

    await bookingController.getRoomBedAvailability(req, buildRes());

    expect(bookingService.getRoomBedAvailability).toHaveBeenCalledWith(
      ROOM_ID,
    );
  });

  // UTCID09 - Normal
  test("UTCID09: createBooking truyen userId + body", async () => {
    bookingService.createBooking.mockResolvedValue({
      statusCode: 201,
      response: { success: true },
    });
    const req = buildReq({
      body: { roomId: ROOM_ID, bedNumber: 2, renewedFrom: "old-id" },
    });
    const res = buildRes();

    await bookingController.createBooking(req, res);

    expect(bookingService.createBooking).toHaveBeenCalledWith(
      STUDENT_ID,
      ROOM_ID,
      2,
      "old-id",
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // UTCID10 - Normal (unauthenticated request forwards undefined)
  test("UTCID10: createBooking khong co req.user -> truyen undefined", async () => {
    bookingService.createBooking.mockResolvedValue({
      statusCode: 401,
      response: { success: false },
    });
    const req = buildReq({ user: undefined, body: { roomId: ROOM_ID, bedNumber: 1 } });
    const res = buildRes();

    await bookingController.createBooking(req, res);

    expect(bookingService.createBooking).toHaveBeenCalledWith(
      undefined,
      ROOM_ID,
      1,
      undefined,
    );
    expect(res.status).toHaveBeenCalledWith(401);
  });

  // UTCID11 - Normal
  test("UTCID11: getMyBooking truyen userId", async () => {
    bookingService.getMyBooking.mockResolvedValue(OK_RESULT);

    await bookingController.getMyBooking(buildReq(), buildRes());

    expect(bookingService.getMyBooking).toHaveBeenCalledWith(STUDENT_ID);
  });

  // UTCID12 - Normal
  test("UTCID12: getMyHistory truyen userId", async () => {
    bookingService.getMyHistory.mockResolvedValue(OK_RESULT);

    await bookingController.getMyHistory(buildReq(), buildRes());

    expect(bookingService.getMyHistory).toHaveBeenCalledWith(STUDENT_ID);
  });

  // UTCID13 - Normal
  test("UTCID13: getRoomHistory truyen roomId tu params", async () => {
    bookingService.getRoomHistory.mockResolvedValue(OK_RESULT);
    const req = buildReq({ params: { roomId: ROOM_ID } });

    await bookingController.getRoomHistory(req, buildRes());

    expect(bookingService.getRoomHistory).toHaveBeenCalledWith(ROOM_ID);
  });

  // UTCID14 - Normal
  test("UTCID14: getAllBookings truyen query filters", async () => {
    bookingService.getAllBookings.mockResolvedValue(OK_RESULT);
    const req = buildReq({
      query: { status: "confirmed", semester: "Fall 2026" },
    });

    await bookingController.getAllBookings(req, buildRes());

    expect(bookingService.getAllBookings).toHaveBeenCalledWith({
      status: "confirmed",
      semester: "Fall 2026",
    });
  });

  // UTCID15 - Normal
  test("UTCID15: getRoommates truyen roomId + semester", async () => {
    bookingService.getRoommates.mockResolvedValue(OK_RESULT);
    const req = buildReq({
      params: { roomId: ROOM_ID },
      query: { semester: "Fall 2026" },
    });

    await bookingController.getRoommates(req, buildRes());

    expect(bookingService.getRoommates).toHaveBeenCalledWith(
      ROOM_ID,
      "Fall 2026",
    );
  });
});
