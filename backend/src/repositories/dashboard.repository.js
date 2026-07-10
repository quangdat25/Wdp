const User = require("../models/user.model");
const Room = require("../models/room.models");
const Building = require("../models/building.model");
const Ticket = require("../models/ticket.model");
const Booking = require("../models/booking.model");
const Invoice = require("../models/invoice.model");
const Notification = require("../models/notification.model");

class DashboardRepository {
  countStudents() {
    return User.countDocuments({ role: "student" });
  }

  countAllRooms() {
    return Room.countDocuments();
  }

  countRoomsByStatus(status) {
    return Room.countDocuments({ status });
  }

  countPendingTickets() {
    return Ticket.countDocuments({ status: "pending" });
  }

  getMonthlyRevenue() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Invoice.aggregate([
      { $match: { status: "paid", paidAt: { $gte: startOfMonth, $lt: startOfNextMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);
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

  countPendingBookings() {
    return Booking.countDocuments({ status: "pending" });
  }

  countMaintenanceRooms() {
    return Room.countDocuments({ status: "maintenance" });
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
    return Booking.find({ status: "pending" })
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
      if (s._id === "completed") result.completed = s.count;
      else if (s._id === "in_progress" || s._id === "assigned") result.inProgress += s.count;
      else if (s._id === "pending") result.pending += s.count;
      // We don't have an explicit 'urgent' flag, but we can aggregate
      result.total += s.count;
    });
    return result;
  }
}

module.exports = new DashboardRepository();

