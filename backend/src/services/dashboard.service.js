const dashboardRepository = require("../repositories/dashboard.repository");
const Invoice = require("../models/invoice.model");

class DashboardService {
  async getDashboardData() {
    const [
      totalStudents,
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      pendingTickets,
      revenueResult,
      pendingBookings,
      totalPersonnel,
      activePersonnel,
      notifications,
      maintenanceTickets,
      buildings,
      occData,
      bookingRequests,
      maintenanceStats,
    ] = await Promise.all([
      dashboardRepository.countStudents(),
      dashboardRepository.countAllRooms(),
      dashboardRepository.countRoomsByStatus("occupied"),
      dashboardRepository.countRoomsByStatus("available"),
      dashboardRepository.countRoomsByStatus("maintenance"),
      dashboardRepository.countPendingTickets(),
      dashboardRepository.getMonthlyRevenue(),
      dashboardRepository.countPendingBookings(),
      dashboardRepository.countTotalPersonnel(),
      dashboardRepository.countActivePersonnel(),
      dashboardRepository.getRecentNotifications(),
      dashboardRepository.getMaintenanceQueue(),
      dashboardRepository.getBuildingsWithStats(),
      dashboardRepository.getOccupancySeries(),
      dashboardRepository.getBookingRequests(),
      dashboardRepository.getMaintenanceStats(),
    ]);

    const [occTotalRooms, occOccupiedRooms, allActiveBookings] = await Promise.all([
      occData.totalRooms,
      occData.occupiedRooms,
      occData.allActiveBookings,
    ]);

    const currentOccupancyRate =
      occTotalRooms > 0 ? Math.round((occOccupiedRooms / occTotalRooms) * 100) : 0;

    // Build 12-month occupancy series from cumulative active bookings
    const now = new Date();
    const totalCapacity = occTotalRooms * 4;
    const occupancySeries = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const label = `T${month}`;

      // End of this month
      const monthEnd = new Date(year, month, 0, 23, 59, 59);

      // Count all bookings that had checked in by this month's end
      let activeCount = 0;
      for (const b of allActiveBookings) {
        const checkIn = b.checkInDate || b.createdAt;
        if (checkIn && new Date(checkIn) <= monthEnd) {
          activeCount++;
        }
      }

      // Rate = active students / total capacity
      const rate =
        totalCapacity > 0
          ? Math.min(100, Math.round((activeCount / totalCapacity) * 100))
          : 0;

      occupancySeries.push({ label, value: rate });
    }

    // Building stats with occupancy per building
    const buildingStats = await Promise.all(
      buildings.map(async (b) => {
        const stats = await dashboardRepository.getBuildingBedStats(b._id);
        const total = stats.totalBeds;
        const occupied = stats.occupiedBeds;

        return {
          _id: b._id,
          name: `Khu ${b.name}`,
          occupied,
          total,
          available: total - occupied,
          rate: total > 0 ? Math.round((occupied / total) * 100) : 0,
        };
      }),
    );

    const monthlyRevenue =
      revenueResult.length > 0
        ? { total: revenueResult[0].total, count: revenueResult[0].count }
        : { total: 0, count: 0 };

    // Format recent activities from notifications & tickets
    const recentActivities = notifications.map((n) => ({
      title: n.title || "Thông báo mới",
      time: n.createdAt
        ? new Date(n.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--:--",
      note: n.content
        ? n.content.length > 80
          ? n.content.slice(0, 80) + "..."
          : n.content
        : "",
    }));

    const maintenanceQueue = maintenanceTickets.map((t) => ({
      room: t.roomNumber || "--",
      issue: t.title || t.type || "Bảo trì",
      status:
        t.status === "pending"
          ? "Chờ xử lý"
          : t.status === "assigned" || t.status === "in_progress"
            ? "Đang xử lý"
            : t.status === "completed"
              ? "Hoàn tất"
              : t.status || "Chờ",
    }));

    // Fetch corresponding invoices to get the amount
    const bookingIds = bookingRequests.map(b => b._id);
    const invoices = await Invoice.find({ bookingId: { $in: bookingIds }, type: "room_fee" }).lean();
    const invoiceMap = {};
    invoices.forEach(inv => invoiceMap[inv.bookingId.toString()] = inv.amount);

    // Format booking requests for table
    const formattedBookings = bookingRequests.map((b) => {
      const buildingName = b.roomId?.building?.name || "";
      const initials = b.studentId?.fullName
        ? b.studentId.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
        : "--";
      return {
        id: b._id,
        initials,
        name: b.studentId?.fullName || "Unknown",
        code: b.studentId?.studentCode || "--",
        room: b.roomId?.roomNumber || "--",
        building: buildingName ? buildingName : "--",
        semester: b.semester || "--",
        date: b.createdAt
          ? new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "--",
        status: b.status === "pending" ? "Chờ thanh toán" : b.status === "confirmed" ? "Đã thanh toán" : b.status === "checked_in" ? "Đang ở" : b.status,
        statusColor:
          b.status === "pending"
            ? { bg: "#fef3c7", color: "#92400e" }
            : b.status === "confirmed" || b.status === "approved"
              ? { bg: "#dcfce7", color: "#166534" }
              : { bg: "#fee2e2", color: "#991b1b" },
        amount: invoiceMap[b._id.toString()] || 0,
      };
    });

    return {
      students: { total: totalStudents, active: totalStudents },
      occupancy: {
        rate: currentOccupancyRate,
        totalRooms: occTotalRooms,
        occupiedRooms: occOccupiedRooms,
        availableRooms,
        maintenanceRooms,
      },
      pendingTickets,
      monthlyRevenue: {
        total: monthlyRevenue.total,
        count: monthlyRevenue.count,
      },
      occupancySeries,
      buildings: buildingStats,
      alerts: {
        pendingBookings,
        maintenanceRooms,
        activePersonnel,
        totalPersonnel,
      },
      recentActivities:
        recentActivities.length > 0
          ? recentActivities
          : [
              {
                title: "Chưa có hoạt động",
                time: "--:--",
                note: "Hệ thống chưa ghi nhận hoạt động nào.",
              },
            ],
      bookingRequests: formattedBookings,
      maintenanceQueue:
        maintenanceQueue.length > 0
          ? maintenanceQueue
          : [{ room: "--", issue: "Không có yêu cầu", status: "--" }],
      maintenanceStats,
    };
  }
}

module.exports = new DashboardService();
