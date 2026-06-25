// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//       dbName: 'WDP_G6',
//     });

//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (err) {
//     console.error("Loi ket noi MongoDB:", err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("ket noi thanh cong");
  } catch (err) {
    console.error("Loi ket noi MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;