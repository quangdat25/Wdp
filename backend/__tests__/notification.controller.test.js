/**
 * Function Code : NOTI_CREATE
 * Function Name : Create Notification
 * Class        : Notification Controller (notification.controller.js)
 * Description  : Admin/Manager gui thong bao (all / roles / users / studentCode)
 * Pre-Condition: User dang nhap, ket noi server OK
 *
 * Test cases theo mau WDP_ECS_Unit Test Case.xlsx
 *   UTCID01 - Normal   : targetType="all"                       -> 201 emit room "all"
 *   UTCID02 - Normal   : targetType="roles" (student,manager)   -> 201 emit tung role
 *   UTCID03 - Normal   : targetType="users" (2 user)            -> 201 emit tung user
 *   UTCID04 - Normal   : targetType="studentCode" ton tai       -> 201 emit user tim thay
 *   UTCID05 - Abnormal : targetType="studentCode" khong ton tai -> 404 khong tao noti
 *   UTCID06 - Abnormal : Notification.create throw              -> 500 loi he thong
 */

// ---- Mock dependencies BEFORE require controller ----
jest.mock("../src/models/notification.model", () => ({ create: jest.fn() }));
jest.mock("../src/models/notificationReceipt.model", () => ({
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteMany: jest.fn(),
}));
jest.mock("../src/models/student.model", () => ({ findOne: jest.fn() }));
jest.mock("../src/socket", () => ({ getIO: jest.fn() }));

const Notification = require("../src/models/notification.model");
const Student = require("../src/models/student.model");
const { getIO } = require("../src/socket");
const notificationController = require("../src/controllers/notification.controller");

// Helper: build fake res object
const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Helper: build fake req object (mac dinh user la admin)
const buildReq = (body = {}) => ({
  body,
  user: { _id: "admin-id-001", role: "admin" },
});

// Helper: fake io object voi emit
const buildIO = () => ({ to: jest.fn().mockReturnThis(), emit: jest.fn() });

describe("NOTI_CREATE - createNotification", () => {
  let io;

  beforeEach(() => {
    jest.clearAllMocks();
    io = buildIO();
    getIO.mockReturnValue(io);

    Notification.create.mockImplementation(async (data) => ({
      _id: "noti-id-001",
      ...data,
    }));
  });

  // ================= UTCID01 - Normal =================
  test('UTCID01: targetType="all" -> 201 va emit room "all"', async () => {
    const req = buildReq({
      title: "Thong bao chung",
      content: "Noi dung cho tat ca",
      targetType: "all",
    });
    const res = buildRes();

    await notificationController.createNotification(req, res);

    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Thong bao chung",
        content: "Noi dung cho tat ca",
        targetType: "all",
        senderId: "admin-id-001",
      })
    );
    expect(io.to).toHaveBeenCalledWith("all");
    expect(io.emit).toHaveBeenCalledWith("new_notification", expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Gửi thông báo thành công",
      })
    );
  });

  // ================= UTCID02 - Normal =================
  test('UTCID02: targetType="roles" -> 201 va emit tung role', async () => {
    const req = buildReq({
      title: "Thong bao role",
      content: "Cho student va manager",
      targetType: "roles",
      targetRoles: ["student", "manager"],
    });
    const res = buildRes();

    await notificationController.createNotification(req, res);

    expect(io.to).toHaveBeenCalledWith("role:student");
    expect(io.to).toHaveBeenCalledWith("role:manager");
    expect(io.emit).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ================= UTCID03 - Normal =================
  test('UTCID03: targetType="users" -> 201 va emit tung user', async () => {
    const req = buildReq({
      title: "Thong bao user",
      content: "Cho 2 user",
      targetType: "users",
      targetUsers: ["user-1", "user-2"],
    });
    const res = buildRes();

    await notificationController.createNotification(req, res);

    expect(io.to).toHaveBeenCalledWith("user:user-1");
    expect(io.to).toHaveBeenCalledWith("user:user-2");
    expect(io.emit).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ================= UTCID04 - Normal =================
  test('UTCID04: targetType="studentCode" ton tai -> 201 emit dung user', async () => {
    Student.findOne.mockResolvedValue({ _id: "student-id-999" });

    const req = buildReq({
      title: "Thong bao ca nhan",
      content: "Rieng cho 1 SV",
      targetType: "studentCode",
      studentCode: "HE160001",
    });
    const res = buildRes();

    await notificationController.createNotification(req, res);

    expect(Student.findOne).toHaveBeenCalledWith({ studentCode: "HE160001" });
    // studentCode -> chuyen thanh targetType "users"
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        targetType: "users",
        targetUsers: ["student-id-999"],
      })
    );
    expect(io.to).toHaveBeenCalledWith("user:student-id-999");
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ================= UTCID05 - Abnormal =================
  test('UTCID05: targetType="studentCode" khong ton tai -> 404 khong tao noti', async () => {
    Student.findOne.mockResolvedValue(null);

    const req = buildReq({
      title: "Thong bao ca nhan",
      content: "Rieng cho 1 SV",
      targetType: "studentCode",
      studentCode: "KHONG_TON_TAI",
    });
    const res = buildRes();

    await notificationController.createNotification(req, res);

    expect(Notification.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Không tìm thấy sinh viên với mã này",
    });
  });

  // ================= UTCID06 - Abnormal =================
  test("UTCID06: Notification.create throw -> 500 loi he thong", async () => {
    Notification.create.mockRejectedValue(new Error("DB down"));

    const req = buildReq({
      title: "Thong bao",
      content: "Noi dung",
      targetType: "all",
    });
    const res = buildRes();

    await notificationController.createNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Lỗi khi gửi thông báo",
        error: "DB down",
      })
    );
  });
});
