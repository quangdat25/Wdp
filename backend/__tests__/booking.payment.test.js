/**
 * Function Code : BOOKING_PAYMENT_*
 * Class        : Payment Service (payment.service.js) - phan lien quan booking
 * Description  : Thanh toan VNPay de xac nhan booking dang pending
 * Pre-Condition: paymentRepository, vnpay, mail duoc mock
 *
 * ===== BOOKING_PAYMENT_CREATE - createBookingPayment =====
 *   UTCID01 - Abnormal : thieu bookingId                          -> throw 400
 *   UTCID02 - Abnormal : khong tim thay booking                   -> throw 404
 *   UTCID03 - Abnormal : booking cua sinh vien khac               -> throw 403
 *   UTCID04 - Abnormal : booking khong o trang thai pending       -> throw 400
 *   UTCID05 - Abnormal : booking chua co configId                 -> throw 400
 *   UTCID06 - Abnormal : roomPrice <= 0                           -> throw 400
 *   UTCID07 - Normal   : tao url thanh toan + txnRef BOOKING_     -> tra paymentUrl
 *
 * ===== BOOKING_PAYMENT_RETURN - handleVnpayReturn =====
 *   UTCID08 - Abnormal : chu ky khong hop le                      -> error InvalidSignature
 *   UTCID09 - Abnormal : thieu vnp_TxnRef                         -> error InvalidTransactionReference
 *   UTCID10 - Abnormal : vnp_ResponseCode != "00"                 -> error PaymentFailed
 *   UTCID11 - Abnormal : paymentType khong ho tro                 -> error InvalidPaymentType
 *
 * ===== BOOKING_PAYMENT_SUCCESS - handleBookingSuccess =====
 *   UTCID12 - Abnormal : khong tim thay booking                   -> error BookingNotFound
 *   UTCID13 - Normal   : booking da confirmed (thanh toan lai)    -> success url (idempotent)
 *   UTCID14 - Abnormal : booking o trang thai khac pending        -> error InvalidBookingStatus
 *   UTCID15 - Normal   : pending -> confirmed + invoice paid + mail -> success url
 *   UTCID16 - Abnormal : loi trong qua trinh xu ly                -> error BookingConfirmationFailed
 */

// ---- Mock dependencies BEFORE require service ----
jest.mock("../src/repositories/payment.repository");
jest.mock("../src/config/mail");
jest.mock("../src/config/vnpay");

const paymentRepository = require("../src/repositories/payment.repository");
const sendMail = require("../src/config/mail");
const {
  createVNPayUrl,
  verifyVNPayReturn,
  generatePayID,
} = require("../src/config/vnpay");

const paymentService = require("../src/services/payment.service");

const STUDENT_ID = "507f191e810c19729de860ea";
const BOOKING_ID = "507f1f77bcf86cd799439011";

process.env.CLIENT_URL = "http://localhost:5173";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
  generatePayID.mockReturnValue("PAY123");
  createVNPayUrl.mockReturnValue("https://vnpay.vn/pay?x=1");
});

afterEach(() => {
  console.error.mockRestore();
  console.log.mockRestore();
});

const buildPendingBooking = (overrides = {}) => ({
  _id: BOOKING_ID,
  studentId: STUDENT_ID,
  status: "pending",
  semester: "Fall 2026",
  bedNumber: 1,
  configId: { _id: "config-1", name: "Cau hinh 2026", roomPrice: 1500000 },
  roomId: { displayName: "A101", building: { name: "Toa A" } },
  ...overrides,
});

// =====================================================================
// BOOKING_PAYMENT_CREATE - createBookingPayment
// =====================================================================
describe("BOOKING_PAYMENT_CREATE - createBookingPayment", () => {
  // UTCID01 - Abnormal
  test("UTCID01: thieu bookingId -> throw 400", async () => {
    await expect(
      paymentService.createBookingPayment({
        bookingId: null,
        studentId: STUDENT_ID,
        ipAddr: "127.0.0.1",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  // UTCID02 - Abnormal
  test("UTCID02: khong tim thay booking -> throw 404", async () => {
    paymentRepository.findBookingForPayment.mockResolvedValue(null);
    await expect(
      paymentService.createBookingPayment({
        bookingId: BOOKING_ID,
        studentId: STUDENT_ID,
        ipAddr: "127.0.0.1",
      }),
    ).rejects.toMatchObject({ status: 404 });
  });

  // UTCID03 - Abnormal
  test("UTCID03: booking cua sinh vien khac -> throw 403", async () => {
    paymentRepository.findBookingForPayment.mockResolvedValue(
      buildPendingBooking({ studentId: "someone-else" }),
    );
    await expect(
      paymentService.createBookingPayment({
        bookingId: BOOKING_ID,
        studentId: STUDENT_ID,
        ipAddr: "127.0.0.1",
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  // UTCID04 - Abnormal
  test("UTCID04: booking khong pending -> throw 400", async () => {
    paymentRepository.findBookingForPayment.mockResolvedValue(
      buildPendingBooking({ status: "confirmed" }),
    );
    await expect(
      paymentService.createBookingPayment({
        bookingId: BOOKING_ID,
        studentId: STUDENT_ID,
        ipAddr: "127.0.0.1",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  // UTCID05 - Abnormal
  test("UTCID05: booking chua co configId -> throw 400", async () => {
    paymentRepository.findBookingForPayment.mockResolvedValue(
      buildPendingBooking({ configId: null }),
    );
    await expect(
      paymentService.createBookingPayment({
        bookingId: BOOKING_ID,
        studentId: STUDENT_ID,
        ipAddr: "127.0.0.1",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  // UTCID06 - Abnormal (price must be > 0 for payment)
  test("UTCID06: roomPrice <= 0 -> throw 400", async () => {
    paymentRepository.findBookingForPayment.mockResolvedValue(
      buildPendingBooking({
        configId: { _id: "config-1", name: "Free", roomPrice: 0 },
      }),
    );
    await expect(
      paymentService.createBookingPayment({
        bookingId: BOOKING_ID,
        studentId: STUDENT_ID,
        ipAddr: "127.0.0.1",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  // UTCID07 - Normal
  test("UTCID07: tao url thanh toan + txnRef BOOKING_ -> tra paymentUrl", async () => {
    paymentRepository.findBookingForPayment.mockResolvedValue(
      buildPendingBooking(),
    );

    const result = await paymentService.createBookingPayment({
      bookingId: BOOKING_ID,
      studentId: STUDENT_ID,
      ipAddr: "127.0.0.1",
    });

    expect(createVNPayUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1500000,
        ipAddr: "127.0.0.1",
        txnRef: `BOOKING_${BOOKING_ID}_PAY123`,
        orderInfo: expect.stringContaining("A101"),
      }),
    );
    expect(result).toMatchObject({
      paymentUrl: "https://vnpay.vn/pay?x=1",
      bookingId: BOOKING_ID,
      amount: 1500000,
      config: expect.objectContaining({ roomPrice: 1500000 }),
    });
  });
});

// =====================================================================
// BOOKING_PAYMENT_RETURN - handleVnpayReturn
// =====================================================================
describe("BOOKING_PAYMENT_RETURN - handleVnpayReturn", () => {
  // UTCID08 - Abnormal
  test("UTCID08: chu ky khong hop le -> error InvalidSignature", async () => {
    verifyVNPayReturn.mockReturnValue({ isVerified: false });

    const url = await paymentService.handleVnpayReturn({
      vnp_ResponseCode: "00",
      vnp_TxnRef: `BOOKING_${BOOKING_ID}`,
    });

    expect(url).toContain("status=error");
    expect(url).toContain("InvalidSignature");
  });

  // UTCID09 - Abnormal
  test("UTCID09: thieu vnp_TxnRef -> error InvalidTransactionReference", async () => {
    verifyVNPayReturn.mockReturnValue({ isVerified: true });

    const url = await paymentService.handleVnpayReturn({
      vnp_ResponseCode: "00",
    });

    expect(url).toContain("InvalidTransactionReference");
  });

  // UTCID10 - Abnormal (user cancelled / failed at VNPay)
  test('UTCID10: vnp_ResponseCode != "00" -> error PaymentFailed', async () => {
    verifyVNPayReturn.mockReturnValue({ isVerified: true });

    const url = await paymentService.handleVnpayReturn({
      vnp_ResponseCode: "24",
      vnp_TxnRef: `BOOKING_${BOOKING_ID}_PAY123`,
    });

    expect(url).toContain("PaymentFailed");
  });

  // UTCID11 - Abnormal
  test("UTCID11: paymentType khong ho tro -> error InvalidPaymentType", async () => {
    verifyVNPayReturn.mockReturnValue({ isVerified: true });

    const url = await paymentService.handleVnpayReturn({
      vnp_ResponseCode: "00",
      vnp_TxnRef: `OTHER_${BOOKING_ID}_PAY123`,
    });

    expect(url).toContain("InvalidPaymentType");
  });
});

// =====================================================================
// BOOKING_PAYMENT_SUCCESS - handleBookingSuccess
// =====================================================================
describe("BOOKING_PAYMENT_SUCCESS - handleBookingSuccess", () => {
  // UTCID12 - Abnormal
  test("UTCID12: khong tim thay booking -> error BookingNotFound", async () => {
    paymentRepository.findBookingForSuccess.mockResolvedValue(null);

    const url = await paymentService.handleBookingSuccess(BOOKING_ID);

    expect(url).toContain("BookingNotFound");
  });

  // UTCID13 - Normal (idempotent when already confirmed)
  test("UTCID13: booking da confirmed -> success url, khong xu ly lai", async () => {
    paymentRepository.findBookingForSuccess.mockResolvedValue(
      buildPendingBooking({ status: "confirmed" }),
    );

    const url = await paymentService.handleBookingSuccess(BOOKING_ID);

    expect(url).toContain("status=success");
    expect(url).toContain(`bookingId=${BOOKING_ID}`);
    expect(paymentRepository.saveBooking).not.toHaveBeenCalled();
  });

  // UTCID14 - Abnormal
  test("UTCID14: booking o trang thai cancelled -> error InvalidBookingStatus", async () => {
    paymentRepository.findBookingForSuccess.mockResolvedValue(
      buildPendingBooking({ status: "cancelled" }),
    );

    const url = await paymentService.handleBookingSuccess(BOOKING_ID);

    expect(url).toContain("InvalidBookingStatus");
  });

  // UTCID15 - Normal (full happy path: confirm + pay invoice + mail)
  test("UTCID15: pending -> confirmed + invoice paid + gui mail -> success url", async () => {
    const booking = buildPendingBooking();
    const student = {
      _id: STUDENT_ID,
      email: "sv@fpt.edu.vn",
      fullName: "Nguyen Van A",
    };
    const unpaidInvoice = {
      _id: "invoice-1",
      invoiceCode: "INV-XXX",
      status: "unpaid",
    };

    paymentRepository.findBookingForSuccess.mockResolvedValue(booking);
    paymentRepository.findStudentById.mockResolvedValue(student);
    paymentRepository.findRoomFeeInvoiceByBookingId.mockResolvedValue(
      unpaidInvoice,
    );
    paymentRepository.saveInvoice.mockResolvedValue(unpaidInvoice);
    paymentRepository.saveBooking.mockResolvedValue(booking);
    sendMail.mockResolvedValue();

    const url = await paymentService.handleBookingSuccess(BOOKING_ID);

    // Booking chuyen sang confirmed va duoc luu
    expect(booking.status).toBe("confirmed");
    expect(paymentRepository.saveBooking).toHaveBeenCalledWith(booking);

    // Invoice duoc chuyen sang paid voi dung so tien
    expect(unpaidInvoice.status).toBe("paid");
    expect(unpaidInvoice.amount).toBe(1500000);
    expect(unpaidInvoice.paidAt).toBeInstanceOf(Date);
    expect(paymentRepository.saveInvoice).toHaveBeenCalledWith(unpaidInvoice);

    // Gui mail xac nhan
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "sv@fpt.edu.vn" }),
    );

    expect(url).toContain("status=success");
    expect(url).toContain(`bookingId=${BOOKING_ID}`);
  });

  // UTCID16 - Abnormal (error mid-flow gets caught)
  test("UTCID16: loi trong qua trinh xu ly -> error BookingConfirmationFailed", async () => {
    paymentRepository.findBookingForSuccess.mockResolvedValue(
      buildPendingBooking(),
    );
    paymentRepository.findStudentById.mockRejectedValue(new Error("db down"));

    const url = await paymentService.handleBookingSuccess(BOOKING_ID);

    expect(url).toContain("BookingConfirmationFailed");
  });
});
