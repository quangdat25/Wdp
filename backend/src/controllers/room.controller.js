const Building = require("../models/building.model");
const Room = require("../models/room.models");
const User = require("../models/user.model");
const Booking = require("../models/booking.model");

/**
 * Chuyển dữ liệu số từ request thành số nguyên.
 */
const parsePositiveInteger = (value) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue)) {
    return null;
  }

  return parsedValue;
};

const generateRoomNumber = (buildingName, floor, roomIndex) => {
  const paddedRoomIndex = String(roomIndex).padStart(2, "0");
  return `${buildingName}${floor}${paddedRoomIndex}`;
};

/**
 * Chuyển danh sách sinh viên trong Room thành dữ liệu frontend sử dụng.
 */
const formatRoomStudents = (room) => {
  if (!room) {
    return null;
  }

  const roomObj = room.toObject();

  roomObj.students = (roomObj.students || [])
    .filter((item) => item.student)
    .map((item) => ({
      ...item.student,
      bedNumber: item.bedNumber,
    }));

  return roomObj;
};

/**
 * Lấy tất cả tòa nhà.
 */
const getAllBuildings = async (req, res) => {
  try {
    const buildings = await Building.find().sort({ name: 1 });

    const buildingsWithStats = await Promise.all(
      buildings.map(async (building) => {
        const [
          totalRooms,
          availableRooms,
          occupiedRooms,
          maintenanceRooms,
        ] = await Promise.all([
          Room.countDocuments({
            building: building._id,
          }),

          Room.countDocuments({
            building: building._id,
            status: "available",
          }),

          Room.countDocuments({
            building: building._id,
            status: "occupied",
          }),

          Room.countDocuments({
            building: building._id,
            status: "maintenance",
          }),
        ]);

        return {
          ...building.toObject(),
          totalRooms,
          availableRooms,
          occupiedRooms,
          maintenanceRooms,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: buildingsWithStats,
    });
  } catch (error) {
    console.error("getAllBuildings error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách tòa nhà",
      error: error.message,
    });
  }
};

/**
 * Tạo tòa nhà mới và tự động tạo phòng.
 *
 * Request body:
 * {
 *   name: "E",
 *   description: "Tòa E",
 *   totalFloors: 5,
 *   totalRoomsPerFloor: 14
 * }
 */
const createBuilding = async (req, res) => {
  let createdBuilding = null;

  try {
    const {
      name,
      description = "",
      totalFloors = 5,
      totalRoomsPerFloor = 14,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Tên tòa nhà không được để trống",
      });
    }

    const buildingName = String(name).trim().toUpperCase();
    const parsedTotalFloors = parsePositiveInteger(totalFloors);
    const parsedTotalRoomsPerFloor =
      parsePositiveInteger(totalRoomsPerFloor);

    if (
      parsedTotalFloors === null ||
      parsedTotalFloors < 1 ||
      parsedTotalFloors > 20
    ) {
      return res.status(400).json({
        success: false,
        message: "Số tầng phải là số nguyên từ 1 đến 20",
      });
    }

    if (
      parsedTotalRoomsPerFloor === null ||
      parsedTotalRoomsPerFloor < 1 ||
      parsedTotalRoomsPerFloor > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Số phòng mỗi tầng phải là số nguyên từ 1 đến 50",
      });
    }

    const existingBuilding = await Building.findOne({
      name: buildingName,
    });

    if (existingBuilding) {
      return res.status(409).json({
        success: false,
        message: `Tòa nhà "${buildingName}" đã tồn tại`,
      });
    }

    createdBuilding = await Building.create({
      name: buildingName,
      description: String(description || "").trim(),
      totalFloors: parsedTotalFloors,
      totalRoomsPerFloor: parsedTotalRoomsPerFloor,
    });

    const rooms = [];

    for (let floor = 1; floor <= parsedTotalFloors; floor++) {
      for (
        let roomIndex = 1;
        roomIndex <= parsedTotalRoomsPerFloor;
        roomIndex++
      ) {
        const roomNumber = generateRoomNumber(
          buildingName,
          floor,
          roomIndex,
        );

        rooms.push({
          building: createdBuilding._id,
          floor,
          roomNumber,
          displayName: `Tòa ${buildingName} - Tầng ${floor} - Phòng ${roomNumber}`,
          status: "available",
          capacity: 4,
          currentOccupants: 0,
          students: [],
        });
      }
    }

    await Room.insertMany(rooms);

    return res.status(201).json({
      success: true,
      message: `Tạo tòa nhà "${buildingName}" thành công với ${rooms.length} phòng`,
      data: {
        ...createdBuilding.toObject(),
        totalRooms: rooms.length,
        availableRooms: rooms.length,
        occupiedRooms: 0,
        maintenanceRooms: 0,
      },
    });
  } catch (error) {
    console.error("createBuilding error:", error);

    /*
     * Nếu đã tạo Building nhưng tạo danh sách Room thất bại,
     * xóa Building để tránh tòa nhà không có đủ phòng.
     */
    if (createdBuilding?._id) {
      try {
        await Room.deleteMany({
          building: createdBuilding._id,
        });

        await Building.findByIdAndDelete(createdBuilding._id);
      } catch (rollbackError) {
        console.error(
          "createBuilding rollback error:",
          rollbackError,
        );
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Tên tòa nhà đã tồn tại",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo tòa nhà",
      error: error.message,
    });
  }
};

/**
 * Xóa tòa nhà và tất cả phòng liên quan.
 */
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

    /*
     * Không chỉ kiểm tra status vì dữ liệu cũ có thể bị lệch status.
     * Kiểm tra trực tiếp phòng có sinh viên.
     */
    const roomsHavingStudents = await Room.countDocuments({
      building: id,
      "students.0": {
        $exists: true,
      },
    });

    if (roomsHavingStudents > 0) {
      return res.status(400).json({
        success: false,
        message:
          `Không thể xóa tòa nhà "${building.name}" vì còn ` +
          `${roomsHavingStudents} phòng đang có sinh viên`,
      });
    }

    await Room.deleteMany({
      building: id,
    });

    await Building.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        `Đã xóa tòa nhà "${building.name}" ` +
        "và tất cả phòng liên quan",
    });
  } catch (error) {
    console.error("deleteBuilding error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa tòa nhà",
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách phòng theo tòa nhà.
 * Có thể lọc theo tầng bằng query: ?floor=1
 */
const getRoomsByBuilding = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const { floor } = req.query;

    const building = await Building.findById(buildingId);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tòa nhà",
      });
    }

    const query = {
      building: buildingId,
    };

    if (floor !== undefined && floor !== "") {
      const parsedFloor = parsePositiveInteger(floor);

      if (
        parsedFloor === null ||
        parsedFloor < 1 ||
        parsedFloor > building.totalFloors
      ) {
        return res.status(400).json({
          success: false,
          message: `Tầng phải từ 1 đến ${building.totalFloors}`,
        });
      }

      query.floor = parsedFloor;
    }

    const rooms = await Room.find(query)
      .sort({
        floor: 1,
        roomNumber: 1,
      })
      .populate("building", "name totalFloors totalRoomsPerFloor")
      .populate(
        "students.student",
        "fullName email studentCode phone gender",
      );

    const formattedRooms = rooms.map((room) =>
      formatRoomStudents(room),
    );

    return res.status(200).json({
      success: true,
      data: formattedRooms,
      building,
    });
  } catch (error) {
    console.error("getRoomsByBuilding error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách phòng",
      error: error.message,
    });
  }
};

/**
 * Xem chi tiết phòng.
 */
const getRoomDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id)
      .populate(
        "building",
        "name totalFloors totalRoomsPerFloor",
      )
      .populate(
        "students.student",
        [
          "fullName",
          "email",
          "studentCode",
          "phone",
          "gender",
          "major",
          "dateOfBirth",
        ].join(" "),
      );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatRoomStudents(room),
    });
  } catch (error) {
    console.error("getRoomDetail error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin phòng",
      error: error.message,
    });
  }
};

/**
 * Cập nhật trạng thái hoặc sức chứa của phòng.
 */
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, capacity } = req.body;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    if (capacity !== undefined) {
      const parsedCapacity = parsePositiveInteger(capacity);

      if (
        parsedCapacity === null ||
        parsedCapacity < 1 ||
        parsedCapacity > 20
      ) {
        return res.status(400).json({
          success: false,
          message: "Sức chứa phải là số nguyên từ 1 đến 20",
        });
      }

      if (parsedCapacity < room.students.length) {
        return res.status(400).json({
          success: false,
          message:
            `Không thể giảm sức chứa xuống ${parsedCapacity} ` +
            `vì phòng đang có ${room.students.length} sinh viên`,
        });
      }

      room.capacity = parsedCapacity;
    }

    if (status !== undefined) {
      const validStatuses = [
        "available",
        "occupied",
        "maintenance",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái phòng không hợp lệ",
        });
      }

      if (status === "maintenance") {
        if (room.students.length > 0) {
          return res.status(400).json({
            success: false,
            message:
              "Không thể chuyển phòng đang có người sang bảo trì",
          });
        }

        room.status = "maintenance";
      } else {
        /*
         * available và occupied được xác định tự động
         * theo số sinh viên hiện tại.
         */
        room.status =
          room.students.length > 0
            ? "occupied"
            : "available";
      }
    } else if (room.status !== "maintenance") {
      room.status =
        room.students.length > 0
          ? "occupied"
          : "available";
    }

    room.currentOccupants = room.students.length;

    await room.save();

    const updatedRoom = await Room.findById(id)
      .populate(
        "building",
        "name totalFloors totalRoomsPerFloor",
      )
      .populate(
        "students.student",
        "fullName email studentCode phone gender",
      );

    return res.status(200).json({
      success: true,
      message: "Cập nhật phòng thành công",
      data: formatRoomStudents(updatedRoom),
    });
  } catch (error) {
    console.error("updateRoom error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật phòng",
      error: error.message,
    });
  }
};

/**
 * Thêm sinh viên vào phòng.
 */
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

    if (room.status === "maintenance") {
      return res.status(400).json({
        success: false,
        message: "Không thể thêm sinh viên vào phòng đang bảo trì",
      });
    }

    const student = await User.findById(studentId);

    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên",
      });
    }

    if (room.students.length >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Phòng đã đầy (${room.students.length}/${room.capacity})`,
      });
    }

    const isStudentInCurrentRoom = room.students.some(
      (item) =>
        item.student &&
        item.student.toString() === studentId.toString(),
    );

    if (isStudentInCurrentRoom) {
      return res.status(400).json({
        success: false,
        message: "Sinh viên đã ở trong phòng này",
      });
    }

    const existingRoom = await Room.findOne({
      "students.student": studentId,
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message:
          `Sinh viên đang ở phòng ${existingRoom.displayName}. ` +
          "Vui lòng xóa khỏi phòng cũ trước.",
      });
    }

    const occupiedBeds = room.students.map(
      (item) => item.bedNumber,
    );

    let availableBedNumber = null;

    for (
      let bedNumber = 1;
      bedNumber <= room.capacity;
      bedNumber++
    ) {
      if (!occupiedBeds.includes(bedNumber)) {
        availableBedNumber = bedNumber;
        break;
      }
    }

    if (availableBedNumber === null) {
      return res.status(400).json({
        success: false,
        message: "Không còn giường trống trong phòng",
      });
    }

    room.students.push({
      student: studentId,
      bedNumber: availableBedNumber,
    });

    room.currentOccupants = room.students.length;
    room.status = "occupied";

    await room.save();

    student.roomId = room._id;
    student.buildingId = room.building;

    await student.save();

    /*
     * Tạo booking tự động nếu sinh viên chưa có booking đang hoạt động.
     *
     * Có thể thay semester bằng học kỳ đang hoạt động
     * nếu dự án có collection Semester.
     */
    const existingBooking = await Booking.findOne({
      studentId,
      status: {
        $in: ["pending", "confirmed", "checked_in"],
      },
    });

    if (!existingBooking) {
      const now = new Date();
      const endDate = new Date(now);

      endDate.setMonth(endDate.getMonth() + 4);

      await Booking.create({
        studentId,
        roomId: room._id,
        semester: "Summer 2026",
        startDate: now,
        endDate,
        status: "confirmed",
        checkInDate: now,
      });
    }

    const updatedRoom = await Room.findById(id)
      .populate(
        "building",
        "name totalFloors totalRoomsPerFloor",
      )
      .populate(
        "students.student",
        [
          "fullName",
          "email",
          "studentCode",
          "phone",
          "gender",
          "major",
          "dateOfBirth",
        ].join(" "),
      );

    return res.status(200).json({
      success: true,
      message: "Thêm sinh viên vào phòng thành công",
      data: formatRoomStudents(updatedRoom),
    });
  } catch (error) {
    console.error("assignStudent error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi thêm sinh viên vào phòng",
      error: error.message,
    });
  }
};

/**
 * Xóa sinh viên khỏi phòng.
 */
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

    const studentIndex = room.students.findIndex(
      (item) =>
        item.student &&
        item.student.toString() === studentId.toString(),
    );

    if (studentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Sinh viên không ở trong phòng này",
      });
    }

    room.students.splice(studentIndex, 1);
    room.currentOccupants = room.students.length;

    if (room.status !== "maintenance") {
      room.status =
        room.students.length > 0
          ? "occupied"
          : "available";
    }

    await room.save();

    const student = await User.findById(studentId);

    if (student) {
      student.roomId = null;
      student.buildingId = null;

      await student.save();
    }

    /*
     * Không nên delete booking vì dữ liệu này được dùng
     * để hiển thị lịch sử phòng.
     *
     * Cập nhật ngày checkout cho booking đang hoạt động.
     */
    const activeBooking = await Booking.findOne({
      studentId,
      roomId: id,
      status: {
        $in: ["pending", "confirmed", "checked_in"],
      },
    }).sort({
      createdAt: -1,
    });

    if (activeBooking) {
      activeBooking.checkOutDate = new Date();

      /*
       * Chỉ bật dòng dưới nếu Booking model có status "checked_out".
       *
       * activeBooking.status = "checked_out";
       */

      await activeBooking.save();
    }

    const updatedRoom = await Room.findById(id)
      .populate(
        "building",
        "name totalFloors totalRoomsPerFloor",
      )
      .populate(
        "students.student",
        [
          "fullName",
          "email",
          "studentCode",
          "phone",
          "gender",
          "major",
          "dateOfBirth",
        ].join(" "),
      );

    return res.status(200).json({
      success: true,
      message: "Xóa sinh viên khỏi phòng thành công",
      data: formatRoomStudents(updatedRoom),
    });
  } catch (error) {
    console.error("removeStudent error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa sinh viên khỏi phòng",
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách sinh viên chưa được gán phòng.
 */
const getAvailableStudents = async (req, res) => {
  try {
    const { search } = req.query;

    const roomsWithStudents = await Room.find({
      "students.0": {
        $exists: true,
      },
    }).select("students.student");

    const assignedStudentIds = roomsWithStudents.flatMap(
      (room) =>
        room.students
          .filter((item) => item.student)
          .map((item) => item.student),
    );

    const query = {
      role: "student",
    };

    if (assignedStudentIds.length > 0) {
      query._id = {
        $nin: assignedStudentIds,
      };
    }

    if (search && String(search).trim()) {
      const keyword = String(search)
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.$or = [
        {
          fullName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          studentCode: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          email: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    const students = await User.find(query)
      .select(
        "fullName email studentCode phone gender major",
      )
      .limit(20)
      .sort({
        fullName: 1,
      });

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("getAvailableStudents error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách sinh viên",
      error: error.message,
    });
  }
};

/**
 * Khởi tạo mặc định 4 tòa A, B, C, D.
 * Mỗi tòa có 5 tầng, mỗi tầng có 14 phòng.
 */
const seedBuildings = async (req, res) => {
  const createdBuildingIds = [];

  try {
    const existingCount = await Building.countDocuments();

    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          `Đã có ${existingCount} tòa nhà trong hệ thống. ` +
          "Không cần khởi tạo.",
      });
    }

    const buildingNames = ["A", "B", "C", "D"];
    const defaultTotalFloors = 5;
    const defaultRoomsPerFloor = 14;
    const results = [];

    for (const buildingName of buildingNames) {
      const building = await Building.create({
        name: buildingName,
        description: `Tòa nhà ${buildingName}`,
        totalFloors: defaultTotalFloors,
        totalRoomsPerFloor: defaultRoomsPerFloor,
      });

      createdBuildingIds.push(building._id);

      const rooms = [];

      for (
        let floor = 1;
        floor <= defaultTotalFloors;
        floor++
      ) {
        for (
          let roomIndex = 1;
          roomIndex <= defaultRoomsPerFloor;
          roomIndex++
        ) {
          const roomNumber = generateRoomNumber(
            buildingName,
            floor,
            roomIndex,
          );

          rooms.push({
            building: building._id,
            floor,
            roomNumber,
            displayName:
              `Tòa ${buildingName} - ` +
              `Tầng ${floor} - ` +
              `Phòng ${roomNumber}`,
            status: "available",
            capacity: 4,
            currentOccupants: 0,
            students: [],
          });
        }
      }

      await Room.insertMany(rooms);

      results.push({
        buildingId: building._id,
        building: buildingName,
        totalFloors: defaultTotalFloors,
        totalRoomsPerFloor: defaultRoomsPerFloor,
        roomsCreated: rooms.length,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Khởi tạo thành công 4 tòa A, B, C, D",
      data: results,
    });
  } catch (error) {
    console.error("seedBuildings error:", error);

    /*
     * Rollback dữ liệu đã seed nếu xảy ra lỗi giữa chừng.
     */
    if (createdBuildingIds.length > 0) {
      try {
        await Room.deleteMany({
          building: {
            $in: createdBuildingIds,
          },
        });

        await Building.deleteMany({
          _id: {
            $in: createdBuildingIds,
          },
        });
      } catch (rollbackError) {
        console.error(
          "seedBuildings rollback error:",
          rollbackError,
        );
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Dữ liệu tòa nhà đã tồn tại",
      });
    }

    return res.status(500).json({
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