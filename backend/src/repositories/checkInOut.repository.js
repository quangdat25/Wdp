const Booking = require("../models/booking.model");
const Room = require("../models/room.models");

class CheckInOutRepository {
  async findRoomsByBuildingId(buildingId) {
    return Room.find({
      building: buildingId,
    }).select("_id");
  }

  async findBookingsByRoomIds(roomIds, status) {
    const filter = {
      roomId: {
        $in: roomIds,
      },
    };

    if (status) {
      filter.status = status;
    } else {
      filter.status = {
        $in: ["confirmed", "checked_in"],
      };
    }

    return Booking.find(filter)
      .populate(
        "studentId",
        "fullName email studentCode phone gender",
      )
      .populate({
        path: "roomId",
        select:
          "displayName roomNumber floor building capacity currentOccupants status students price",
        populate: {
          path: "building",
          select: "name code address",
        },
      })
      .sort({
        startDate: 1,
      });
  }

  async findBookingById(bookingId) {
    return Booking.findById(bookingId)
      .populate(
        "studentId",
        "fullName email studentCode phone gender",
      )
      .populate({
        path: "roomId",
        select:
          "displayName roomNumber floor building capacity currentOccupants status students price",
        populate: {
          path: "building",
          select: "name code address",
        },
      });
  }

  async addStudentToRoom({
    roomId,
    buildingId,
    studentId,
    bedNumber,
  }) {
    return Room.updateOne(
      {
        _id: roomId,
        building: buildingId,
        "students.student": {
          $ne: studentId,
        },
      },
      {
        $push: {
          students: {
            student: studentId,
            bedNumber,
          },
        },
      },
    );
  }

  async removeStudentFromRoom({
    roomId,
    buildingId,
    studentId,
  }) {
    return Room.updateOne(
      {
        _id: roomId,
        building: buildingId,
        "students.student": studentId,
      },
      {
        $pull: {
          students: {
            student: studentId,
          },
        },
      },
    );
  }

  async updateRoomOccupancyAndStatus(roomId) {
    const room = await Room.findById(roomId).select(
      "students capacity status",
    );

    if (!room) {
      return null;
    }

    const currentOccupants = room.students.length;

    let newStatus;

    if (room.status === "maintenance") {
      newStatus = "maintenance";
    } else {
      newStatus =
        currentOccupants > 0
          ? "occupied"
          : "available";
    }

    await Room.updateOne(
      {
        _id: roomId,
      },
      {
        $set: {
          currentOccupants,
          status: newStatus,
        },
      },
    );

    return {
      currentOccupants,
      status: newStatus,
    };
  }

  async updateBookingStatus({
    bookingId,
    currentStatus,
    newStatus,
    staffId,
  }) {
    const updateData = {
      status: newStatus,
    };

    if (newStatus === "checked_in") {
      updateData.checkInDate = new Date();
      updateData.checkedInBy = staffId;
    }

    if (newStatus === "checked_out") {
      updateData.checkOutDate = new Date();
      updateData.checkedOutBy = staffId;
    }

    return Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: currentStatus,
      },
      {
        $set: updateData,
      },
      {
        new: true,
      },
    )
      .populate(
        "studentId",
        "fullName email studentCode phone gender",
      )
      .populate({
        path: "roomId",
        select:
          "displayName roomNumber floor building capacity currentOccupants status students price",
        populate: {
          path: "building",
          select: "name code address",
        },
      });
  }
}

module.exports = new CheckInOutRepository();