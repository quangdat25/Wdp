// const roomRoutes = require("./room.routes");
// const authRoutes = require("./auth.routes");
const studentRoutes = require("./student.routes");
const personnelRoutes = require("./personnel.routes");
function routes(app) {
  // app.use("/api/auth", authRoutes);
  // app.use("/api/room", roomRoutes);
  app.use("/api/students", studentRoutes);
  app.use("/api/personnel", personnelRoutes);
}

module.exports = routes;