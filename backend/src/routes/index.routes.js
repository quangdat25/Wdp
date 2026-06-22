const studentRoutes = require("./student.routes");
const personnelRoutes = require("./personnel.routes");
const userRoutes = require("./user.routes");
const roomRoutes = require("./room.routes");
const notificationRoutes = require("./notification.routes");
const violationRoutes = require("./violation.routes");
const ticketRoutes = require("./ticket.routes");
const uploadRoutes = require("./uploadImage.routes");
const ticketManagementRoutes = require("./ticketManagement.routes");

function routes(app) {
  app.use("/api/students", studentRoutes);
  app.use("/api/personnel", personnelRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api", roomRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/violations", violationRoutes);
  app.use("/api/ticket-management", ticketManagementRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/upload-image", uploadRoutes);
}

module.exports = routes;
