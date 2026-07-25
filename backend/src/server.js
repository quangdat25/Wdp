  const express = require("express");
  const mongoose = require("mongoose");
  const app = express();

  require("dotenv").config();
  const bodyParser = require("body-parser");
  const cookieParser = require("cookie-parser");
  const cors = require("cors");
  const { initSocket } = require("./socket");
  // connect db
  const connectDB = require("./config/connectDB");
  const routes = require("./routes/index.routes");

  const port = process.env.PORT || 3000;
  const autoCheckInBookings = require("./config/checkIn.job");
  const autoCheckOutBookings = require("./config/checkOut.job");
  const autoDeleteExpiredBookings = require("./config/bookingExpiration.job");

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );
  app.use(cookieParser());
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    }),
  );

  app.get("/", (req, res) => {
    return res.json({
      message: "ok",
      metadata: { message: "ok" },
    });
  });

  app.get("/healthz", (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    return res.status(isDbConnected ? 200 : 500).json({
      success: isDbConnected,
      message: isDbConnected ? "Server and Database are healthy" : "Database is not connected",
      databaseState: mongoose.connection.readyState,
    });
  });

  routes(app);

  app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message });
  });

  const startServer = async () => {
    await connectDB();

    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    initSocket(server);
    autoCheckInBookings();
    autoCheckOutBookings();
    autoDeleteExpiredBookings();
  };

  startServer();