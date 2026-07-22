const cron = require("node-cron");
const bookingRepository = require("../repositories/booking.repository");

const autoDeleteExpiredBookings = () => {
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        const result =
          await bookingRepository.deleteExpiredPendingBookings();

        if (result.deletedBookings > 0 || result.deletedInvoices > 0) {
          console.log(
            `Deleted ${result.deletedBookings} expired bookings and ${result.deletedInvoices} related invoices.`,
          );
        }
      } catch (error) {
        console.error("Auto delete expired bookings error:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    },
  );
};

module.exports = autoDeleteExpiredBookings;