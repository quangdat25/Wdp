const mongoose = require("mongoose");
const Booking = require("./src/models/booking.model");

async function run() {
  await mongoose.connect("mongodb://localhost:27017/WDP");
  const bookings = await Booking.find({ semester: 'SU26' });
  console.log("Bookings for SU26:", bookings.length);
  bookings.forEach(b => {
    console.log(`- Room: ${b.roomId}, Bed: ${b.bedNumber}, Student: ${b.studentId}, Status: ${b.status}`);
  });
  process.exit(0);
}
run();
