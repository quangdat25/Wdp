/**
 * Function Code : NEWS_CREATE
 * Function Name : Create News
 * Class        : News Controller (news.controller.js)
 * Description  : Manager tao ban tin moi
 * Pre-Condition: User dang nhap voi role MANAGER, ket noi server OK
 *
 * Test cases theo mau WDP_ECS_Unit Test Case.xlsx
 *   UTCID01 - Normal   : Payload hop le (title, content) -> 201 tao thanh cong
 *   UTCID02 - Abnormal : title = ""                      -> 400 loi thieu tieu de
 *   UTCID03 - Boundary : title = "   " (whitespace)      -> 400 loi thieu tieu de
 *   UTCID04 - Abnormal : content = ""                    -> 400 loi thieu noi dung
 *   UTCID05 - Boundary : content = "   " (whitespace)    -> 400 loi thieu noi dung
 *   UTCID06 - Abnormal : title = undefined               -> 400 loi thieu tieu de
 *   UTCID07 - Abnormal : content = undefined             -> 400 loi thieu noi dung
 *   UTCID08 - Normal   : status = "draft", isPinned=true -> 201 khong emit socket
 */

// ---- Mock dependencies BEFORE require controller ----
jest.mock("../src/models/news.model");
jest.mock("../src/models/notification.model");
jest.mock("../src/socket", () => ({ getIO: jest.fn() }));

const News = require("../src/models/news.model");
const Notification = require("../src/models/notification.model");
const { getIO } = require("../src/socket");
const newsController = require("../src/controllers/news.controller");

// Helper: build fake res object
const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Helper: build fake req object (mac dinh user la manager)
const buildReq = (body = {}) => ({
  body,
  user: {
    _id: "manager-id-001",
    role: "manager",
    buildingId: "building-id-001",
  },
});

// Helper: fake io object voi emit
const buildIO = () => {
  const io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
  return io;
};

describe("NEWS_CREATE - createNews", () => {
  let io;

  beforeEach(() => {
    jest.clearAllMocks();
    io = buildIO();
    getIO.mockReturnValue(io);

    // Mock News.create tra ve doi tuong co populate()
    News.create.mockImplementation(async (data) => ({
      _id: "news-id-001",
      ...data,
      populate: jest.fn().mockResolvedValue(true),
    }));

    // Mock Notification.create
    Notification.create.mockResolvedValue({
      _id: "noti-id-001",
      title: "noti",
    });
  });

  // ================= UTCID01 - Normal =================
  test("UTCID01: title + content hop le -> 201 tao ban tin thanh cong", async () => {
    const req = buildReq({
      title: "Bao tri he thong",
      content: "Ngay mai bao tri he thong tu 8h-10h",
    });
    const res = buildRes();

    await newsController.createNews(req, res);

    expect(News.create).toHaveBeenCalledTimes(1);
    expect(News.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Bao tri he thong",
        content: "Ngay mai bao tri he thong tu 8h-10h",
        authorId: "manager-id-001",
        buildingId: "building-id-001",
        status: "published",
        isPinned: false,
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Đăng bản tin thành công",
      })
    );
    // Vi status mac dinh la published nen phai emit socket + tao notification
    expect(io.to).toHaveBeenCalledWith("role:student");
    expect(io.emit).toHaveBeenCalledWith("new_news", expect.any(Object));
    expect(Notification.create).toHaveBeenCalledTimes(1);
  });

  // ================= UTCID02 - Abnormal =================
  test('UTCID02: title = "" -> 400 loi thieu tieu de', async () => {
    const req = buildReq({ title: "", content: "noi dung" });
    const res = buildRes();

    await newsController.createNews(req, res);

    expect(News.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vui lòng nhập tiêu đề bản tin",
    });
  });

  // ================= UTCID03 - Boundary =================
  test('UTCID03: title = "   " (chi khoang trang) -> 400 loi thieu tieu de', async () => {
    const req = buildReq({ title: "   ", content: "noi dung" });
    const res = buildRes();

    await newsController.createNews(req, res);

    expect(News.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vui lòng nhập tiêu đề bản tin",
    });
  });

  // ================= UTCID04 - Abnormal =================
  test('UTCID04: content = "" -> 400 loi thieu noi dung', async () => {
    const req = buildReq({ title: "tieu de", content: "" });
    const res = buildRes();

    await newsController.createNews(req, res);

    expect(News.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vui lòng nhập nội dung bản tin",
    });
  });

  // ================= UTCID05 - Boundary =================
  test('UTCID05: content = "   " (chi khoang trang) -> 400 loi thieu noi dung', async () => {
    const req = buildReq({ title: "tieu de", content: "     " });
    const res = buildRes();

    await newsController.createNews(req, res);

    expect(News.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vui lòng nhập nội dung bản tin",
    });
  });

  // ================= UTCID06 - Abnormal =================
  test("UTCID06: thieu title (undefined) -> 400 loi thieu tieu de", async () => {
    const req = buildReq({ content: "noi dung" });
    const res = buildRes();

    await newsController.createNews(req, res);

    expect(News.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vui lòng nhập tiêu đề bản tin",
    });
  });

  // ================= UTCID07 - Abnormal =================
  test("UTCID07: thieu content (undefined) -> 400 loi thieu noi dung", async () => {
    const req = buildReq({ title: "tieu de" });
    const res = buildRes();

    await newsController.createNews(req, res);

    expect(News.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Vui lòng nhập nội dung bản tin",
    });
  });

  // ================= UTCID08 - Normal/Boundary =================
  test('UTCID08: status="draft" + isPinned=true -> 201 va KHONG emit socket', async () => {
    const req = buildReq({
      title: "Ban tin nhap",
      content: "Chua xuat ban",
      status: "draft",
      isPinned: true,
    });
    const res = buildRes();

    await newsController.createNews(req, res);

    expect(News.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Ban tin nhap",
        content: "Chua xuat ban",
        status: "draft",
        isPinned: true,
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    // Vi status = "draft" nen khong day socket, khong tao notification
    expect(io.emit).not.toHaveBeenCalled();
    expect(Notification.create).not.toHaveBeenCalled();
  });
});
