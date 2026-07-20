const mongoose = require("mongoose");
const Room = require("../src/models/room.models");
const Booking = require("../src/models/booking.model");
const Semester = require("../src/models/semester.model");
const SystemConfig = require("../src/models/systemConfig.model");
require("dotenv").config();

async function seedMissingBookings() {
  try {
    // 1. Kết nối DB
    const dbUrl = "mongodb://localhost:27017/WDP";
    await mongoose.connect(dbUrl);
    console.log("Đã kết nối Database");

    let startDate = new Date("2026-04-30T17:00:00.000Z");
    let endDate = new Date("2026-08-31T16:59:59.999Z");

    // 3. Tìm tất cả các phòng đang có người ở (mảng students có data)
    const rooms = await Room.find({ "students.0": { $exists: true } });
    console.log(`Tìm thấy ${rooms.length} phòng đang có sinh viên.`);

    let countAdded = 0;

    const semestersToSeed = [
      { code: "SP26", start: "2025-12-31T17:00:00.000Z", end: "2026-04-30T16:59:59.999Z", status: "checked_out" },
      { code: "SU26", start: "2026-04-30T17:00:00.000Z", end: "2026-08-31T16:59:59.999Z", status: "checked_in" },
      { code: "Fall 2026", start: "2026-08-31T17:00:00.000Z", end: "2026-12-31T16:59:59.999Z", status: "confirmed" }
    ];

    for (const room of rooms) {
      for (const studentInfo of room.students) {
        if (!studentInfo.student) continue;

        for (const sem of semestersToSeed) {
          // Kiểm tra xem sinh viên này đã có Booking ở kỳ này chưa
          const existingBooking = await Booking.findOne({
            roomId: room._id,
            studentId: studentInfo.student,
            semester: sem.code
          });

          if (!existingBooking) {
            // Tạo booking mới bypass validation
            await Booking.collection.insertOne({
              studentId: new mongoose.Types.ObjectId(studentInfo.student),
              roomId: room._id,
              bedNumber: studentInfo.bedNumber,
              semester: sem.code,
              startDate: new Date(sem.start),
              endDate: new Date(sem.end),
              status: sem.status,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            console.log(`Đã tạo bù Booking (${sem.code}) cho sinh viên ${studentInfo.student} tại phòng ${room.displayName}`);
            countAdded++;
          }
        }
      }
    }

    console.log(`\n✅ HOÀN TẤT! Đã tạo thành công ${countAdded} bản ghi Booking bị thiếu cho tất cả các kỳ.`);
    process.exit(0);

  } catch (error) {
    console.error("Lỗi trong quá trình seed:", error);
    process.exit(1);
  }
}

seedMissingBookings();
