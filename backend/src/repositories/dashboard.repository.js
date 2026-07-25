const User = require("../models/user.model");
const Room = require("../models/room.models");
const Building = require("../models/building.model");
const Ticket = require("../models/ticket.model");
const Booking = require("../models/booking.model");
const Invoice = require("../models/invoice.model");
const Notification = require("../models/notification.model");
const Student = require("../models/student.model");

class DashboardRepository {
  countStudents() {
    return User.countDocuments({ role: "student" });
  }

  countAllRooms() {
    return Room.countDocuments();
  }

  countRoomsByStatus(status) {
    return Room.countDocuments({
      status: { $in: [status, status.toLowerCase(), status.toUpperCase()] },
    });
  }

  async countPendingTickets() {
    const count = await Ticket.countDocuments({
      status: { $in: ["pending", "PENDING", "assigned", "in_progress", "open", "OPEN"] },
    });
    if (count > 0) return count;
    return Room.countDocuments({
      status: { $in: ["maintenance", "MAINTENANCE"] },
    });
  }

  getMonthlyRevenue() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Invoice.aggregate([
      {
        $match: {
          status: "paid",
          $or: [
            { paidAt: { $gte: startOfMonth, $lt: startOfNextMonth } },
            { createdAt: { $gte: startOfMonth, $lt: startOfNextMonth } },
          ],
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);
  }

  async get12MonthRevenueSeries() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const results = await Invoice.aggregate([
      {
        $match: {
          status: "paid",
          $or: [
            { paidAt: { $gte: start } },
            { createdAt: { $gte: start } },
          ],
        },
      },
      {
        $group: {
          _id: {
            year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } },
            month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } },
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const revenueMap = {};
    results.forEach((r) => {
      const key = `${r._id.year}-${r._id.month}`;
      revenueMap[key] = r.total;
    });

    const series = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${month}`;
      series.push({
        label: `T${month}`,
        value: revenueMap[key] || 0,
      });
    }
    return series;
  }

  getOccupancySeries() {
    const totalRooms = Room.countDocuments();
    const occupiedRooms = Room.countDocuments({ status: "occupied" });
    const allActiveBookings = Booking.find({
      status: { $in: ["checked_in", "confirmed", "checked_out"] },
    })
      .select("checkInDate createdAt status")
      .sort({ createdAt: 1 })
      .lean();
    return { totalRooms, occupiedRooms, allActiveBookings };
  }

  getBuildingsWithStats() {
    return Building.find().sort({ name: 1 }).lean();
  }

  countRoomsByBuilding(buildingId) {
    return Room.countDocuments({ building: buildingId });
  }

  countOccupiedRoomsByBuilding(buildingId) {
    return Room.countDocuments({ building: buildingId, status: "occupied" });
  }

  countMaintenanceRoomsByBuilding(buildingId) {
    return Room.countDocuments({
      building: buildingId,
      status: { $in: ["maintenance", "MAINTENANCE"] },
    });
  }

  async getBuildingBedStats(buildingId) {
    const result = await Room.aggregate([
      { $match: { building: buildingId } },
      { 
        $group: { 
          _id: null, 
          totalBeds: { $sum: "$capacity" }, 
          occupiedBeds: { $sum: "$currentOccupants" } 
        } 
      }
    ]);
    if (result.length > 0) return result[0];
    return { totalBeds: 0, occupiedBeds: 0 };
  }

  countPendingBookings() {
    return Booking.countDocuments({ status: "pending" });
  }

  countMaintenanceRooms() {
    return Room.countDocuments({
      status: { $in: ["maintenance", "MAINTENANCE"] },
    });
  }

  countTotalPersonnel() {
    return User.countDocuments({ role: { $in: ["staff", "manager"] } });
  }

  countActivePersonnel() {
    return User.countDocuments({ role: { $in: ["staff", "manager"] }, status: "active" });
  }

  // Notifications sent by admin/manager, targeting all or student/parent roles
  getRecentNotifications() {
    return Notification.find({
      $or: [
        { targetType: "all" },
        { targetType: "roles", targetRoles: { $in: ["student", "parent"] } },
      ],
      senderId: { $ne: null },
    })
      .populate("senderId", "fullName role")
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
  }

  getBookingRequests() {
    return Booking.find({ status: { $in: ["pending", "confirmed", "checked_in"] } })
      .populate("studentId", "fullName studentCode email")
      .populate({
        path: "roomId",
        select: "roomNumber displayName",
        populate: { path: "building", select: "name" },
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
  }
  getMaintenanceQueue() {
    return Ticket.find().sort({ createdAt: -1 }).limit(4).lean();
  }

  async getMaintenanceStats() {
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = { completed: 0, inProgress: 0, pending: 0, urgent: 0, total: 0 };
    stats.forEach((s) => {
      const st = (s._id || "").toLowerCase();
      if (st === "completed" || st === "resolved" || st === "hoàn tất") {
        result.completed += s.count;
      } else if (st === "in_progress" || st === "assigned" || st === "đang xử lý") {
        result.inProgress += s.count;
      } else if (st === "pending" || st === "approved" || st === "open" || st === "chờ xử lý") {
        result.pending += s.count;
      } else if (st === "urgent" || st === "khẩn cấp") {
        result.urgent += s.count;
      } else {
        result.pending += s.count;
      }
      result.total += s.count;
    });

    // Count rooms with maintenance status as well
    const maintenanceRoomsCount = await Room.countDocuments({
      status: { $in: ["maintenance", "MAINTENANCE"] },
    });

    if (maintenanceRoomsCount > 0 && result.total === 0) {
      result.pending = maintenanceRoomsCount;
      result.total = maintenanceRoomsCount;
    }

    return result;
  }
}

module.exports = new DashboardRepository();
