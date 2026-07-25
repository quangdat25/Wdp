const cron = require("node-cron");
const invoiceRepository = require(
  "../repositories/invoice.repository",
);

const TIMEZONE = "Asia/Ho_Chi_Minh";

const getVNDateString = (date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const getVNStartOfDay = (date = new Date()) => {
  const vnDateString = getVNDateString(date);

  return new Date(`${vnDateString}T00:00:00+07:00`);
};

const updateInvoiceOverdueJob = () => {
  cron.schedule(

    "0 0 * * *",
    async () => {
      try {
        const startOfToday = getVNStartOfDay();

        const result =
          await invoiceRepository.updateExpiredInvoicesToOverdue(
            startOfToday,
          );
      } catch (error) {
        console.error(
          "[CRON] Lỗi khi cập nhật trạng thái hóa đơn overdue:",
          error,
        );
      }
    },
    {
      timezone: TIMEZONE,
    },
  );
};

module.exports = updateInvoiceOverdueJob;