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

const autoCheckInBookings = () => {
  cron.schedule(
    // Chạy sau checkout 1 phút để tránh đụng cùng lúc
    "1 0 * * *",
    async () => {
      try {
        const now = new Date();
        const todayVN = getVNDateString(now);

        const bookings = await Booking.find({
          status: "confirmed",
        });

        const matchedBookings = bookings.filter((booking) => {
          const startDateVN = getVNDateString(booking.startDate);
          return startDateVN <= todayVN;
        });

        console.log("Today VN:", todayVN);
        console.log("Matched check-in bookings:", matchedBookings.length);

        for (const booking of matchedBookings) {
          const room = await Room.findById(booking.roomId);
          if (!room) continue;

          await Room.updateOne(
            {
              _id: booking.roomId,
              "students.student": { $ne: booking.studentId },
            },
            {
              $push: {
                students: {
                  student: booking.studentId,
                  bedNumber: booking.bedNumber,
                },
              },
            },
          );

          await updateRoomOccupancyAndStatus(booking.roomId);

          await Booking.updateOne(
            {
              _id: booking._id,
              status: "confirmed",
            },
            {
              $set: {
                status: "checked_in",
              },
            },
          );
        }

        console.log("Auto check-in bookings done");
      } catch (error) {
        console.error("Auto check-in bookings error:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    },
  );
};

module.exports = autoCheckInBookings;
