const cron = require("node-cron");
const Booking = require("../models/booking.model");
const Room = require("../models/room.models");

const getVNDateString = (date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const updateRoomOccupancyAndStatus = async (roomId) => {
  const room = await Room.findById(roomId).select("students capacity status");

  if (!room) {
    console.log(`Không tìm thấy phòng: ${roomId}`);
    return;
  }

  const currentOccupants = room.students.length;

  let newStatus;

  if (room.status === "maintenance") {
    newStatus = "maintenance";
  } else {
    newStatus = currentOccupants > 0 ? "occupied" : "available";
  }

  await Room.updateOne(
    { _id: roomId },
    {
      $set: {
        currentOccupants,
        status: newStatus,
      },
    },
  );
};
const autoCheckOutBookings = () => {
  cron.schedule(
    // Chạy lúc 00:00 mỗi ngày
    "0 0 * * *",
    async () => {
      try {
        const now = new Date();
        const todayVN = getVNDateString(now);

        const bookings = await Booking.find({
          status: "checked_in",
        });

        const matchedBookings = bookings.filter((booking) => {
          const endDateVN = getVNDateString(booking.endDate);
          return endDateVN < todayVN;
        });

        console.log("Today VN:", todayVN);
        console.log("Matched check-out bookings:", matchedBookings.length);

        for (const booking of matchedBookings) {
          const room = await Room.findById(booking.roomId);
          if (!room) continue;

          await Room.updateOne(
            { _id: booking.roomId },
            {
              $pull: {
                students: {
                  student: booking.studentId,
                },
              },
            },
          );

          await updateRoomOccupancyAndStatus(booking.roomId);

          await Booking.updateOne(
            {
              _id: booking._id,
              status: "checked_in",
            },
            {
              $set: {
                status: "checked_out",
              },
            },
          );
        }

        console.log("Auto check-out bookings done");
      } catch (error) {
        console.error("Auto check-out bookings error:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    },
  );
};

module.exports = autoCheckOutBookings;
