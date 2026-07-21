const mongoose = require("mongoose");

const UtilityUsage = require("../models/utilityUsage.model");
const Room = require("../models/room.models");
const Building = require("../models/building.model");
const Booking = require("../models/booking.model");
const Invoice = require("../models/invoice.model");
const User = require("../models/user.model");
const SystemConfig = require("../models/systemConfig.model");

class UtilityUsageRepository {
  async findActiveSystemConfig() {
    return SystemConfig.findOne({
      status: "active",
    }).lean();
  }

  async findRoomByImportInfo({ floor, roomNumber }) {
    return Room.findOne({
      floor: Number(floor),
      roomNumber: String(roomNumber).trim(),
    }).populate("building");
  }

  async upsertUtilityUsage(filter, data) {
    const existed = await UtilityUsage.findOne(filter);

    if (existed) {
      return {
        record: existed,
        action: "existed",
      };
    }

    const record = await UtilityUsage.create(data);

    return {
      record,
      action: "created",
    };
  }

  async findAll(filter = {}) {
    return UtilityUsage.find(filter)
      .populate({
        path: "roomId",
        populate: {
          path: "building",
          select: "name buildingName displayName",
        },
      })
      .populate("importedBy", "fullName username email role")
      .sort({ year: -1, month: -1, createdAt: -1 });
  }

  async findById(id) {
    return UtilityUsage.findById(id).populate({
      path: "roomId",
      populate: {
        path: "building",
        select: "name buildingName displayName",
      },
    });
  }
  async findByStudentId(studentId) {
    const bookings = await Booking.find({
      studentId,
      status: {
        $in: ["confirmed", "checked_in", "checked_out"],
      },
    })
      .select("_id roomId semester startDate endDate status")
      .populate({
        path: "roomId",
        select: "roomNumber floor building",
        populate: {
          path: "building",
          select: "name buildingName displayName",
        },
      })
      .lean();

    if (!bookings.length) {
      return [];
    }

    const results = [];

    for (const booking of bookings) {
      if (!booking.roomId) {
        continue;
      }

      const usages = await UtilityUsage.find({
        roomId: booking.roomId._id,
        semester: booking.semester,
      })
        .sort({
          year: -1,
          month: -1,
        })
        .lean();

      for (const usage of usages) {
        results.push({
          ...usage,

          bookingId: booking._id,

          bookingStatus: booking.status,

          bookingStartDate: booking.startDate,
          bookingEndDate: booking.endDate,

          room: {
            _id: booking.roomId._id,
            roomNumber: booking.roomId.roomNumber,
            floor: booking.roomId.floor,

            building:
              booking.roomId.building?.name ||
              booking.roomId.building?.buildingName ||
              booking.roomId.building?.displayName ||
              "",
          },
        });
      }
    }

    return results.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }

      return b.month - a.month;
    });
  }
  async deleteById(id) {
    return UtilityUsage.findByIdAndDelete(id);
  }

  async findUsagesByRoomAndSemester(roomId, semester) {
    return UtilityUsage.find({
      roomId,
      semester,
    }).sort({
      year: 1,
      month: 1,
    });
  }

  async findConfirmedBookingsBySemester(semester) {
    return Booking.find({
      semester,
      status: {
        $in: ["confirmed", "checked_in"],
      },
      studentId: {
        $ne: null,
      },
    }).populate({
      path: "roomId",
      select: "roomNumber floor building",
      populate: {
        path: "building",
        select: "name buildingName displayName",
      },
    });
  }

  async countStudentsInRoomBySemester(roomId, semester) {
    return Booking.countDocuments({
      roomId,
      semester,
      studentId: {
        $ne: null,
      },
      status: {
        $in: ["confirmed", "checked_in"],
      },
    });
  }

  async findStudentById(studentId) {
    return User.findOne({
      _id: studentId,
      role: "student",
    }).select("fullName username email studentCode role");
  }

  async findExistingUtilityInvoice(bookingId, studentId) {
    return Invoice.findOne({
      bookingId,
      studentId,
      type: "utility",
    });
  }

  async createInvoice(data) {
    return Invoice.create(data);
  }

  async findRoomByBuildingFloorAndNumber({ buildingName, floor, roomNumber }) {
    return Room.findOne({
      floor,
      roomNumber,
    }).populate({
      path: "building",
      match: {
        name: buildingName,
      },
    });
  }
}

module.exports = new UtilityUsageRepository();
