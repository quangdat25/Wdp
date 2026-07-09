const Room = require("../models/room.models");

class RoomRepository {
  async findById(id) {
    return await Room.findById(id);
  }

  async findOne(query) {
    return await Room.findOne(query);
  }

  async findAvailableRooms(query) {
    return await Room.find(query)
      .sort({ floor: 1, roomNumber: 1 })
      .populate("building", "name")
      .populate("students.student", "fullName studentCode gender");
  }

  async findByIdWithPopulation(id) {
    return await Room.findById(id)
      .populate("building", "name")
      .populate("students.student", "fullName studentCode gender");
  }
}

module.exports = new RoomRepository();
