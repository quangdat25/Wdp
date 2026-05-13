const roomRoutes = require("./room.routes");

function routes(app) {
  app.use("/api/room", roomRoutes);
}

module.exports = routes;
