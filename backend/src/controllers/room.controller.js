const Building = require("../models/building.model");
const Room = require("../models/room.models");
const User = require("../models/user.model");

// Lấy tất cả tòa nhà
const getAllBuildings = async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.role === "manager" && req.user.buildingId) {
      query._id = req.user.buildingId;
    }
    const buildings = await Building.find(query).sort({ name: 1 });

    // Đếm số phòng theo trạng thái cho mỗi tòa
    const buildingsWithStats = await Promise.all(
      buildings.map(async (building) => {
        const totalRooms = await Room.countDocuments({
          building: building._id,
        });
        const availableRooms = await Room.countDocuments({
          building: building._id,
          status: "available",
        });
        const occupiedRooms = await Room.countDocuments({
          building: building._id,
          status: "occupied",
        });
        const maintenanceRooms = await Room.countDocuments({
          building: building._id,
          status: "maintenance",
        });

        return {
          ...building.toObject(),
          totalRooms,
          availableRooms,
          occupiedRooms,
          maintenanceRooms,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: buildingsWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách tòa nhà",
      error: error.message,
    });
  }
};

// Tạo tòa nhà mới + tự động tạo 5 tầng × 14 phòng
const createBuilding = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tên tòa nhà không được để trống",
      });
    }

    const buildingName = name.trim().toUpperCase();

    // Kiểm tra tòa đã tồn tại
    const existing = await Building.findOne({ name: buildingName });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Tòa nhà "${buildingName}" đã tồn tại`,
      });
    }

    // Tạo tòa nhà
    const building = await Building.create({
      name: buildingName,
      description: description || "",
    });

    // Tự động tạo 5 tầng × 14 phòng
    const rooms = [];
    for (let floor = 1; floor <= 4; floor++) {
      for (let roomNum = 1; roomNum <= 6; roomNum++) {
        const roomNumber = `${buildingName}${roomNum}`;
        const displayName = `${buildingName}-T${floor}-${roomNumber}`;
        rooms.push({
          building: building._id,
          floor,
          roomNumber,
          displayName,
          status: "available",
          capacity: 4,
          currentOccupants: 0,
          students: [],
        });
      }
    }

    await Room.insertMany(rooms);

    res.status(201).json({
      success: true,
      message: `Tạo tòa nhà "${buildingName}" thành công với ${rooms.length} phòng`,
      data: building,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo tòa nhà",
      error: error.message,
    });
  }
};

// Xóa tòa nhà và tất cả phòng liên quan
const deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;

    const building = await Building.findById(id);
    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tòa nhà",
      });
    }

    // Kiểm tra xem có phòng nào đang có người ở không
    const occupiedRooms = await Room.countDocuments({
      building: id,
      status: "occupied",
    });

    if (occupiedRooms > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa tòa nhà "${building.name}" vì còn ${occupiedRooms} phòng đang có người ở`,
      });
    }

    // Xóa tất cả phòng của tòa nhà
    await Room.deleteMany({ building: id });

    // Xóa tòa nhà
    await Building.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Đã xóa tòa nhà "${building.name}" và tất cả phòng liên quan`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa tòa nhà",
      error: error.message,
    });
  }
};

// Lấy danh sách phòng theo tòa nhà (có thể filter theo tầng)
const getRoomsByBuilding = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const { floor } = req.query;

    if (req.user && req.user.role === "manager" && req.user.buildingId) {
      if (req.user.buildingId.toString() !== buildingId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem phòng của tòa nhà này",
        });
      }
    }

    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tòa nhà",
      });
    }

    const query = { building: buildingId };
    if (floor) {
      query.floor = parseInt(floor);
    }

    const rooms = await Room.find(query)
      .sort({ floor: 1, roomNumber: 1 })
      .populate("building", "name")
      .populate("students.student", "fullName email studentCode phone gender");

    const formattedRooms = rooms.map(room => {
      const roomObj = room.toObject();
      roomObj.students = roomObj.students.map(s => ({
        ...s.student,
        bedNumber: s.bedNumber
      }));
      return roomObj;
    });

    res.status(200).json({
      success: true,
      data: formattedRooms,
      building: building,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách phòng",
      error: error.message,
    });
  }
};

// Xem chi tiết phòng
const getRoomDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id)
      .populate("building", "name")
      .populate("students.student", "fullName email studentCode phone gender major dateOfBirth");
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    if (req.user && req.user.role === "manager" && req.user.buildingId) {
      if (room.building._id.toString() !== req.user.buildingId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem phòng này",
        });
      }
    }

    const roomObj = room.toObject();
    roomObj.students = roomObj.students.map(s => ({
      ...s.student,
      bedNumber: s.bedNumber
    }));

    res.status(200).json({
      success: true,
      data: roomObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin phòng",
      error: error.message,
    });
  }
};

// Cập nhật phòng (status, capacity)
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    if (status !== undefined) {
      if (status === "maintenance") {
        if (room.students.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Không thể bảo trì phòng đang có người ở",
          });
        }
        room.status = "maintenance";
      } else {
        if (room.students.length > 0) {
          room.status = "occupied";
        } else {
          room.status = "available";
        }
      }
    }

    await room.save();

    const updatedRoom = await Room.findById(id)
      .populate("building", "name")
      .populate("students.student", "fullName email studentCode phone gender");

    const roomObj = updatedRoom.toObject();
    roomObj.students = roomObj.students.map(s => ({
      ...s.student,
      bedNumber: s.bedNumber
    }));

    res.status(200).json({
      success: true,
      message: "Cập nhật phòng thành công",
      data: roomObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật phòng",
      error: error.message,
    });
  }
};

// Thêm sinh viên vào phòng
const assignStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã sinh viên",
      });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    // Kiểm tra sinh viên tồn tại
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên",
      });
    }

    // Kiểm tra phòng đã đầy chưa
    if (room.students.length >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Phòng đã đầy (${room.capacity}/${room.capacity})`,
      });
    }

    // Kiểm tra sinh viên đã ở phòng này chưa
    if (room.students.some(s => s.student.toString() === studentId)) {
      return res.status(400).json({
        success: false,
        message: "Sinh viên đã ở trong phòng này",
      });
    }

    // Kiểm tra sinh viên đã ở phòng khác chưa
    const existingRoom = await Room.findOne({ "students.student": studentId });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Sinh viên đang ở phòng ${existingRoom.displayName}. Vui lòng xóa khỏi phòng cũ trước.`,
      });
    }

    const occupiedBeds = room.students.map(s => s.bedNumber);
    let bedNumber = 1;
    for (let i = 1; i <= room.capacity; i++) {
      if (!occupiedBeds.includes(i)) {
        bedNumber = i;
        break;
      }
    }

    room.students.push({ student: studentId, bedNumber });
    room.currentOccupants = room.students.length;
    if (room.status !== "maintenance") {
      room.status = "occupied";
    }
    await room.save();

    const updatedRoom = await Room.findById(id)
      .populate("building", "name")
      .populate("students.student", "fullName email studentCode phone gender major dateOfBirth");

    const roomObj = updatedRoom.toObject();
    roomObj.students = roomObj.students.map(s => ({
      ...s.student,
      bedNumber: s.bedNumber
    }));

    res.status(200).json({
      success: true,
      message: "Thêm sinh viên vào phòng thành công",
      data: roomObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm sinh viên vào phòng",
      error: error.message,
    });
  }
};

// Xóa sinh viên khỏi phòng
const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    const studentIndex = room.students.findIndex(s => s.student.toString() === studentId);
    if (studentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Sinh viên không ở trong phòng này",
      });
    }

    room.students.splice(studentIndex, 1);
    room.currentOccupants = room.students.length;
    if (room.status !== "maintenance") {
      if (room.students.length === 0) {
        room.status = "available";
      } else {
        room.status = "occupied";
      }
    }
    await room.save();

    const updatedRoom = await Room.findById(id)
      .populate("building", "name")
      .populate("students.student", "fullName email studentCode phone gender major dateOfBirth");

    const roomObj = updatedRoom.toObject();
    roomObj.students = roomObj.students.map(s => ({
      ...s.student,
      bedNumber: s.bedNumber
    }));

    res.status(200).json({
      success: true,
      message: "Xóa sinh viên khỏi phòng thành công",
      data: roomObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa sinh viên khỏi phòng",
      error: error.message,
    });
  }
};

// Lấy danh sách sinh viên chưa có phòng (để gán vào phòng)
const getAvailableStudents = async (req, res) => {
  try {
    const { search } = req.query;

    // Lấy tất cả studentId đang ở trong phòng
    const roomsWithStudents = await Room.find({ "students.0": { $exists: true } }).select("students.student");
    const assignedStudentIds = roomsWithStudents.flatMap((r) => r.students.map((s) => s.student.toString()));

    // Tìm sinh viên chưa được gán phòng
    const query = { role: "student" };
    if (assignedStudentIds.length > 0) {
      query._id = { $nin: assignedStudentIds };
    }

    // Tìm kiếm theo tên hoặc mã SV
    if (search && search.trim()) {
      const keyword = search.trim();
      query.$or = [
        { fullName: { $regex: keyword, $options: "i" } },
        { studentCode: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }

    const students = await User.find(query)
      .select("fullName email studentCode phone gender")
      .limit(20)
      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách sinh viên",
      error: error.message,
    });
  }
};

// Seed: Khởi tạo 4 tòa A, B, C, D nếu chưa có
const seedBuildings = async (req, res) => {
  try {
    const existingCount = await Building.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Đã có ${existingCount} tòa nhà trong hệ thống. Không cần khởi tạo.`,
      });
    }

    const buildingNames = ["A", "B", "C", "D"];
    const results = [];

    for (const name of buildingNames) {
      const building = await Building.create({
        name,
        description: `Tòa nhà ${name}`,
      });

      const rooms = [];
      for (let floor = 1; floor <= 4; floor++) {
        for (let roomNum = 1; roomNum <= 14; roomNum++) {
          const roomNumber = `${name}${roomNum}`;
          const displayName = `${name}-T${floor}-${roomNumber}`;
          rooms.push({
            building: building._id,
            floor,
            roomNumber,
            displayName,
            status: "available",
            capacity: 4,
            currentOccupants: 0,
            students: [],
          });
        }
      }

      await Room.insertMany(rooms);
      results.push({
        building: name,
        roomsCreated: rooms.length,
      });
    }

    res.status(201).json({
      success: true,
      message: "Khởi tạo dữ liệu thành công",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi khởi tạo dữ liệu",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBuildings,
  createBuilding,
  deleteBuilding,
  getRoomsByBuilding,
  getRoomDetail,
  updateRoom,
  assignStudent,
  removeStudent,
  getAvailableStudents,
  seedBuildings,
};