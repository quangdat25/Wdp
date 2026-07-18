/**
 * Function Code : BUILDING_CREATE / BUILDING_DELETE
 * Function Name : Create Building / Delete Building
 * Class        : Room Controller (room.controller.js)
 * Description  : Admin tao/xoa toa nha (kem sinh phong tu dong)
 * Pre-Condition: User dang nhap voi role ADMIN, ket noi server OK
 *
 * ===== BUILDING_CREATE - createBuilding =====
 *   UTCID01 - Normal   : name hop le, chua ton tai -> 201 tao toa + phong
 *   UTCID02 - Abnormal : name = ""                 -> 400 ten khong duoc trong
 *   UTCID03 - Boundary : name = "   " (whitespace) -> 400 ten khong duoc trong
 *   UTCID04 - Abnormal : name da ton tai            -> 400 toa da ton tai
 *
 * ===== BUILDING_DELETE - deleteBuilding =====
 *   UTCID05 - Normal   : toa ton tai, khong phong occupied -> 200 xoa thanh cong
 *   UTCID06 - Abnormal : toa khong ton tai                 -> 404 khong tim thay
 *   UTCID07 - Abnormal : con phong dang co nguoi o          -> 400 khong the xoa
 */

// ---- Mock dependencies BEFORE require controller ----
jest.mock("../src/models/building.model");
jest.mock("../src/models/room.models");
jest.mock("../src/models/user.model");
jest.mock("../src/models/booking.model");

const Building = require("../src/models/building.model");
const Room = require("../src/models/room.models");
const roomController = require("../src/controllers/room.controller");

// Helper: build fake res object
const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("BUILDING_CREATE - createBuilding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Building.findOne.mockResolvedValue(null);
    Building.create.mockResolvedValue({ _id: "building-id-001", name: "A" });
    Room.insertMany.mockResolvedValue([]);
  });

  // ================= UTCID01 - Normal =================
  test("UTCID01: name hop le, chua ton tai -> 201 tao toa nha + phong", async () => {
    const req = { body: { name: "a", description: "Toa A" } };
    const res = buildRes();

    await roomController.createBuilding(req, res);

    // Ten duoc trim + viet hoa
    expect(Building.findOne).toHaveBeenCalledWith({ name: "A" });
    expect(Building.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "A", description: "Toa A" })
    );
    // 4 tang x 6 phong = 24 phong
    expect(Room.insertMany).toHaveBeenCalledTimes(1);
    expect(Room.insertMany.mock.calls[0][0]).toHaveLength(24);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  // ================= UTCID02 - Abnormal =================
  test('UTCID02: name = "" -> 400 ten khong duoc trong', async () => {
    const req = { body: { name: "" } };
    const res = buildRes();

    await roomController.createBuilding(req, res);

    expect(Building.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Tên tòa nhà không được để trống",
    });
  });

  // ================= UTCID03 - Boundary =================
  test('UTCID03: name = "   " (chi khoang trang) -> 400 ten khong duoc trong', async () => {
    const req = { body: { name: "   " } };
    const res = buildRes();

    await roomController.createBuilding(req, res);

    expect(Building.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Tên tòa nhà không được để trống",
    });
  });

  // ================= UTCID04 - Abnormal =================
  test("UTCID04: name da ton tai -> 400 toa nha da ton tai", async () => {
    Building.findOne.mockResolvedValue({ _id: "existing", name: "B" });

    const req = { body: { name: "b" } };
    const res = buildRes();

    await roomController.createBuilding(req, res);

    expect(Building.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Tòa nhà "B" đã tồn tại',
    });
  });
});

describe("BUILDING_DELETE - deleteBuilding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Room.deleteMany.mockResolvedValue({ deletedCount: 24 });
    Building.findByIdAndDelete.mockResolvedValue({});
  });

  // ================= UTCID05 - Normal =================
  test("UTCID05: toa ton tai, khong phong occupied -> 200 xoa thanh cong", async () => {
    Building.findById.mockResolvedValue({ _id: "building-id-001", name: "A" });
    Room.countDocuments.mockResolvedValue(0);

    const req = { params: { id: "building-id-001" } };
    const res = buildRes();

    await roomController.deleteBuilding(req, res);

    expect(Room.deleteMany).toHaveBeenCalledWith({ building: "building-id-001" });
    expect(Building.findByIdAndDelete).toHaveBeenCalledWith("building-id-001");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  // ================= UTCID06 - Abnormal =================
  test("UTCID06: toa khong ton tai -> 404 khong tim thay", async () => {
    Building.findById.mockResolvedValue(null);

    const req = { params: { id: "khong-ton-tai" } };
    const res = buildRes();

    await roomController.deleteBuilding(req, res);

    expect(Room.deleteMany).not.toHaveBeenCalled();
    expect(Building.findByIdAndDelete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Không tìm thấy tòa nhà",
    });
  });

  // ================= UTCID07 - Abnormal =================
  test("UTCID07: con phong dang co nguoi o -> 400 khong the xoa", async () => {
    Building.findById.mockResolvedValue({ _id: "building-id-001", name: "A" });
    Room.countDocuments.mockResolvedValue(3);

    const req = { params: { id: "building-id-001" } };
    const res = buildRes();

    await roomController.deleteBuilding(req, res);

    expect(Building.findByIdAndDelete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Không thể xóa tòa nhà "A" vì còn 3 phòng đang có người ở',
    });
  });
});
