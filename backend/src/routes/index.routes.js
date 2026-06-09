const roomRoutes = require("./room.routes");
const authRoutes = require("./auth.routes");

function routes(app) {
  app.use("/api/auth", authRoutes);
  app.use("/api/room", roomRoutes);
}

module.exports = routes;