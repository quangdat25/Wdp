  const express = require("express");
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
  const autoCheckInBookings = require("./jobs/checkIn.job");
  const autoCheckOutBookings = require("./jobs/checkOut.job");

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
  // abc
  connectDB();

  app.get("/", (req, res) => {
    return res.json({
      message: "ok",
      metadata: { message: "ok" },
    });
  });

  app.get("/healthz", (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Server is running",
    });
  });

  routes(app);

  app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message });
  });

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  initSocket(server);
  autoCheckInBookings();
  autoCheckOutBookings();