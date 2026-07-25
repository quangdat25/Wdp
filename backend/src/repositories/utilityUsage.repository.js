const mongoose = require("mongoose");

const UtilityUsage = require("../models/utilityUsage.model");
const Room = require("../models/room.models");
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

      const studentCount = await Booking.countDocuments({
        roomId: booking.roomId._id,
        semester: booking.semester,
        studentId: {
          $ne: null,
        },
        status: {
          $in: ["confirmed", "checked_in"],
        },
      });

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
        const safeStudentCount = Math.max(1, studentCount);

        const studentElectricity = Math.round(
          Number(usage.electricityAmount || 0) / safeStudentCount,
        );

        const studentWater = Math.round(
          Number(usage.waterAmount || 0) / safeStudentCount,
        );

        results.push({
          ...usage,

          bookingId: booking._id,
          bookingStatus: booking.status,
          bookingStartDate: booking.startDate,
          bookingEndDate: booking.endDate,

          studentCount: safeStudentCount,

          roomAmount: {
            electricity: Number(usage.electricityAmount || 0),
            water: Number(usage.waterAmount || 0),
            total:
              Number(usage.electricityAmount || 0) +
              Number(usage.waterAmount || 0),
          },

          studentAmount: {
            electricity: studentElectricity,
            water: studentWater,
            total: studentElectricity + studentWater,
          },

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

  async findUsageByRoomSemesterAndMonth(roomId, semester, billingMonth) {
    return UtilityUsage.findOne({
      roomId,
      semester: String(semester).trim(),
      month: Number(billingMonth),
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

  async findExistingUtilityInvoice({
    bookingId,
    studentId,
    semester,
    billingMonth,
  }) {
    return Invoice.findOne({
      bookingId,
      studentId,
      type: "utility",
      semester: String(semester).trim(),
      billingMonth: Number(billingMonth),
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
