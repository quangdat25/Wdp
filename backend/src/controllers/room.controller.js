const Room = require("../models/room.model");

// Lấy tất cả phòng
exports.getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách phòng thành công",
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết phòng
exports.getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết phòng thành công",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// Tạo phòng mới
exports.createRoom = async (req, res, next) => {
  try {
    const { name, building, floor, capacity, price, amenities, description } =
      req.body;

    // Validate required fields
    if (!name || !building || floor === undefined || !capacity || !price) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tất cả các trường bắt buộc",
      });
    }

    const newRoom = new Room({
      name,
      building,
      floor,
      capacity,
      price,
      amenities: Array.isArray(amenities)
        ? amenities
        : amenities
          ? amenities.split(",").map((a) => a.trim())
          : [],
      description,
    });

    const savedRoom = await newRoom.save();

    return res.status(201).json({
      success: true,
      message: "Tạo phòng thành công",
      data: savedRoom,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật phòng
exports.updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      building,
      floor,
      capacity,
      price,
      amenities,
      status,
      description,
    } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    // Update fields
    if (name) room.name = name;
    if (building) room.building = building;
    if (floor !== undefined) room.floor = floor;
    if (capacity) room.capacity = capacity;
    if (price) room.price = price;
    if (amenities) {
      room.amenities = Array.isArray(amenities)
        ? amenities
        : amenities.split(",").map((a) => a.trim());
    }
    if (status) room.status = status;
    if (description) room.description = description;

    const updatedRoom = await room.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật phòng thành công",
      data: updatedRoom,
    });
  } catch (error) {
    next(error);
  }
};

// Xóa phòng
exports.deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    const room = await Room.findByIdAndDelete(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa phòng thành công",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};
