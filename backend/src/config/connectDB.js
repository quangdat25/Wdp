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
    if (!process.env.MONGODB_URI) {
      console.error("Lỗi: MONGODB_URI chưa được khai báo trong file .env!");
      process.exit(1);
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (err) {
    console.error("Lỗi kết nối MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;