const mongoose = require("mongoose");
async function run() {
  await mongoose.connect("mongodb://localhost:27017/WDP");
  const res = await mongoose.connection.collection("bookings").deleteMany({
    semester: "Fall 2026",
    bedNumber: { $ne: 1 }
  });
  console.log("Deleted", res.deletedCount, "dummy future bookings");
  process.exit(0);
}
run();
