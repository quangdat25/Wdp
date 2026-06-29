const studentRoutes = require("./student.routes");
const personnelRoutes = require("./personnel.routes");
const userRoutes = require("./user.routes");
const roomRoutes = require("./room.routes");

function routes(app) {
  app.use("/api/students", studentRoutes);
  app.use("/api/personnel", personnelRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api", roomRoutes);
}

module.exports = routes;
